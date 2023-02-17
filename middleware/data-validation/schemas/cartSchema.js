const Joi = require('joi');

module.exports = Joi.object({
  item_id: Joi.string()
    .required(),
  quantity: Joi.number()
    .integer()
    .required()
 
});