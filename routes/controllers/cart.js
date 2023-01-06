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
      return pool.query("UPDATE cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3", [obj.quantity, user_id, obj.item_id]);
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

module.exports = { getUserCart, updateCartItems, deleteAllItems };