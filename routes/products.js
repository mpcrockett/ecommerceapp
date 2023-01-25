const express = require('express');
const { login } = require('./controllers/login');
const { getAllProducts, getProductById, createNewProduct, getItemsByProductId, addItemToCart, deleteProductById, addItemsToInventory } = require('./controllers/products');
const validateNewProduct = require('./middleware/data-validation/products');
const validateNewItem = require('./middleware/data-validation/item');
const authenticate = require('./middleware/authentication/authenticate');
const authorize = require('./middleware/authorize/authorize');
const productRouter = express.Router();

// authenticates user
productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductById);
productRouter.get('/:id/items', getItemsByProductId);
productRouter.post('/', authorize, validateNewProduct, createNewProduct);
productRouter.post('/:id', authorize, validateNewItem, addItemsToInventory);
productRouter.post('/:id/items/add-to-cart', authenticate, addItemToCart);
productRouter.delete('/:id', authorize, deleteProductById);


module.exports = productRouter;