const winston = require('winston');
require('express-async-errors');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.json()),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'logfile.log '}),
    new winston.transports.Console()
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'exception.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'rejections.log' }),
  ]
});

module.exports = logger;