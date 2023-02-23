const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function authorize(req, res, next) {
  const token = req.header('x-auth-token');
  const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
  if(decoded.is_admin) return next();
  return res.status(403).send("Access Denied.")
};

