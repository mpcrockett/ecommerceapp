const express = require('express');
const login = require('../controllers/login');
const products = require('../controllers/products');
const validateProduct = require('../middleware/data-validation/products');
const validateItem = require('../middleware/data-validation/item');
const authenticate = require('../middleware/authentication/authenticate');
const authorize = require('../middleware/authorization/authorize');
const productRouter = express.Router();
// authenticates user
productRouter.get('/', products.getAllProducts);
productRouter.post('/', authorize, validateProduct, products.createNewProduct);
productRouter.get('/:id', products.getProductById);
productRouter.post('/:id', authorize, validateItem, products.addItemsToInventory);
productRouter.put('/:id', authorize, validateProduct, products.updateProduct);
productRouter.delete('/:id', authorize, products.deleteProductById);
productRouter.post('/:id/items/add-to-cart', authenticate, products.addItemToCart);

module.exports = productRouter;