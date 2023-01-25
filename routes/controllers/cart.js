require('dotenv').config();
const pool = require('../../db/index');

const getUserCart = async (req, res) => {
  const user_id = req.user.id;
  const cart = await pool.query(`
    SELECT cart.user_id, cart.item_id, items.product_id, products.name, items.size, cart.quantity, products.price FROM cart
    JOIN items
    ON cart.item_id = items.item_id
    JOIN products
    ON items.product_id = products.product_id
    WHERE user_id = $1
  `, [user_id]);
  const response = cart.rows;
  res.status(200).send(response);
};

const updateCartItems = async (req, res) => {
  const user_id = req.user.id;
  const array = req.body; // [{item_id: 2, quantity: 4}, {item_id: 1, quantity: 4}]
  try {
    let updates = array.map((obj) => {
      if(obj.quantity == 0) {
        return pool.query("DELETE FROM cart WHERE item_id = $1 AND user_id = $2", [obj.item_id, user_id]);
      } else {
        return pool.query("UPDATE cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3", [obj.quantity, user_id, obj.item_id]);
      } 
    });
    await Promise.all(updates);
    return res.status(200).send("Cart updated.")
  } catch (error) {
    return res.status(400).send(error.message)
  }
};

const deleteAllItems = async (req, res) => {
  const user_id = req.user.id;
  await pool.query("DELETE FROM cart WHERE user_id = $1", [user_id]);
  return res.status(200).send("All items removed.");
};

const createNewOrder = async (req, res) => {
  const user_id = req.user.id;
  const { street1, street2, city, state, zipcode } = req.address; 
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let addressId;

    const checkAddress = await client.query("SELECT address_id FROM addresses WHERE street_address_1 = $1 AND street_address_2 = $2 AND city = $3 AND state = $4 AND zipcode = $5",
      [street1, street2, city, state, zipcode]
    );

    if(checkAddress.rows.length === 0) {
      const addAddress = await client.query("INSERT INTO addresses (street_address_1, street_address_2, city, state, zipcode) VALUES ($1, $2, $3, $4, $5) RETURNING address_id", 
        [street1, street2, city, state, zipcode]
      );
      addressId = addAddress.rows[0].address_id;
    } else {
      addressId = checkAddress.rows[0].address_id;
    };
    
    const cartItems = await client.query(
      `SELECT cart.item_id, cart.quantity, products.price::numeric FROM cart
      JOIN items
      ON cart.item_id = items.item_id
      JOIN products
      ON items.product_id = products.product_id
      WHERE user_id = $1`,
      [user_id]
    );

    let prices = [];
    cartItems.rows.map(obj => prices.push(obj.quantity * obj.price));

    const itemTotal = prices.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const free_shipping = itemTotal > 75;

    const order_total = free_shipping ? itemTotal : itemTotal + 10.99;

    const newOrder = await client.query("INSERT INTO orders (user_id, address_id, free_shipping, order_total) VALUES ($1, $2, $3, $4) RETURNING order_id", [user_id, addressId, free_shipping, order_total]);
    cartItems.rows.map(obj => client.query("INSERT INTO orders_items (order_id, item_id, quantity) VALUES ($1, $2, $3)", [newOrder.rows[0].order_id, obj.item_id, obj.quantity]));
    cartItems.rows.map(obj => client.query("UPDATE items SET number_in_stock = number_in_stock - $1 WHERE item_id = $2", [obj.quantity, obj.item_id]));
    await client.query("DELETE FROM cart WHERE user_id = $1", [user_id]);
    await client.query('COMMIT');
    res.status(201).send("Order placed.");
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).send('Something went wrong');
  } finally {
    client.release();
  };
};

module.exports = { getUserCart, updateCartItems, deleteAllItems, createNewOrder };