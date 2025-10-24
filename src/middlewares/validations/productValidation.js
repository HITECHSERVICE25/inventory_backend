const { body, param } = require('express-validator');

exports.validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Product name must be less than 100 characters'),
  body('unitOfMeasure')
  .trim()
  .notEmpty().withMessage('Unit of Measure is required')
  .isLength({ max: 100 }).withMessage('Unit of Measure must be less than 100 characters'),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('totalCount')
    .isInt({ min: 0 }).withMessage('Available count must be a non-negative integer')
];

exports.validateUpdateProduct = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Product name must be less than 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('totalCount')
    .optional()
    .isInt({ min: 0 }).withMessage('Available count must be a non-negative integer')
];