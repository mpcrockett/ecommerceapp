const Joi = require('joi');

module.exports = Joi.object({
  category: Joi.string()
    .valid('Pants', 'Shoes', 'Tops', 'Accessories', 'Socks')
    .required(),
  name: Joi.string()
    .min(3)
    .max(100)
    .required(),
  description: Joi.string()
    .min(3)
    .max(250)
    .required(),
  gender: Joi.string()
    .valid('Women', 'Men', 'Unisex'),
  price: Joi.number()
    .integer(),
  brand: Joi.string()
    .min(2)
    .max(50)
    .required()
});