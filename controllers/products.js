require('dotenv').config();
const pool = require('../db/index');
const Cart = require('../models/Cart');
const Item = require('../models/Item');
const Product = require('../models/Product');

const createNewProduct = async (req,res) => {
  const product = new Product(req.product);
  await product.createNewProduct();
  return res.status(201).send("Product created.");
};

const updateProduct = async (req, res) => {
  const product_id = req.params.id;
  const updates = req.body;
  const product = new Product({product_id, ...updates});
  await product.updateProductById();
}

const getAllProducts = async (req, res) => {
  const products = await Product.getAllProducts();
  return res.status(200).send(products);
};

const getProductById = async (req, res) => {
  let product = await Product.getProductById(req.params.id);
  const items = await Item.getItemsByProductId(req.params.id);
  if(!product) return res.status(400).send("Product not found.");
  product.items = items;
  return res.status(200).send(product);
};

const addItemsToInventory = async (req, res) => {
  const item = new Item(req.item);
  await item.addItemsToInventory();
  res.status(201).send("Items added.");
};

const addItemToCart = async (req, res) => {
  const { user_id } = req.user;
  const { item_id, quantity } = req.body;
  const item = new Item({item_id, quantity});
  const numberInStock = await item.getNumberInStock();
  if(numberInStock < quantity) return res.status(400).send("Insuffient stock.");

  const cart = new Cart({ user_id, items: [{...item, quantity}] });
  await cart.addItemToCart();

  res.status(201).send("Added to cart.");
};

const deleteProductById = async (req, res) => {
  await Product.deleteProductById(req.params.id)
  res.status(200).send("Product deleted.");
};

module.exports = { 
  createNewProduct,
  getAllProducts,
  getProductById, 
  addItemToCart,
  deleteProductById,
  addItemsToInventory,
  updateProduct
};