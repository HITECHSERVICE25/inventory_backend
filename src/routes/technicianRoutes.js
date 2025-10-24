const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const { 
  validateCreateTechnician,
  validateUpdateTechnician
} = require('../middlewares/validations/technicianValidation');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post(
  '/',
  protect,
  authorize('admin'),
  validateCreateTechnician,
  technicianController.createTechnician
);

router.get('/', technicianController.listTechnicians);
router.get('/:id', technicianController.getTechnician);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateUpdateTechnician,
  technicianController.updateTechnician
);

router.patch(
  '/:id/block',
  protect,
  authorize('admin'),
  technicianController.updateBlockStatus
);

module.exports = router;