require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../db/index');
const User = require('../models/User');

module.exports = async (req, res) => {
  const user = new User(req.body);
  const validPassword = await user.validateUserPassword();

  if(validPassword) {
    const user_id = await user.getUserIdByUsername();
    user.user_id = user_id;
    const token = await user.generateUserAccessToken();
    return res.header('x-auth-token', token).status(200).send("Logged In");
  } 

  return res.status(401).send("Invalid username or password.");
};

