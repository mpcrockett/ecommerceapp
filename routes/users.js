const {validateNewUser, validateUserUpdates, validatePassword} = require('../middleware/data-validation/users');
const users = require('../controllers/users');
const express = require('express');
const userRouter = express.Router();
const authenticate = require('../middleware/authentication/authenticate');
const authorize = require('../middleware/authorization/authorize');

// returns all users
userRouter.get('/account', authenticate, users.getUserById);
userRouter.get('/account/orders', authenticate, users.getUserOrders);
userRouter.get('/account/orders/:id', authenticate, users.getUserOrder);
userRouter.post('/register', validateNewUser, users.createNewUser);
userRouter.put('/account', authenticate, validateUserUpdates, users.updateUser);
userRouter.put('/account/password', authenticate, validatePassword, users.changeUserPassword );
userRouter.delete('/account/orders/:id', authenticate, users.cancelUserOrder);
userRouter.delete('/:id', authorize, users.deleteUserById);


module.exports = userRouter;