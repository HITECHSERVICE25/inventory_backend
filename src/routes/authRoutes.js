const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getUsers,
  getUserById,
  updateUser
} = require('../controllers/authController');

const {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateGetUsers,
    validateUpdateUser
  } = require('../middlewares/validations/authValidation');
const { protect, authorize } = require('../middlewares/authMiddleware');
  
  // Apply validation middleware to routes
  router.post('/register', validateRegister, register);
  router.post('/login', validateLogin, login);
  router.post('/forgotpassword', validateForgotPassword, forgotPassword);
  router.put('/resetpassword/:resettoken', validateResetPassword, resetPassword);
  router.route('/users')
  .get(protect, validateGetUsers, getUsers);
  router.route('/users/:id')
  .put(protect, authorize('admin'), validateUpdateUser, updateUser);
  router.route('/me')
  .get(protect, getUserById);

module.exports = router;