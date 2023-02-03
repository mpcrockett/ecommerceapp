const pool = require('../db/index');

module.exports = class Product {
  constructor(obj) {
    this.product_id = obj.product_id;
    this.category_id = obj.category;
    this.category = obj.category;
    this.name = obj.name;
    this.description = obj.description;
    this.gender = obj.gender;
    this.price = obj.price;
    this.brand = obj.brand;
  }

  async createNewProduct() {
    const getCategoryId = await pool.query("SELECT category_id FROM categories WHERE name = $1", [this.category]);
    this.category_id = getCategoryId.rows[0].category_id;
    const product = await pool.query("INSERT INTO products (category_id, name, description, gender, price, brand) VALUES ($1, $2, $3, $4, $5, $6) RETURNING product_id",
      [this.category_id, this.name, this.description, this.gender, this.price, this.brand]); 
    this.product_id = product.rows[0].product_id;
    return;
  }

  async updateProductById() {
    await pool.query("UPDATE products SET category_id = $1, description = $2, name = $3, gender = $4, price = $5, brand = $6 WHERE product_id = $7",
      [this.category_id, this.description, this.name, this.gender, this.price, this.brand, this.product_id]);
    return;
  }

  static async getAllProducts() {
    const products = await pool.query("SELECT name, description, gender, price, brand FROM products");
    return products.rows;
  }

  static async getProductById(product_id) {
    const product = await pool.query("SELECT name, description, gender, price, brand FROM products WHERE product_id = $1", [product_id]);
    return product.rows.length === 0 ? false : product.rows[0];
  }

  static async deleteProductById(product_id) {
    await pool.query("DELETE FROM products WHERE product_id = $1" , [product_id]);
    return;
  }
  //for testing
  static async deleteAllProducts() {
    await pool.query("DELETE FROM products WHERE product_id > 4");
    return;
  }
};