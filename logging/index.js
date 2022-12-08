const productionLogger = require('./productionLogger');
const developmentLogger = require('./developmentLogger');
const winston = require('winston');

let logger = productionLogger();

if(process.env.NODE_ENV == 'development') logger = developmentLogger();

module.exports = logger;