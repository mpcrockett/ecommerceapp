const Joi = require('joi');
const userSchema = require('./schemas/userSchema');

const validateNewUser = (req, res, next) => {
  const { username, password, first_name, last_name, email } = req.body;
  const newUser = {
    username,
    password,
    first_name,
    last_name,
    email
  };

  const { error, value } = userSchema.validate(newUser);

  if(error) return res.status(400).send(error.message);

  req.user = newUser;
  
  next();
};

module.exports = validateNewUser;