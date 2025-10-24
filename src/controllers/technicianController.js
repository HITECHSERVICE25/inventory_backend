const technicianService = require('../services/technicianService');

exports.createTechnician = async (req, res, next) => {
  try {
    const technician = await technicianService.createTechnician(req.body);
    res.status(201).json({ success: true, data: technician });
  } catch (error) {
    next(error);
  }
};

exports.getTechnician = async (req, res, next) => {
  try {
    const technician = await technicianService.getTechnicianById(req.params.id);
    res.status(200).json({ success: true, data: technician });
  } catch (error) {
    next(error);
  }
};

exports.updateTechnician = async (req, res, next) => {
  try {
    const technician = await technicianService.updateTechnician(req.params.id, req.body);
    res.status(200).json({ success: true, data: technician });
  } catch (error) {
    next(error);
  }
};

exports.listTechnicians = async (req, res, next) => {
  try {
    const result = await technicianService.listTechnicians(req.query);
    res.status(200).json({ 
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBlockStatus = async (req, res, next) => {
  try {
    const technician = await technicianService.updateBlockStatus(
      req.params.id,
      req.body.isBlocked
    );
    res.status(200).json({ success: true, data: technician });
  } catch (error) {
    next(error);
  }
};