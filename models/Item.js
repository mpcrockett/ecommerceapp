const pool = require("../db");

module.exports = class Item {
  constructor(itemObj) {
    this.item_id = itemObj.item_id;
    this.product_id = itemObj.product_id;
    this.size = itemObj.size;
    this.number_in_stock = itemObj.number_in_stock;
    this.color = itemObj.color;
  }

  static async getItemsByProductId(product_id) {
    const items = await pool.query("SELECT * FROM items WHERE product_id = $1", [product_id]);
    return items.rows.length === 0 ? false : items.rows;
  }

  async addItemsToInventory() {
    const checkForItem = await pool.query("SELECT item_id, size, color, number_in_stock FROM items WHERE product_id = $1", [this.product_id]);
    const result = checkForItem.rows.find(row => row.size === this.size && row.color === this.color);

    if(result) {
      const newQuantity = this.number_in_stock + result.number_in_stock;
      await pool.query("UPDATE items SET number_in_stock = $1 WHERE item_id = $2", [newQuantity, result.item_id]);
    } else {
      await pool.query("INSERT INTO items (product_id, size, number_in_stock) VALUES ($1, $2, $3)", [this.product_id, this.size, this.number_in_stock]);
    };
  }

  async getNumberInStock() {
    const result = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1", [this.item_id]);
    return result.rows[0].number_in_stock;
  }
};