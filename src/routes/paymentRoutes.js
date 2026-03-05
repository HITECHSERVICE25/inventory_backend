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

router.get('/balances', protect, paymentController.getAllTechniciansWithBalances);

router.get('/export', protect, paymentController.exportPayments);
router.get('/summary', protect, paymentController.getPaymentSummary);

// Get single payment details by ID
router.get(
  '/:paymentId',
  protect,
  paymentController.getPaymentDetails
);



module.exports = router;