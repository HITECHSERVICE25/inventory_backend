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
  validateRecordPayment,
  paymentController.recordPayment
);

router.get(
  '/technicians/:technicianId/balance',
  protect,
  paymentController.getOutstandingBalance
);

router.get(
  '/technicians/:technicianId/payments',
  protect,
  paymentController.getPaymentHistory
);

router.get(
  '/technicians/balances',
  protect,
  paymentController.getAllTechniciansWithBalances
);

router.get(
  '/payments',
  protect,
  paymentController.getAllPayments
);

// Get single payment details by ID
router.get(
  '/:paymentId',
  protect,
  paymentController.getPaymentDetails
);

router.get('/balances', protect, paymentController.getAllTechniciansWithBalances);


module.exports = router;