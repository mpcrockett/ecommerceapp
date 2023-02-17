require('dotenv').config();
const productionLogger = require('./productionLogger');
const developmentLogger = require('./developmentLogger');
const winston = require('winston');

let logger;

if(process.env.NODE_ENV == 'development' || process.env.NODE_ENV === "test") {
  logger = developmentLogger();
} else {
  logger = productionLogger();
}
module.exports = logger;