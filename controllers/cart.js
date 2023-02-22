require('dotenv').config();
const pool = require('../db/index');
const Address = require('../models/Address');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

module.exports = {
  async getUserCart(req, res) {
    const cart = new Cart({ user_id: req.user.user_id });
    const userCart = await cart.getCartByUserId();
    if (!userCart) return res.status(200).send("Cart is empty.");
    res.status(200).send(userCart);
  },
  async updateCartItems(req, res) {
    const cart = new Cart({ user_id: req.user.user_id, items: req.body });
    const updated = await cart.updateCartItems();
    if (!updated) {
      return res.status(500).send("Something went wrong.")
    } else {
      return res.status(200).send("Cart updated.")
    };
  },
  async deleteAllItems(req, res) {
    const cart = new Cart({ user_id: req.user.id });
    await cart.deleteAllCartItems();
    // hello
    return res.status(200).send("All items removed.");
  },
  async placeNewOrder(req, res) {
    const { user_id } = req.user;
    const cart = new Cart({ user_id });
    const address = new Address(req.body);
    const order = new Order({ user_id });
    
    const addressExists = await address.getAddressId();
    if (addressExists) {
      order.address_id = addressExists;
    } else {
      await address.createNewAddress();
      order.address_id = address.address_id;
    };
    
    const { items, order_total, free_shipping } = await cart.getCartByUserId();
    order.items = items;
    order.order_total = order_total;
    order.free_shipping = free_shipping;
    
    const orderPlaced = await order.createNewOrder();
    if (orderPlaced) {
      return res.status(201).send("Order placed.")
    } else {
      return res.status(500).send("Something went wrong.")
    };
  }
};