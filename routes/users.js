const validateNewUser = require('./middleware/data-validation/users');
const { getUserByUsername, createNewUser } = require('./controllers/users');
const pool = require('../db/index');
const express = require('express');
const userRouter = express.Router();
const logger = require('../logging/index');

// returns all users
userRouter.get('/:username', getUserByUsername);
userRouter.post('/register', validateNewUser, createNewUser);


module.exports = userRouter;