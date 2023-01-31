const jwt = require('jsonwebtoken');
require('dotenv').config();

function authorize(req, res, next) {
  const token = req.header('x-auth-token');
  const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
  if(decoded.admin) next();
  return res.status(403).send("Access Denied.")
};

module.exports = authorize;