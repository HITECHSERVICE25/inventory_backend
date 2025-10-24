const { body, param } = require('express-validator');

exports.validateCreateTechnician = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('email').isEmail().normalizeEmail(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pincode').optional().isPostalCode('IN'),
  body('aadhaar').isNumeric().isLength({ min: 12, max: 12 }),
  body('pan').matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
  body('serviceRate').isFloat({ min: 0 }),
  body('companies').optional().isArray(),
  body('companies.*').isMongoId()
];

exports.validateUpdateTechnician = [
  param('id').isMongoId(),
  body('phone').optional().isMobilePhone('en-IN'),
  body('email').optional().isEmail(),
  body('serviceRate').optional().isFloat({ min: 0 }),
  body('isBlocked').optional().isBoolean()
];