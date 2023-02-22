const pool = require('../db/index');
const Address = require("../models/Address");
const Cart = require("../models/Cart");

module.exports = class Order {
  constructor(obj) {
    this.order_id = obj.order_id;
    this.user_id = obj.user_id;
    this.address_id = obj.address_id;
    this.items = obj.items;
    this.free_shipping = obj.free_shipping;
    this.order_status = obj.order_status;
    this.order_total = obj.order_total;
  }
  
  async createNewOrder() {
    const client = await pool.connect();
    let success;
    try {
      await client.query('BEGIN');
      const newOrder = await client.query("INSERT INTO orders (user_id, address_id, free_shipping, order_total) VALUES($1, $2, $3, $4) RETURNING order_id",
      [this.user_id, this.address_id, this.free_shipping, this.order_total]);
      this.order_id = newOrder.rows[0].order_id;
      this.items.map(obj => client.query("INSERT INTO orders_items (order_id, item_id, quantity) VALUES ($1, $2, $3)", [this.order_id, obj.item_id, obj.quantity]));
      //updating inventory numbers
      this.items.map(obj => client.query("UPDATE items SET number_in_stock = number_in_stock - $1 WHERE item_id = $2", [obj.quantity, obj.item_id]));
      await client.query("DELETE FROM cart WHERE user_id = $1", [this.user_id]);
      await client.query('COMMIT');
      success = true;
    } catch (e) {
      await client.query('ROLLBACK');
      await client.query("DELETE FROM addresses WHERE address_id = $1", [this.address_id]);
      success = false;
    } finally {
      client.release();
      return success;
    };
  };
  
  async getOrderByOrderId() {
    let order = await pool.query(`SELECT orders.order_id, orders.free_shipping, addresses.address_id, orders.order_total::numeric::money, orders_items.quantity,
    products.name, products.brand, products.gender, products.price, orders.order_status, items.size, items.color
    FROM orders JOIN addresses ON orders.address_id = addresses.address_id
    JOIN orders_items ON orders.order_id = orders_items.order_id
    JOIN items ON orders_items.item_id = items.item_id
    JOIN products ON items.product_id = products.product_id
    WHERE orders.order_id = $1`, [this.order_id]
    );
    
    const result = order.rows;
    this.address_id = result[0].address_id;
    this.free_shipping = result[0].free_shipping;
    this.order_total = result[0].order_total;
    this.order_status = result[0].order_status;
    this.items = result.map(obj =>  ({name: obj.name, brand: obj.brand, price: obj.price, gender: obj.gender, size: obj.size, color: obj.color, quantity: obj.quantity}) );
    return this;
  };
  
  static async getOrderStatusById(order_id) {
    const order =  await pool.query("SELECT order_status FROM orders WHERE order_id = $1", [order_id]);
    const { order_status } = order.rows[0];
    return order_status;
  };
  
  static async cancelOrderById(order_id) {
    const client = await pool.connect();
    let success;
    try {
      await client.query('BEGIN');
      const order = await client.query(
        `SELECT orders.order_id, orders_items.quantity, orders_items.item_id FROM orders
        JOIN orders_items ON orders.order_id = orders_items.order_id
        JOIN items ON orders_items.item_id = items.item_id
        WHERE orders.order_id = $1`, [order_id]
        );
        await client.query("UPDATE orders SET order_status = $1 WHERE order_id = $2", ['canceled', order_id]);
        await client.query("UPDATE orders SET date_canceled = CURRENT_TIMESTAMP WHERE order_id = $1", [order_id]);
        order.rows.map(obj => client.query("UPDATE items SET number_in_stock = number_in_stock + $1 WHERE item_id = $2", [obj.quantity, obj.item_id]));
        await client.query('COMMIT');
        success = true;
      } catch (e) {
        await client.query('ROLLBACK');
        success = false;
      } finally {
        client.release();
        return success;
      }
    };
//for testing
    static async deleteAllOrders() {
      await pool.query("DELETE FROM orders WHERE order_id > 0");
      return;
    };
  };
