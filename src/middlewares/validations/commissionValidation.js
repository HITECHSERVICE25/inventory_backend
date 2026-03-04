const { param, body } = require('express-validator');

exports.validateCommissionCreate = [
  body('technicianId')
    .isMongoId()
    .withMessage('Invalid technician ID')
    .exists({ checkFalsy: true })
    .withMessage('Technician ID is required'),
  
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID')
    .exists({ checkFalsy: true })
    .withMessage('Product ID is required'),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number')
    .exists({ checkFalsy: true })
    .withMessage('Commission amount is required')
];

exports.validateCommissionUpdate = [
  param('technicianId')
    .isMongoId()
    .withMessage('Invalid technician ID'),
  
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number')
    .exists({ checkFalsy: true })
    .withMessage('Commission amount is required')
];