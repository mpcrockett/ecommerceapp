const {validateNewUser, validateUserUpdates, validatePassword} = require('./middleware/data-validation/users');
const { getUserById, createNewUser, getUserOrders, cancelUserOrder, updateUser, changeUserPassword } = require('./controllers/users');
const pool = require('../db/index');
const express = require('express');
const userRouter = express.Router();
const logger = require('../logging/index');
const authenticate = require('./middleware/authentication/authenticate');

// returns all users
userRouter.get('/:username', authenticate, getUserById);
userRouter.get('/:username/orders', authenticate, getUserOrders);
userRouter.post('/register', validateNewUser, createNewUser);
userRouter.put('/:username/update-profile', authenticate, validateUserUpdates, updateUser);
userRouter.put('/:username/update-password', authenticate, validatePassword, changeUserPassword );
userRouter.delete('/:username/orders/:id', authenticate, cancelUserOrder);


module.exports = userRouter;