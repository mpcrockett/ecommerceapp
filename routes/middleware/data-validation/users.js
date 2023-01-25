const Joi = require('joi');
const { newUserSchema, userUpdatesSchema, passwordSchema } = require('./schemas/userSchemas');


const validateNewUser = (req, res, next) => {
  const { username, password, first_name, last_name, email } = req.body;
  const newUser = {
    username,
    password,
    first_name,
    last_name,
    email
  };

  const { error, value } = newUserSchema.validate(newUser);

  if(error) return res.status(400).send(error.message);

  req.user = newUser;
  
  next();
};

const validateUserUpdates = (req, res, next) => {
  const { first_name, last_name, email } = req.body;
  const userUpdates = {first_name, last_name, email };

  const { error, value } = userUpdatesSchema.validate(updatedUser);

  if(error) return res.status(400).send(error.message);

  req.userUpdates = userUpdates;

  next();
};

const validatePassword = (req, res, next) => {
  const { password1, password2 } = req.body;
  if (password1 !== password2) return res.status(400).send("New password does not match.");

  const { error, value } = passwordSchema.validate(password1);

  if(error) return res.status(400).send(error.message);

  next();
};

module.exports = { validateNewUser, validateUserUpdates, validatePassword };