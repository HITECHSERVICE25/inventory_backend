const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');


// route for fetching draft orders
router.get(
  '/drafts',
  protect,
  orderController.getDraftOrders
);

router.get(
  '/export',
  protect,
  orderController.exportOrders
);


// Draft Orders
router.post(
  '/drafts',
  protect,
  orderController.createDraftOrder
);

// Update Draft Order
router.patch(
  '/drafts/:id',
  protect,
  orderController.updateDraftOrder
);

// Order Completion
router.put(
  '/:id/complete',
  protect,
  orderController.completeOrder
);

// Discount Approval
router.patch(
  '/:id/approve-discount',
  protect,
  orderController.approveDiscount
);

// Discount Rejection
router.patch(
  '/:id/reject-discount',
  protect,
  orderController.rejectDiscount
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  orderController.deleteOrder
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