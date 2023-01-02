const express = require('express');
const { login } = require('./controllers/login');
const { getAllProducts, getProductById, createNewProduct, getItemsByProductId, addItemToCart, deleteProductById, addItemsToInventory } = require('./controllers/products');
const validateNewProduct = require('./middleware/data-validation/products');
const validateNewItem = require('./middleware/data-validation/item');
const productRouter = express.Router();

// authenticates user
productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductById);
productRouter.get('/:id/items', getItemsByProductId);
productRouter.post('/', validateNewProduct, createNewProduct);
productRouter.post('/:id', validateNewItem, addItemsToInventory);
productRouter.post('/:id/items/add-to-cart', addItemToCart);
productRouter.delete('/:id', deleteProductById);


module.exports = productRouter;