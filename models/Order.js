const pool = require('../db/index');

module.exports = class Order {
  static async getOrderStatusById(order_id) {
    await pool.query("SELECT order_status FROM orders WHERE order_id = $1", [order_id]);
    const { order_status } = order.rows[0];
    return order_status;
  }

  static async cancelOrderById(order_id) {
    const client = await pool.connect();
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
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      return false;
    } finally {
      client.release();
    }
  }
  
};
