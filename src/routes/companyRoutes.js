const express = require('express');
const router = express.Router();
const {
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router
  .route('/')
  .get(getCompanies)
  .post(protect, authorize('admin'), createCompany);

  // Update a company by ID
router.put('/:id', protect, authorize('admin'), updateCompany);

// Delete a company by ID
router.delete('/:id', protect, authorize('admin'), deleteCompany);



  module.exports = router;