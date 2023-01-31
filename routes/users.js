const {validateNewUser, validateUserUpdates, validatePassword} = require('../middleware/data-validation/users');
const { getUserById, createNewUser, getUserOrders, cancelUserOrder, updateUser, changeUserPassword } = require('../controllers/users');
const pool = require('../db/index');
const express = require('express');
const userRouter = express.Router();
const logger = require('../logging/index');
const authenticate = require('../middleware/authentication/authenticate');

// returns all users
userRouter.get('/account', authenticate, getUserById);
userRouter.get('/account/orders', authenticate, getUserOrders);
userRouter.post('/register', validateNewUser, createNewUser);
userRouter.put('/account', authenticate, validateUserUpdates, updateUser);
userRouter.put('/account/password', authenticate, validatePassword, changeUserPassword );
userRouter.delete('/account/orders/:id', authenticate, cancelUserOrder);


module.exports = userRouter;