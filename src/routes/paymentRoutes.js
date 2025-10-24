const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { 
  validateRecordPayment
} = require('../middlewares/validations/paymentValidation');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post(
  '/technicians/:technicianId/payments',
  protect,
  authorize('admin', 'manager'),
  validateRecordPayment,
  paymentController.recordPayment
);

router.get(
  '/technicians/:technicianId/balance',
  protect,
  authorize('admin', 'manager', 'technician'),
  paymentController.getOutstandingBalance
);

router.get(
  '/technicians/:technicianId/payments',
  protect,
  authorize('admin', 'manager', 'technician'),
  paymentController.getPaymentHistory
);

router.get(
  '/technicians/balances',
  protect,
  authorize('admin', 'accountant'),
  paymentController.getAllTechniciansWithBalances
);

router.get(
  '/payments',
  protect,
  authorize('admin', 'manager', 'accountant'),
  paymentController.getAllPayments
);

// Get single payment details by ID
router.get(
  '/:paymentId',
  protect,
  authorize('admin', 'manager', 'accountant', 'technician'),
  paymentController.getPaymentDetails
);

router.get('/balances', protect, paymentController.getAllTechniciansWithBalances);


module.exports = router;