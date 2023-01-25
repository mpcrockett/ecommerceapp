require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../db/index');
const logger = require('../../logging/index');

const getUserById = async (req, res) => {
  const user_id = req.user.id;
  const { rows } = await pool.query("SELECT first_name, last_name, email, birthday, loyalty_acct FROM users WHERE user_id = $1", [user_id]);
  if(rows.length === 0) return res.status(404).send('User not found.');
  return res.json(rows).status(200);
};

const createNewUser = async (req, res) => {
  const { username, password, first_name, last_name, email } = req.user;

  let user = await pool.query("SELECT username FROM users WHERE username = $1", [username]);
  if(!user.rows.length) return res.status(400).send("This username is taken.");

  user = await pool.query("SELECT username FROM users WHERE email = $1", [email]);
  if(!user.rows.length) return res.status(400).send("This email address is already registered.");
  
  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const newUser = await pool.query("INSERT INTO users (username, password, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING user_id",
   [username, encryptedPassword, first_name, last_name, email]
  );

  const token = jwt.sign({ id: newUser.rows[0].user_id, username }, process.env.JWTPRIVATEKEY);

  res.header('x-auth-token', token).status(201).send(username);
};

const updateUser = async (req, res) => {
  const { first_name, last_name, email } = req.userUpdates;
  const { username, id } = req.user;

  let user = await pool.query("SELECT username FROM users WHERE email = $1 AND user_id < $2", [email, id]);
  if(!user.rows.length) return res.status(400).send("This email address is registered."); // in real life, this would be email verification with a sent code

  await pool.query("UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE username = $4 AND user_id = $5", 
  [first_name, last_name, email, username, id]);

  res.status(200).send("User updated.");
};

const changeUserPassword = async (req, res) => {
  const { currentPassword, password1 } = req.body;
  const { id } = req.user;
  const passwordQuery = await pool.query("SELECT password FROM users WHERE user_id = $1", [id]);
  const userPassword = passwordQuery.rows[0];

  const validPassword = await bcrypt.compare(currentPassword, userPassword);

  if(!validPassword) return res.status(400).send("Password incorrect.");

  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password1, salt);

  await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [encryptedPassword, id]);

  res.status(200).send("Password updated.");
};

const getUserOrders = async (req, res) => {
  const user_id = req.user.id;
  const orders = await pool.query(
    `SELECT orders.order_id, addresses.address_id, orders.order_total, orders_items.quantity,
     products.name, orders.shipped, orders.completed, orders.processing, items.size
     FROM orders JOIN addresses ON orders.address_id = addresses.address_id
     JOIN orders_items ON orders.order_id = orders_items.order_id
     JOIN items ON orders_items.item_id = items.item_id
     JOIN products ON items.product_id = products.product_id
     WHERE orders.user_id = $1`, [user_id]
  );

  if(!orders.rows.length) return res.status(404).send("No orders found.");

  const response = orders.rows.reduce((acc, obj) => {
    let newObj;
    const { order_id, address_id, order_total, quantity, name, shipped, completed, processing, size } = obj;
    if (acc[order_id]) {
      newObj = {...acc};
      newObj[order_id].items = [...newObj[order_id].items, { name, quantity, size}];
    } else {
      newObj = {...acc, [order_id]: { 
        address_id,
        order_total,
        shipped,
        completed,
        processing,
        items: [{
          name,
          quantity,
          size
        }]
      }};
    };
    return newObj;
  }, {});

  return res.status(200).send(response);
};

const cancelUserOrder = async (req, res) => {
  const order_id = req.params.id;
  const order = await pool.query("SELECT processing FROM orders WHERE order_id = $1", [order_id]);
  if(!order.rows[0]) return res.status(404).send("Unable to cancel order.");

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const order = await client.query(
      `SELECT orders.order_id, orders_items.quantity, orders_items.item_id FROM orders
       JOIN orders_items ON orders.order_id = orders_items.order_id
       JOIN items ON orders_items.item_id = items.item_id
       WHERE orders.order_id = $1`, [order_id]
    );
    await client.query("UPDATE orders SET processing = $1 WHERE order_id = $2", [false, order_id]);
    await client.query("UPDATE orders SET date_canceled = CURRENT_TIMESTAMP WHERE order_id = $1", [order_id]);
    order.rows.map(obj => client.query("UPDATE items SET number_in_stock = number_in_stock + $1 WHERE item_id = $2", [obj.quantity, obj.item_id]));
    await client.query('COMMIT');
    res.status(201).send("Order canceled.");
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).send('Something went wrong.');
  } finally {
    client.release();
  };
};

module.exports = { getUserById , createNewUser, getUserOrders, cancelUserOrder, updateUser, changeUserPassword };