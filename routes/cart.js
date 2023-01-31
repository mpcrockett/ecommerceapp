const express = require('express');
const { getUserCart, updateCartItems, deleteAllItems, createNewOrder } = require('../controllers/cart');
const cartRouter = express.Router();
const authenticate = require('../middleware/authentication/authenticate');
const validateAddress = require('../middleware/data-validation/address');

// authenticates user
cartRouter.get('/', authenticate, getUserCart);
cartRouter.put('/update', authenticate, updateCartItems);
cartRouter.delete('/', authenticate, deleteAllItems);
cartRouter.post('/order', authenticate, validateAddress, createNewOrder);


module.exports = cartRouter;