const Joi = require('joi');
const { newUserSchema, userUpdatesSchema, passwordSchema } = require('./schemas/userSchemas');


const validateNewUser = (req, res, next) => {
  const { username, password, first_name, last_name, email, birthday } = req.body;
  const newUser = {
    username,
    password,
    first_name,
    last_name,
    email, 
    birthday
  };

  const { error, value } = newUserSchema.validate(newUser);

  if(error) return res.status(400).send(error.message);

  req.user = newUser;
  
  next();
};

const validateUserUpdates = (req, res, next) => {
  const { first_name, last_name, birthday } = req.body;
  const updatedUser = { first_name, last_name, birthday };

  const { error, value } = userUpdatesSchema.validate(updatedUser);

  if(error) return res.status(400).send(error.message);

  req.updatedUser = updatedUser;

  next();
};

const validatePassword = (req, res, next) => {
  const { current_password, password_one, password_two } = req.body;
  if (password_one !== password_two) return res.status(400).send("New password entries do not match.");

  const { error } = passwordSchema.validate({ password: password_one });

  if(error) return res.status(400).send(error.message);

  req.current_password = current_password;
  req.new_password = password_one;
  next();
};

module.exports = { validateNewUser, validateUserUpdates, validatePassword };