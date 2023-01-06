const Joi = require('joi');
const productSchema = require('./productSchema');

const validateNewProduct = (req, res, next) => {
  const { catagory, name, description, gender, price } = req.body;
  
  const newProduct = {
    catagory,
    name,
    description,
    gender, 
    price
  };

  const { error, value } = productSchema.validate(newProduct);

  if(error) return res.status(400).send(error.message);

  req.product = newProduct;
  
  next();
};

module.exports = validateNewProduct;