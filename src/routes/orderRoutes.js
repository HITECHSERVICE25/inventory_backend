const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');


// route for fetching draft orders
router.get(
  '/drafts',
  protect,
  authorize('admin', 'manager'),
  orderController.getDraftOrders
);

// Draft Orders
router.post(
  '/drafts',
  protect,
  authorize('admin', 'manager'),
  orderController.createDraftOrder
);

// Update Draft Order
router.patch(
  '/drafts/:id',
  protect,
  authorize('admin', 'manager'),
  orderController.updateDraftOrder
);

// Order Completion
router.put(
  '/:id/complete',
  protect,
  authorize('admin', 'manager'),
  orderController.completeOrder
);

// Discount Approval
router.patch(
  '/:id/approve-discount',
  protect,
  authorize('admin', 'supervisor'),
  orderController.approveDiscount
);

// Discount Rejection
router.patch(
  '/:id/reject-discount',
  protect,
  authorize('admin', 'supervisor'),
  orderController.rejectDiscount
);

// Payments
router.post(
  '/:id/payments',
  protect,
  orderController.recordPayment
);

// Outstanding Balance
router.get(
  '/technicians/:technicianId/outstanding',
  protect,
  orderController.getOutstanding
);

module.exports = router;