const express = require('express');
const cart = require('../controllers/cart');
const cartRouter = express.Router();
const authenticate = require('../middleware/authentication/authenticate');
const validateAddress = require('../middleware/data-validation/address');

// authenticates user
cartRouter.get('/', authenticate, cart.getUserCart);
cartRouter.delete('/', authenticate, cart.deleteAllItems);
cartRouter.put('/update', authenticate, cart.updateCartItems);
cartRouter.post('/order', authenticate, validateAddress, cart.placeNewOrder);


module.exports = cartRouter;