const Joi = require('joi');
const addressSchema = require('./schemas/addressSchema');

const validateAddress = (req, res, next) => {
  
  const { first_name, last_name, street_one, street_two, city, state, zipcode } = req.body;
  
  const newAddress = { first_name, last_name, street_one, street_two, city, state, zipcode };

  const { error, value } = addressSchema.validate(newAddress);

  if(error) return res.status(400).send(error.message);

  req.address = newAddress;
  
  next();
};

module.exports = validateAddress;