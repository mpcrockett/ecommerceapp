const winston = require('winston');
const { combine, timestamp, json, errors } = winston.format;

const developmentLogger = () => {
  return winston.createLogger({
    level: 'debug',
    format: combine(errors({ stack: true }), timestamp(), json()),
    transports: [new winston.transports.Console()],
    exceptionHandlers: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
      new winston.transports.File({ filename: './logging/dev-logs/exception-dev.log' }),
    ],
    rejectionHandlers: [
      new winston.transports.File({ filename: './logging/dev-logs/rejections-dev.log' })
    ]
  });
}

module.exports = developmentLogger;