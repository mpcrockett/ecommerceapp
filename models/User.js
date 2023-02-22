const pool = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = class User {
  constructor(obj) {
    this.user_id = obj.user_id;
    this.username = obj.username;
    this.password = obj.password;
    this.email = obj.email;
    this.first_name = obj.first_name;
    this.last_name = obj.last_name;
    this.birthday = obj.birthday;
    this.loyalty_acct = obj.loyalty_acct;
    this.new_password = obj.new_password;
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
    const is_admin = this.is_admin || getAdmin.rows[0].is_admin;
    const token = jwt.sign({ user_id: this.user_id, username: this.username, is_admin }, process.env.JWTPRIVATEKEY);
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
    return orders.rows.length > 0 ? orders.rows : false;
  }

  static async deleteUserById(user_id) {
    await pool.query("DELETE FROM users WHERE user_id = $1", [user_id]);
    return;
  }
  //for testing
  static async deleteAllUsers() {
    await pool.query("DELETE FROM users WHERE user_id > 0");
  }
};