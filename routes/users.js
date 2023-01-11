const validateNewUser = require('./middleware/data-validation/users');
const { getUserById, createNewUser, getUserOrders } = require('./controllers/users');
const pool = require('../db/index');
const express = require('express');
const userRouter = express.Router();
const logger = require('../logging/index');
const auth = require('./middleware/authentication/auth');

// returns all users
userRouter.get('/profile', auth, getUserById);
userRouter.get('/profile/orders', auth, getUserOrders);
userRouter.post('/register', validateNewUser, createNewUser);


module.exports = userRouter;