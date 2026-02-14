const technicianService = require('../services/technicianService');

// Create a new commission agreement
exports.createCommission = async (req, res, next) => {
  try {
    const { technicianId, productId, amount } = req.body;
    
    // Validate required fields
    if (!technicianId || !productId || !amount) {
      throw new Error('Technician ID, Product ID, and Amount are required');
    }

    const agreement = await technicianService.createCommissionAgreement(
      technicianId,
      productId,
      amount
    );
    
    res.status(201).json({
      success: true,
      data: agreement,
      message: 'Commission agreement created successfully'
    });
  } catch (error) {
    next(error); // Pass error to middleware [[1]]
  }
};

// Update an existing commission agreement
exports.updateCommission = async (req, res, next) => {
  try {
    const { technicianId, productId } = req.params;
    const { amount } = req.body;

    // Validate required fields
    if (!amount) {
      throw new Error('Commission amount is required');
    }

    const updatedAgreement = await technicianService.updateCommissionAgreement(
      technicianId,
      productId,
      amount
    );
    
    res.status(200).json({
      success: true,
      data: updatedAgreement,
      message: 'Commission agreement updated successfully'
    });
  } catch (error) {
    next(error); // Pass error to middleware [[1]]
  }
};

exports.getCommissions = async (req, res, next) => {
  try {
    const { page, limit, sort } = req.query;

    const commissions = await technicianService.listCommissions(
      {}, // filter (empty for now)
      { page, limit, sort } // options
    );

    res.status(200).json({ success: true, data: commissions });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/commissions/:id
exports.deleteCommission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await technicianService.deleteCommissionAgreementById(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};



exports.calculateEarnings = async (req, res, next) => {
  try {
    const result = await technicianService.calculateTechnicianEarnings(
      req.params.technicianId,
      req.params.productId,
      req.body.saleAmount
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};