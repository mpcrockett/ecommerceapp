const Joi = require('joi');
const cartSchema = require('./schemas/cartSchema');

const validateCart = (req, res, next) => {
  const cartItems = req.body;
  
  if(cartItems.isArray()) {
    cartItems.map((obj) => {
      const { error, value } = cartSchema.validate(obj);
      if (error) return res.status(400).send(error.message);
    }
  )} else {
    const { error, value } = cartSchema.validate(cartItems);
    if (error) return res.status(400).send(error.message);
  };

  req.cart = cartItems;
  
  next();
};

module.exports = validateCart;