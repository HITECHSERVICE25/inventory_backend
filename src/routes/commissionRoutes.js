const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const { validateCommissionUpdate, validateCommissionCreate } = require('../middlewares/validations/commissionValidation');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Create commission (POST /commissions)
router.post(
  '/',
  protect,
  validateCommissionCreate,
  commissionController.createCommission
);

// Update commission (PUT /commissions/:technicianId/:productId)
router.put(
  '/:technicianId/:productId',
  protect, 
  validateCommissionUpdate,
  commissionController.updateCommission
);

router.get(
  '/',
  protect,
  commissionController.getCommissions
);

router.post(
  '/:technicianId/products/:productId/calculate',
  protect,
  commissionController.calculateEarnings
);

router.delete(
  '/:id',
  protect,
  commissionController.deleteCommission
);


module.exports = router;