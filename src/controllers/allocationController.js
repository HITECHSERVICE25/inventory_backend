const allocationService = require('../services/allocationService');

exports.allocateProducts = async (req, res, next) => {
  try {
    const allocation = await allocationService.allocateProduct(
      req.body.productId,
      req.body.technicianId,
      req.body.quantity,
      req.body.notes
    );
    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
};

exports.getAllocationLogs = async (req, res, next) => {
  try {
    const result = await allocationService.getAllocationLogs(req.query);
    res.status(200).json({ 
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};