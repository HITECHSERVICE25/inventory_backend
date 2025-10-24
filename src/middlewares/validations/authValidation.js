const { query, body, check, validationResult, param } = require('express-validator');
const  logger  = require('../../utils/logger');
const User = require('../../models/User');

// Common validation rules
const emailValidation = body('email')
  .trim()
  .normalizeEmail()
  .isEmail().withMessage('Please provide a valid email address');

const passwordValidation = body('password')
  .isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  .withMessage('Password must be at least 8 characters with at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol');

// Registration validation
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
  
  emailValidation.custom(async (value) => {
    const user = await User.findOne({ email: value });
    if (user) {
      throw new Error('Email already in use');
    }
  }),
  
  passwordValidation,
  
  body('role')
    .optional()
    .isIn(['admin', 'supervisor', 'user']).withMessage('Invalid role specified'),

  (req, res, next) => handleValidation(req, res, next)
];

// Login validation
exports.validateLogin = [
  body('email')
  .trim()
  .normalizeEmail()
  .isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => handleValidation(req, res, next)
];

// Forgot password validation
exports.validateForgotPassword = [
  emailValidation,
  (req, res, next) => handleValidation(req, res, next)
];

// Reset password validation
exports.validateResetPassword = [
  passwordValidation,
  check('resettoken').notEmpty().withMessage('Reset token is required'),
  (req, res, next) => handleValidation(req, res, next)
];

exports.validateGetUsers = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().matches(/^[a-zA-Z0-9_,\s-]+$/),
    (req, res, next) => handleValidation(req, res, next)
  ];

// Update user validation (admin)
exports.validateUpdateUser = [
  param('id')
    .isMongoId().withMessage('Invalid user ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('Please provide a valid email address')
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });
      if (user && user._id.toString() !== req.params.id) {
        throw new Error('Email already in use');
      }
    }),
  
  body('password')
    .optional()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage('Password must be at least 8 characters with at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol'),
  
  body('role')
    .optional()
    .isIn(['admin', 'supervisor', 'user']).withMessage('Invalid role specified'),
  
  // Check that at least one field is provided
  body().custom((value, { req }) => {
    const { name, email, password, role } = req.body;
    if (!name && !email && !password && !role) {
      throw new Error('At least one field must be provided for update');
    }
    return true;
  }),
  
  (req, res, next) => handleValidation(req, res, next)
];

// Reusable validation handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      errors: errors.array(),
      endpoint: req.originalUrl,
      body: req.body
    });

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      }
    });
  }
  next();
};

