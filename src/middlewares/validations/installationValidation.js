const { body } = require('express-validator');

exports.validateChargeUpdate = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Valid positive number required')
];