const express = require('express');
const { getUserCart, updateCartItems, deleteAllItems, createNewOrder } = require('./controllers/cart');
const cartRouter = express.Router();
const auth = require('./middleware/authentication/auth');
const validateAddress = require('./middleware/data-validation/address');

// authenticates user
cartRouter.get('/', auth, getUserCart);
cartRouter.put('/update', auth, updateCartItems);
cartRouter.delete('/', auth, deleteAllItems);
cartRouter.post('/order', auth, validateAddress, createNewOrder);


module.exports = cartRouter;