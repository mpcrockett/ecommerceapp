require('dotenv').config();
const pool = require('../db/index');

const createNewProduct = async (req,res) => {
  const { catagory, name, description, gender } = req.product;
  const getcatagoryId = await pool.query("SELECT catagory_id FROM catagories WHERE name = $1", [catagory]);
  const catagoryId = getcatagoryId.rows[0].catagory_id;
  await pool.query("INSERT INTO products (catagory_id, name, description, gender) VALUES ($1, $2, $3, $4)", [catagoryId, name, description, gender]);
  return res.status(201).send(req.product);
}; 

const getAllProducts = async (req, res) => {
  const products = await pool.query("SELECT * FROM products");
  const results = products.rows;
  return res.status(200).send(results);
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await pool.query("SELECT * FROM products WHERE product_id = $1", [id]);
  const result = product.rows;
  return res.status(200).send(result);
};

const getItemsByProductId = async (req, res) => {
  const product_id = req.params.id;
  const items = await pool.query("SELECT size, number_in_stock FROM items WHERE product_id = $1", [product_id]);
  const result = items.rows;
  return res.status(200).send(result);
};

const addItemsToInventory = async (req, res) => {
  const { product_id, size, number_in_stock, color } = req.product;

  const checkForItem = await pool.query("SELECT * FROM items WHERE product_id = $1", [product_id]);
  const result = checkForItem.rows.find(row => row.size === size && row.color === color);

  if(result) {
    const newQuantity = number_in_stock + result.number_in_stock;
    await pool.query("UPDATE items SET number_in_stock = $1 WHERE item_id = $2", [newQuantity, result.item_id]);
    return res.status(200).send("Quantity updated.");
  };

  await pool.query("INSERT INTO items (product_id, size, number_in_stock) VALUES ($1, $2, $3)", [product_id, size, number_in_stock]);
  res.status(201).send("Item added.");
};

const addItemToCart = async (req, res) => {
  const user_id = req.user.id;
  const { item_id, quantity } = req.body;
  const numberInStock = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1", [item_id]);
  if(numberInStock < quantity) return res.status(400).send("Insuffient stock.");

  const checkIfAlreadyAdded = await pool.query("SELECT * FROM cart WHERE user_id = $1 AND item_id = $2", [user_id, item_id]);

  if(checkIfAlreadyAdded.rows.length > 0){
    await pool.query("UPDATE cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3", [quantity, user_id, item_id]);
    return res.status(201).send("Quantity updated.")
  };

  await pool.query("INSERT INTO cart(user_id, item_id, quantity) VALUES ($1, $2, $3)", [user_id, item_id, quantity]);
  res.status(201).send("Added to cart.");
};

const deleteProductById = async (req, res) => {
  const product_id = req.params.id;
  await pool.query("DELETE FROM products WHERE product_id = $1", [product_id]);
  res.status(200).send("Product deleted.");
};

module.exports = { 
  createNewProduct,
  getAllProducts,
  getProductById, 
  getItemsByProductId,
  addItemToCart,
  deleteProductById,
  addItemsToInventory
};