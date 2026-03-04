const { default: mongoose } = require('mongoose');
const AllocationLog = require('../models/AllocationLog');
const Product = require('../models/Product');
const logger = require('../utils/logger');

class AllocationService {
  async allocateProduct(productId, technicianId, quantity, notes = '') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Check product availability
      const product = await Product.findById(productId).session(session);
      if (product.availableCount < quantity) {
        throw new Error(`Insufficient stock. Available: ${product.availableCount}`);
      }

      // 2. Create allocation log
      const allocation = await AllocationLog.create([{
        product: productId,
        technician: technicianId,
        quantity,
        notes
      }], { session });

      // 3. Update product counts
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { allocatedCount: quantity } },
        { session }
      );

      await session.commitTransaction();
      logger.info('Product allocated successfully', {
        productId,
        technicianId,
        quantity
      });

      return allocation[0];
    } catch (error) {
      await session.abortTransaction();
      logger.error('Allocation failed', {
        productId,
        technicianId,
        error: error.message
      });
      throw error;
    } finally {
      session.endSession();
    }
  }

  // async getAllocationLogs(filter = {}) {
  //   try {
  //     return await AllocationLog.find(filter)
  //       .populate('product', 'name')
  //       .populate('technician', 'name');
  //   } catch (error) {
  //     logger.error('Error fetching allocation logs', { error: error.message });
  //     throw error;
  //   }
  // }

  async getAllocationLogs(filter = {}) {
    try {

      const { page = 1, limit = 10, search = '', sort = '-createdAt', ...filters } = filter;

      const queryFilter = { ...filters };
      if (search) {
        // Find matching products and technicians first
        const [products, technicians] = await Promise.all([
          Product.find({ name: { $regex: search, $options: 'i' } }).select('_id'),
          require('../models/Technician').find({ name: { $regex: search, $options: 'i' } }).select('_id')
        ]);

        const productIds = products.map(p => p._id);
        const technicianIds = technicians.map(t => t._id);

        queryFilter.$or = [
          { product: { $in: productIds } },
          { technician: { $in: technicianIds } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }

      const query = AllocationLog.find(queryFilter).populate('product', 'name')
        .populate('technician', 'name')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const [logs, total] = await Promise.all([
        query.exec(),
        AllocationLog.countDocuments(queryFilter)
      ]);

      return {
        data: logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error listing allocation logs', { error: error.message });
      throw error;
    }
  }

  // services/allocation.service.js

  async exportAllocations({ startDate, endDate }) {
    try {
      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required for export");
      }

      const filter = {
        allocatedAt: {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        }
      };

      const allocations = await AllocationLog.find(filter)
        .populate("product")
        .populate("technician")
        .sort({ allocatedAt: -1 })
        .lean();

      return allocations;

    } catch (error) {
      logger.error("Error exporting allocations:", error);
      throw new Error("Failed to export allocations");
    }
  }
}

module.exports = new AllocationService();