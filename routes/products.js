const express = require('express');
const { login } = require('../controllers/login');
const { getAllProducts, getProductById, createNewProduct, addItemToCart, deleteProductById, addItemsToInventory, updateProduct } = require('../controllers/products');
const validateProduct = require('../middleware/data-validation/products');
const validateItem = require('../middleware/data-validation/item');
const authenticate = require('../middleware/authentication/authenticate');
const authorize = require('../middleware/authorization/authorize');
const productRouter = express.Router();

// authenticates user
productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductById);
productRouter.post('/', authorize, validateProduct, createNewProduct);
productRouter.post('/:id', authorize, validateItem, addItemsToInventory);
productRouter.post('/:id/items/add-to-cart', authenticate, addItemToCart);
productRouter.put('/:id', authorize, validateProduct, updateProduct);
productRouter.delete('/:id', authorize, deleteProductById);


module.exports = productRouter;