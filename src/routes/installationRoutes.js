const express = require('express');
const router = express.Router();
const installationController = require('../controllers/installationController');
const { validateChargeUpdate } = require('../middlewares/validations/installationValidation');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.put(
  '/',
  protect,
  authorize('admin'),
  validateChargeUpdate,
  installationController.updateInstallationCharge
);

router.get(
  '/current',
  installationController.getCurrentCharge
);

router.get(
  '/history',
  protect,
  installationController.getChargeHistory
);

module.exports = router;