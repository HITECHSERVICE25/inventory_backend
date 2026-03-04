const allocationService = require('../services/allocationService');
const { generateAllocationsExcel } = require('../utils/excel.helper');

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

// controllers/allocation.controller.js

exports.exportAllocations = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const allocations = await allocationService.exportAllocations({
      startDate,
      endDate
    });

    const workbook = await generateAllocationsExcel(allocations);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=allocations.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    next(error);
  }
};