const Joi = require('joi');

module.exports = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(50)
    .required(),
  last_name: Joi.string()
    .min(2)
    .max(50)
    .required(),
  street_one: Joi.string()
    .min(4)
    .max(50)
    .required(),
  street_two: Joi.string()
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