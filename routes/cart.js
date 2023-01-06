const express = require('express');
const { getUserCart, updateCartItems, deleteAllItems } = require('./controllers/cart');
const cartRouter = express.Router();
const auth = require('./middleware/authentication/auth');

// authenticates user
cartRouter.get('/', auth, getUserCart);
cartRouter.put('/update', auth, updateCartItems);
cartRouter.delete('/', auth, deleteAllItems);


module.exports = cartRouter;