const Joi = require('joi');
const addressSchema = require('./schemas/addressSchema');

const validateAddress = (req, res, next) => {
  
  const { street1, street2, city, state, zipcode } = req.body;
  
  const newAddress = {
   street1,
   street2,
   city,
   state,
   zipcode
  };

  const { error, value } = addressSchema.validate(newAddress);

  if(error) return res.status(400).send(error.message);

  req.address = newAddress;
  
  next();
};

module.exports = validateAddress;