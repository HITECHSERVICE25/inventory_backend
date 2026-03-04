const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    const token = authService.generateToken(user);
    res.status(201).json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await authService.loginUser(req.body.email, req.body.password);
    const token = authService.generateToken(user);
    res.status(200).json({ success: true, token, user: user });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const user = await authService.resetPassword(
      req.params.resettoken,
      req.body.password
    );
    const token = authService.generateToken(user);
    res.status(200).json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const result = await authService.getUsers(req.query);
    res.status(200).json({ 
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const result = await authService.getUserById(req.user._id);
    res.status(200).json({ 
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

exports.updateUser = async (req, res, next) => {
  try {
    // If no specific user ID is provided, update the currently authenticated user
    const userId = req.params.id || req.user._id;
    
    const result = await authService.updateUser(userId, req.body);
    
    res.status(200).json({ 
      success: true,
      message: 'User updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};