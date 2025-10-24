const { body } = require('express-validator');

exports.validateRecordPayment = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Valid payment amount is required and must be at least 1'),
  body('method')
    .isIn(['cash', 'check', 'online', 'bank_transfer'])
    .withMessage('Valid payment method is required'),
  body('reference')
    .if(body('method').not().equals('cash'))
    .notEmpty()
    .withMessage('Reference is required for non-cash payments'),
  body('reference')
    .if(body('method').equals('cash'))
    .optional()
    .isLength({ max: 0 })
    .withMessage('Reference should not be provided for cash payments'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];