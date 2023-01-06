require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../db/index');
const logger = require('../../logging/index');

const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  const { rows } = await pool.query("SELECT first_name, last_name, email, birthday, loyalty_acct FROM users WHERE username = $1", [username]);
  if(rows.length === 0) return res.status(404).send('User not found.');
  return res.json(rows).status(200);
};

const createNewUser = async (req, res) => {
  const { username, password, first_name, last_name, email } = req.body;
  let user = await pool.query("SELECT username FROM users WHERE email = $1", [email]);
  if(user.rows.length !== 0) return res.status(400).send("This email address is already registered.");

  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password, salt);

  await pool.query("INSERT INTO users (username, password, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5)",
   [username, encryptedPassword, first_name, last_name, email]);

  const id = await pool.query("SELECT user_id FROM users WHERE username = $1", [username]);
  const token = jwt.sign({ id: user.rows[0].user_id, username: username }, process.env.JWTPRIVATEKEY);

  res.header('x-auth-token', token).status(201).send(username);
};

const getUserOrders = async (req, res) => {
  const { username } = req.params;

  const userId = await pool.query("SELECT user_id FROM users WHERE username = $1");

  const orders = await pool.query("SELECT * FROM orders ")
  return true;
};

module.exports = { getUserByUsername , createNewUser, getUserOrders };