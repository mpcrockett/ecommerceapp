const jwt = require('jsonwebtoken');
require('dotenv').config();

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied.');

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    next();
  } 
  catch (ex) {
    res.status(400).send('Invalid token.');
  }
};

module.exports = auth;