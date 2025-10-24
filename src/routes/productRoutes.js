const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { 
  validateCreateProduct,
  validateUpdateProduct
} = require('../middlewares/validations/productValidation');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post(
  '/',
  protect,
  authorize('admin'),
  validateCreateProduct,
  productController.createProduct
);

router.get('/', productController.listProducts);

router.get('/:id', productController.getProduct);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateUpdateProduct,
  productController.updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  productController.deleteProduct
);

module.exports = router;