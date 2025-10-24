const { default: mongoose } = require('mongoose');
const AllocationLog = require('../models/AllocationLog');
const Product = require('../models/Product');
const  logger  = require('../utils/logger');

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
  
        const { page = 1, limit = 10, sort = '-createdAt', ...filters } = filter;
        console.log('Filter----------:', filter, (page - 1) * limit);
  
        
        const query = AllocationLog.find(filters).populate('product', 'name')
        .populate('technician', 'name')
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(Number(limit));
  
        const [logs, total] = await Promise.all([
          query.exec(),
          AllocationLog.countDocuments(filters)
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
}

module.exports = new AllocationService();