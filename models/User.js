const pool = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = class User {

  static async getUserById(user_id) {
    const user = await pool.query("SELECT username, first_name, last_name, email, birthday, loyalty_acct FROM users WHERE user_id = $1", [user_id]);
    return user.rows[0];
  }

  static async getUserIdByUsername(username) {
    let user = await pool.query("SELECT user_id FROM users WHERE username = $1", [username]);
    return user.rows;
  }

  static async getUserIdByEmail(email) {
    let user = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);
    return user.rows;
  }

  static async createNewUser(user) {
    const { username, password, first_name, last_name, email } = user;

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
  
    const newUser = await pool.query("INSERT INTO users (username, password, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING user_id",
     [username, encryptedPassword, first_name, last_name, email]
    );

    const user_id = newUser.rows[0].user_id;
    return user_id;
  }

  static async updateUserById(user) {
    const { user_id, username, first_name, last_name, birthday } = user;
    await pool.query("UPDATE users SET first_name = $1, last_name = $2, birthday = $3 WHERE username = $4 AND user_id = $5", 
    [first_name, last_name, birthday, username, user_id]);
  }

  static async getUserOrdersById(user_id) {
    const orders = await pool.query(
      `SELECT orders.order_id, addresses.address_id, orders.order_total, orders_items.quantity,
       products.name, orders.shipped, orders.completed, orders.processing, items.size, items.color
       FROM orders JOIN addresses ON orders.address_id = addresses.address_id
       JOIN orders_items ON orders.order_id = orders_items.order_id
       JOIN items ON orders_items.item_id = items.item_id
       JOIN products ON items.product_id = products.product_id
       WHERE orders.user_id = $1`, [user_id]
    );

    const response = orders.rows.reduce((acc, obj) => {
      let newObj;
      const { order_id, address_id, order_total, quantity, name, shipped, completed, processing, size, color } = obj;
      if (acc[order_id]) {
        newObj = {...acc};
        newObj[order_id].items = [...newObj[order_id].items, { name, quantity, size, color}];
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
            size,
            color
          }]
        }};
      };
      return newObj;
    }, {});

    return response;
  }

  static async generateUserAccessToken(user) {
    const { user_id, username } = user;
    const getAdmin = await pool.query("SELECT is_admin FROM users WHERE user_id = $1", [user_id]);
    const { is_admin } = getAdmin.rows[0];
    const token = jwt.sign({ user_id, username, is_admin }, process.env.JWTPRIVATEKEY);
    return token;
  }

  static async validateUserPassword(username, password) {
    const user = await pool.query("SELECT password FROM users WHERE username = $1", [username]);
    const userPassword = user.rows[0].password;
    const validPassword = await bcrypt.compare(password, userPassword);
    return validPassword;
  }

  static async updateUserPassword(username, password) {
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    await pool.query("UPDATE users SET password = $1 WHERE username = $2", [encryptedPassword, username]);
  }
};