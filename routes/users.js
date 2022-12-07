const getAllUsers = require('../methods/users');
const pool = require('../db/index');
const express = require('express');
const userRouter = express.Router();
const logger = require('../logging/logger');

// returns all users
userRouter.get('/', async (req, res) => {
  const result = await getAllUsers();
  res.send(result);
});


module.exports = userRouter;