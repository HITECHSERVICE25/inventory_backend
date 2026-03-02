const dashboardService = require('../services/dashboardService');

/**
 * Get Dashboard Data
 * Supports optional query params:
 * ?startDate=2026-02-01&endDate=2026-02-28
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const dashboardData = await dashboardService.getDashboardData(req.query);

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};