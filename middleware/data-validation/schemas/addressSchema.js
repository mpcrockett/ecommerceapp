const Joi = require('joi');

module.exports = Joi.object({
  street1: Joi.string()
    .min(4)
    .max(50)
    .required(),
  street2: Joi.string()
    .max(50),
  city: Joi.string()
    .min(3)
    .max(50)
    .required(),
  state: Joi.string()
    .max(2)
    .required(),
  zipcode: Joi.string()
    .max(9)
    .required()
});