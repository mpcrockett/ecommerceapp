const pool = require('../db/index');
const logger = require('../logging/index');

module.exports = class Cart {
  constructor(cartObj) {
    this.user_id = cartObj.user_id;
    this.items = cartObj.items;
    this.cart_total = cartObj.cart_total;
    this.free_shipping = cartObj.free_shipping;
  }
  
  async addItemToCart() {
    const item = this.items[0];
    const checkIfAlreadyAdded = await pool.query("SELECT * FROM cart WHERE user_id = $1 AND item_id = $2", [this.user_id, item.item_id]);
    if(checkIfAlreadyAdded.rows.length > 0) {
      await pool.query("UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND item_id = $3", [item.quantity, this.user_id, item.item_id]);
      return
    };
    await pool.query("INSERT INTO cart(user_id, item_id, quantity) VALUES ($1, $2, $3)", [this.user_id, item.item_id, item.quantity]);
  }

  async getCartByUserId() {
    const cartItems = await pool.query(`
      SELECT cart.user_id, cart.item_id, items.product_id, products.name, items.size, cart.quantity, products.price::numeric FROM cart
      JOIN items
      ON cart.item_id = items.item_id
      JOIN products
      ON items.product_id = products.product_id
      WHERE user_id = $1`, 
      [this.user_id]
    );

    if(cartItems.rows.length === 0) return false;

    let items = [];
    cartItems.rows.map(item => items.push({
      item_id: item.item_id,
      product_id: item.product_id,
      name: item.name,
      size: item.size,
      quantity: item.quantity
    }));
    this.items = items;

    let prices = [];
    cartItems.rows.map(obj => prices.push(obj.quantity * obj.price));
    const itemTotal = prices.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    //setting free shipping
    this.free_shipping = itemTotal > 75;
    //setting the order total (no taxes)
    this.order_total = this.free_shipping ? itemTotal : itemTotal + 10.99;

    return this;
  }

  async updateCartItems() {
    const queries = this.items.map(item => {
      let string = "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3"
      let params = [item.quantity, this.user_id, item.item_id];
      if(item.quantity === 0) {
        string = "DELETE FROM cart WHERE user_id = $1 AND item_id = $2";
        params = [this.user_id, item.item_id];
      };
      const db = pool.query(string, params);
      return db
    });
    const result = await Promise.all(queries);
    return result;
  }

  async deleteAllCartItems() {
    await pool.query("DELETE FROM cart WHERE user_id = $1", [this.user_id]);
  }
};