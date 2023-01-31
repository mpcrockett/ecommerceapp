const Joi = require('joi');

module.exports = Joi.object({
  user_id: Joi.number()
    .integer()
    .required(),
  address_id: Joi.string()
    .integer()
    .required(),
  shipping_method: Joi.string()
    .max(25)
    .required(),
  free_shipping: Joi.boolean(),
  order_total: Joi.number()
    .integer()
    .required()
});