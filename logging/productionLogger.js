const { format, createLogger, transports } = require('winston');
const { timestamp, combine, errors, json } = format;

const produtionLogger = () => {
  return new createLogger({
    level: 'info',
    format: combine( timestamp(), errors({ stack: true }), json()),
    defaultMeta: { service: 'user-service' },
    transports: [
      new transports.File({
      filename: './logging/combined.log',
      level: 'info'
    }),
    new transports.File({
      filename: './logging/errors.log',
      level: 'error'
    })
    ],
    exceptionHandlers: [
      new transports.File({ filename: './logging/exceptions-prod.log' })
    ]
  })
};

module.exports = produtionLogger;