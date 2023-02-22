require('dotenv').config();
const pool = require('../db/index');
const Cart = require('../models/Cart');
const Item = require('../models/Item');
const Product = require('../models/Product');

module.exports = {
  async createNewProduct(req,res) {
    const product = new Product(req.product);
    await product.createNewProduct();
    return res.status(201).send("Product created.");
  },
  async updateProduct(req, res) {
    const product_id = req.params.id;
    const updates = req.body;
    const product = new Product({product_id, ...updates});
    await product.updateProductById();
    return res.status(201).send('Product updated.')
  },
  async getAllProducts(req, res) {
    const products = await Product.getAllProducts();
    return res.status(200).send(products);
  },
  async getProductById(req, res) {
    let product = await Product.getProductById(req.params.id);
    if(!product) return res.status(400).send("Product not found.");
    const items = await Item.getItemsByProductId(req.params.id);
    product.items = items;
    return res.status(200).send(product);
  },
  async addItemsToInventory(req, res) {
    const item = new Item(req.item);
    await item.addItemsToInventory();
    res.status(201).send("Items added.");
  },
  async addItemToCart(req, res) {
    const { user_id } = req.user;
    const { item_id, quantity } = req.body;
    const item = new Item({item_id, quantity});
    const numberInStock = await item.getNumberInStock();
    if(numberInStock < quantity) return res.status(400).send("Insuffient stock.");
    const cart = new Cart({ user_id, items: [{...item, quantity}] });
    await cart.addItemToCart();
    res.status(201).send("Added to cart.");
  },
  async deleteProductById(req, res) {
    await Product.deleteProductById(req.params.id)
    res.status(200).send("Product deleted.");
  }
};










