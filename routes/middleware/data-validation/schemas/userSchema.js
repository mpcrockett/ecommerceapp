const Joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

module.exports = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  password: joiPassword
    .string()
    .minOfSpecialCharacters(2)
    .minOfLowercase(2)
    .minOfNumeric(2)
    .noWhiteSpaces()
    .required(),
  first_name: Joi.string()
    .min(3)
    .max(25)
    .required(),
  last_name: Joi.string()
    .min(3)
    .max(25)
    .required(),
  email: Joi.string().email().required(),
});