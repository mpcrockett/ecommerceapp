const getUserByUsername = require('../controllers/users');
const pool = require('../db/index');
const express = require('express');
const userRouter = express.Router();
const logger = require('../logging/index');

// returns all users
userRouter.get('/:username', getUserByUsername);


module.exports = userRouter;