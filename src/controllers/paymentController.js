const mongoose = require('mongoose');
const paymentService = require('../services/paymentService');

exports.recordPayment = async (req, res, next) => {
  try {
    const { technicianId } = req.params;
    const paymentData = {
      ...req.body,
      receivedBy: req.user.id // Assuming user ID is available in req.user
    };
    
    const result = await paymentService.recordTechnicianPayment(technicianId, paymentData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getOutstandingBalance = async (req, res, next) => {
  try {
    const { technicianId } = req.params;
    const balance = await paymentService.getOutstandingBalance(technicianId);
    res.status(200).json({ success: true, data: balance });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { technicianId } = req.params;
    const result = await paymentService.getPaymentHistory(technicianId, req.query);
    res.status(200).json({ 
      success: true,
      data: result.payments,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentDetails = async (req, res, next) => {
    const { paymentId } = req.params;

    const paymentDetails = await paymentService.getPaymentDetails(paymentId);
    
    res.status(200).json({
      success: true,
      data: paymentDetails
    });

    try {
    const { paymentId } = req.params;
    const paymentDetails = await paymentService.getPaymentDetails(paymentId);
    res.status(200).json({ 
      success: true,
      data: paymentDetails
    });
  } catch (error) {
    next(error);
  }
  },

exports.getAllTechniciansWithBalances = async (req, res, next) => {
  try {
    const result = await paymentService.getAllTechniciansWithBalances(req.query);
    res.status(200).json({ 
      success: true,
      data: result.technicians,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      technicianId, 
      startDate, 
      endDate,
      method,
      sortBy = 'collectedAt',
      sortOrder = 'desc'
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    const result = await paymentService.getAllPayments({
      page: pageNum,
      limit: limitNum,
      technicianId,
      startDate,
      endDate,
      method,
      sortBy,
      sortOrder
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in getAllPayments:', {
      error: error.message,
      query: req.query,
      user: req.user?.id
    });
    next(error);
  }
}

// In your technicianController.js
exports.getAllTechniciansWithBalances = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search 
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    const result = await paymentService.getAllTechniciansWithBalances({
      page: pageNum,
      limit: limitNum,
      search
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in getAllTechniciansWithBalances:', {
      error: error.message,
      query: req.query,
      user: req.user?.id
    });
    next(error);
  }
};

exports.getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    // Validate payment ID
    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment ID is required'
      });
    }

    const paymentDetails = await paymentService.getPaymentDetailsById(paymentId);

    res.status(200).json({
      success: true,
      data: paymentDetails
    });

  } catch (error) {
    console.error('Error in getPaymentDetails:', {
      error: error.message,
      paymentId: req.params.id,
      user: req.user?.id
    });

    // Handle specific errors
    if (error.message === 'Payment not found') {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    next(error);
  }
};