const Joi = require('joi');

module.exports = Joi.object({
  product_id: Joi.number()
    .integer()
    .required(),
  size: Joi.string()
    .max(10)
    .required(),
  number_in_stock: Joi.number()
    .integer()
    .required(),
  color: Joi.string()
    .max(25)
    .required()
});