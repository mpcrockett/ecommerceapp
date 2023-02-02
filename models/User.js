const pool = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = class User {
  constructor(userObj) {
    this.user_id = userObj.user_id;
    this.username = userObj.username;
    this.password = userObj.password;
    this.email = userObj.email;
    this.first_name = userObj.first_name;
    this.last_name = userObj.last_name;
    this.birthday = userObj.birthday;
    this.loyalty_acct = userObj.loyalty_acct;
    this.new_password = userObj.new_password;
  };

  async getUserById() {
    const user = await pool.query("SELECT username, first_name, last_name, email, birthday, loyalty_acct FROM users WHERE user_id = $1", [this.user_id]);
    return user.rows[0];
  }

  async getUserIdByUsername() {
    let user = await pool.query("SELECT user_id FROM users WHERE username = $1", [this.username]);
    return user.rows.length === 0 ? false : user.rows[0].user_id;
  }

  async getUserIdByEmail() {
    let user = await pool.query("SELECT user_id FROM users WHERE email = $1", [this.email]);
    return user.rows.length === 0 ? false : user.rows[0].user_id;
  }

  async createNewUser() {
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(this.password, salt);
  
    const newUser = await pool.query("INSERT INTO users (username, password, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING user_id",
     [this.username, encryptedPassword, this.first_name, this.last_name, this.email]
    );

    this.user_id = newUser.rows[0].user_id;
  }

  async updateUserById() {
    await pool.query("UPDATE users SET first_name = $1, last_name = $2, birthday = $3 WHERE username = $4 AND user_id = $5", 
    [this.first_name, this.last_name, this.birthday, this.username, this.user_id]);
  }

  async generateUserAccessToken() {
    const getAdmin = await pool.query("SELECT is_admin FROM users WHERE user_id = $1", [this.user_id]);
    const is_admin = getAdmin.rows[0].is_admin;
    const token = jwt.sign({ user_id: this.user_id, username: this.username, is_admin: is_admin }, process.env.JWTPRIVATEKEY);
    return token;
  }

  async validateUserPassword() {
    const user = await pool.query("SELECT password FROM users WHERE username = $1", [this.username]);
    const userPassword = user.rows[0].password;
    const validPassword = await bcrypt.compare(this.password, userPassword);
    return validPassword;
  }

  async updateUserPassword() {
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(this.new_password, salt);
    await pool.query("UPDATE users SET password = $1 WHERE username = $2", [encryptedPassword, this.username]);
  }

  static async getUserOrdersById(user_id) {
    const orders = await pool.query("SELECT order_id, order_total, free_shipping, order_status FROM orders WHERE user_id = $1", [user_id]);
    return orders.rows ? orders.rows : false;
    
  }

  static async deleteUserById(user_id) {
    await pool.query("DELETE FROM users WHERE user_id = $1", [user_id]);
  }
};