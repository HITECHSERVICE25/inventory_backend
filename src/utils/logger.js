const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, json, errors } = winston.format;
// Add this at the top of logger.js
const fs = require('fs');
const path = require('path');

// Ensure log directories exist
const logDir = path.join(__dirname, '../logs');
const auditDir = path.join(logDir, '.audit');

[logDir, auditDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const createLogger = (env) => {
  // Common format for all transports
  const baseFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    errors({ stack: true }),
    json()
  );

  // Configure transports based on environment
  const transports = [
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'info',
      format: baseFormat,
      auditFile: 'logs/.audit/rotate-audit.json',
      utc: true
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d',
      level: 'error',
      format: baseFormat
    })
  ];

  // Add console transport in non-production environments
  if (env !== 'production') {
    transports.push(new winston.transports.Console({
      level: 'debug',
      format: combine(
        winston.format.colorize(),
        winston.format.printf(info => {
          const stack = info.stack ? `\n${info.stack}` : '';
          return `${info.timestamp} [${info.level}]: ${info.message}${stack}`;
        })
      )
    }));
  }

  // Create logger instance
  const logger = winston.createLogger({
    level: 'info',
    format: baseFormat,
    transports,
    exceptionHandlers: [
      new DailyRotateFile({
        filename: 'logs/exceptions-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '90d'
      })
    ],
    rejectionHandlers: [
      new DailyRotateFile({
        filename: 'logs/rejections-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '90d'
      })
    ],
    exitOnError: false
  });

  // Add rotation event listeners
  transports.forEach(transport => {
    if (transport instanceof DailyRotateFile) {
      transport.on('rotate', (oldFilename, newFilename) => {
        logger.info('Log rotation triggered', {
          event: 'rotation',
          oldFile: oldFilename,
          newFile: newFilename
        });
      });
    }
  });

  return logger;
};

module.exports = createLogger(process.env.NODE_ENV || 'development');