require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../db/index');
const Users = require('../models/User');

const login = async (req, res) => {
  const { username, password } = req.body;

  const validPassword = await Users.validateUserPassword(username, password);

  if(validPassword) {
    const user_id = await Users.getUserIdByUsername(username);
    const token = await Users.generateUserAccessToken({user_id, username});
    return res.header('x-auth-token', token).status(200).send(username);
  } 

  return res.status(401).send("Invalid username or password.");
};

module.exports = { login };