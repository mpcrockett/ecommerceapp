const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/users');

module.exports = function(app) {
  app.use(cors());
  app.use(express.json());
  app.use('/api/users', userRouter);
};