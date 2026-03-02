const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Technician = require("../models/Technician");
const Payment = require("../models/Payment");

class DashboardService {
  /**
   * Main Dashboard Entry
   */
  async getDashboardData(filters = {}) {
    const { startDate, endDate } = this._resolveDateFilter(filters);

    const [
      kpis,
      orderTrend,
      inventory,
      technicianSummary,
      paymentSummary
    ] = await Promise.all([
      this._getKPIs(startDate, endDate),
      this._getOrderTrend(startDate, endDate),
      this._getInventoryHealth(),
      this._getTechnicianSummary(startDate, endDate),
      this._getPaymentSummary(startDate, endDate)
    ]);

    return {
      kpis,
      orderTrend,
      inventory,
      technicians: technicianSummary,
      payments: paymentSummary
    };
  }

  /**
   * -------------------------
   * KPI SECTION
   * -------------------------
   */
  async _getKPIs(startDate, endDate) {
    const result = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          pendingApproval: {
            $sum: { $cond: [{ $eq: ["$status", "pending-approval"] }, 1, 0] }
          },
          totalRevenue: { $sum: { $ifNull: ["$netAmount", 0] } },
          totalOutstanding: { $sum: { $ifNull: ["$outstandingAmount", 0] } }
        }
      }
    ]);

    return result[0] || {
      totalOrders: 0,
      completedOrders: 0,
      pendingApproval: 0,
      totalRevenue: 0,
      totalOutstanding: 0
    };
  }

  /**
   * -------------------------
   * ORDER TREND
   * -------------------------
   */
  async _getOrderTrend(startDate, endDate) {
    return Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$orderDate" }
          },
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$netAmount", 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  /**
   * -------------------------
   * INVENTORY HEALTH
   * -------------------------
   */
  async _getInventoryHealth() {
    return Product.aggregate([
      {
        $project: {
          name: 1,
          totalCount: 1,
          allocatedCount: 1,
          available: {
            $subtract: ["$totalCount", "$allocatedCount"]
          }
        }
      },
      {
        $match: {
          available: { $lte: 5 } // configurable threshold
        }
      },
      { $sort: { available: 1 } },
      { $limit: 5 }
    ]);
  }

  /**
   * -------------------------
   * TECHNICIAN SUMMARY
   * -------------------------
   */
  async _getTechnicianSummary(startDate, endDate) {
    const [active, blocked, outstanding, topTechs] = await Promise.all([
      Technician.countDocuments({ isBlocked: false }),
      Technician.countDocuments({ isBlocked: true }),
      Technician.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$outstandingBalance", 0] } }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            status: "completed",
            orderDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$technician",
            completedOrders: { $sum: 1 }
          }
        },
        { $sort: { completedOrders: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "technicians",
            localField: "_id",
            foreignField: "_id",
            as: "technician"
          }
        },
        { $unwind: "$technician" },
        {
          $project: {
            _id: 0,
            technicianId: "$technician._id",
            name: "$technician.name",
            completedOrders: 1
          }
        }
      ])
    ]);

    return {
      active,
      blocked,
      totalOutstanding: outstanding[0]?.total || 0,
      topPerformers: topTechs
    };
  }

  /**
   * -------------------------
   * PAYMENT SUMMARY
   * -------------------------
   */
  async _getPaymentSummary(startDate, endDate) {
    const result = await Payment.aggregate([
      {
        $match: {
          collectedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalCollected: {
            $sum: {
              $cond: [
                { $eq: ["$status", "collected"] },
                "$amount",
                0
              ]
            }
          },
          pendingPayments: {
            $sum: {
              $cond: [
                { $eq: ["$status", "pending"] },
                "$amount",
                0
              ]
            }
          }
        }
      }
    ]);

    return result[0] || {
      totalCollected: 0,
      pendingPayments: 0
    };
  }

  /**
   * -------------------------
   * DATE FILTER RESOLVER
   * -------------------------
   */
  _resolveDateFilter(filters) {
  let { startDate, endDate } = filters;

  if (!startDate || !endDate) {
    return {
      startDate: new Date(0), // 1970
      endDate: new Date()
    };
  }

  return {
    startDate: new Date(startDate),
    endDate: new Date(endDate)
  };
}
}

module.exports = new DashboardService();