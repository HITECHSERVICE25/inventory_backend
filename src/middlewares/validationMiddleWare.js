const { body, validationResult } = require('express-validator');
const logger  = require('../utils/logger');

// Validation schema for example creation
const validateCreateExample = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),

  // Sanitization
  body('name').escape(),
  body('description').escape(),

  // Validation handler
  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      logger.warn('Validation failed', {
        errors: errors.array(),
        method: req.method,
        url: req.originalUrl,
        body: req.body
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array().map(err => ({
            field: err.param,
            message: err.msg
          }))
        }
      });
    }
    
    next();
  }
];

module.exports = {
  validateCreateExample
};