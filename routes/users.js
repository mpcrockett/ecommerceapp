const pool = require('../db/db');
const express = require('express');
const jwt = require('jsonwebtoken');
const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
  console.log('Connected');
  res.send('it worked');
});

module.exports = userRouter;