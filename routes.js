const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const productRouter = require('./routes/products');

module.exports = function(app) {
  app.use(cors());
  app.use(express.json());
  app.use('/login', loginRouter);
  app.use('/api/users', userRouter);
  app.use('/api/products', productRouter);
};