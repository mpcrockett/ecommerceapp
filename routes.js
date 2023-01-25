const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const productRouter = require('./routes/products');
const cartRouter = require('./routes/cart');

module.exports = function(app) {
  app.use(cors());
  app.use(express.json());
  app.use('/api/login', loginRouter);
  app.use('/api/users', userRouter);
  app.use('/api/products', productRouter);
  app.use('/api/cart', cartRouter);
};