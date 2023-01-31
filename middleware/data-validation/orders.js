const Joi = require('joi');
const orderSchema = require('./schemas/orderSchema');

const validateNewOrder = (req, res, next) => {
  const product_id = req.params.id;
  const { size, number_in_stock, color } = req.body;
  
  const newItem = {
    product_id,
    size,
    number_in_stock,
    color
  };

  const { error, value } = orderSchema.validate(newItem);

  if(error) return res.status(400).send(error.message);

  req.product = newItem;
  
  next();
};

module.exports = validateNewOrder;