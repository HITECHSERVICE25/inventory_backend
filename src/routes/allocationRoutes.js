const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post(
  '/allocate',
  protect,
  authorize('admin'),
  allocationController.allocateProducts
);

router.get(
  '/logs',
  protect,
  allocationController.getAllocationLogs
);

module.exports = router;