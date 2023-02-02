const Joi = require('joi');
const productSchema = require('./schemas/productSchema');

const validateProduct = (req, res, next) => {
  const { category, name, description, gender, price, brand } = req.body;
  
  const newProduct = {
    category,
    name,
    description,
    gender, 
    price, 
    brand
  };

  const { error, value } = productSchema.validate(newProduct);

  if(error) return res.status(400).send(error.message);

  req.product = newProduct;
  
  next();
};

module.exports = validateProduct;