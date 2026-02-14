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
  validateCreateTechnician,
  technicianController.createTechnician
);

router.get('/', technicianController.listTechnicians);
router.get('/:id', technicianController.getTechnician);

router.put(
  '/:id',
  protect,
  validateUpdateTechnician,
  technicianController.updateTechnician
);

router.patch(
  '/:id/block',
  protect,
  technicianController.updateBlockStatus
);

module.exports = router;