const logger  = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // console.log("err-------------------------", err.statusCode, res.statusCode);
  const statusCode = err.statusCode || res.statusCode || 500;
  const logData = {
    message: err.message,
    stack: err.stack,
    status: statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  };

  // Log differently based on status code
  if (statusCode >= 500) {
    logger.error('Server Error', logData);
  } else if (statusCode >= 400) {
    logger.warn('Client Error', logData);
  } else {
    logger.info('Application Error', logData);
  }

  // Error response
  res.status(statusCode).json({
    error: {
      code: statusCode,
      message: statusCode >= 500 ? 'Internal Server Error' : err.message,
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      })
    }
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  
  logger.warn('Route Not Found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    attemptedAt: new Date().toISOString()
  });

  next(error);
};

module.exports = {
  errorHandler,
  notFound
};