const Payment = require('../models/Payment');
const Technician = require('../models/Technician');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

class PaymentService {
  async recordTechnicianPayment(technicianId, paymentData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Verify technician exists
      const technician = await Technician.findById(technicianId).session(session);
      if (!technician) {
        throw new Error('Technician not found');
      }

      // Validate payment amount doesn't exceed outstanding balance
      if (paymentData.amount > technician.outstandingBalance) {
        throw new Error('Payment amount exceeds outstanding balance');
      }

      // Create payment record
      const payment = await Payment.create([{
        technician: technicianId,
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
        receivedBy: paymentData.receivedBy,
        status: 'collected',
        collectedAt: new Date(),
        notes: paymentData.notes
      }], { session });

      // Update technician's outstanding balance
      await Technician.findByIdAndUpdate(
        technicianId,
        { $inc: { outstandingBalance: -paymentData.amount } },
        { session }
      );

      await session.commitTransaction();
      logger.info('Technician payment recorded successfully', { 
        technicianId, 
        amount: paymentData.amount,
        paymentId: payment[0]._id
      });
      
      return {
        payment: payment[0],
        newBalance: technician.outstandingBalance - paymentData.amount
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Technician payment failed', { 
        technicianId, 
        error: error.message,
        paymentData 
      });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getOutstandingBalance(technicianId) {
    try {
      // Get technician's current outstanding balance
      const technician = await Technician.findById(technicianId)
        .select('name outstandingBalance dueFromDiscounts');
      
      if (!technician) {
        throw new Error('Technician not found');
      }

      return {
        technicianId,
        technicianName: technician.name,
        outstandingBalance: technician.outstandingBalance,
        dueFromDiscounts: technician.dueFromDiscounts
      };
    } catch (error) {
      logger.error('Error fetching outstanding balance', { 
        technicianId, 
        error: error.message 
      });
      throw error;
    }
  }

  async getPaymentHistory(technicianId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;
      
      const [payments, total] = await Promise.all([
        Payment.find({ technician: technicianId })
          .populate('receivedBy', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Payment.countDocuments({ technician: technicianId })
      ]);

      return {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching payment history', { 
        technicianId, 
        error: error.message 
      });
      throw error;
    }
  }

  // Add this method to your paymentService class
async getAllPayments(options = {}) {
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
    } = options;

    // Build filter for payments
    const filter = {};
    
    if (technicianId) {
      filter.technician = technicianId;
    }
    
    if (startDate || endDate) {
      filter.collectedAt = {};
      if (startDate) {
        filter.collectedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.collectedAt.$lte = new Date(endDate);
      }
    }
    
    if (method) {
      filter.method = method;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get payments with pagination using Payment model directly
    const payments = await Payment.find(filter)
      .populate('technician', 'name phone email')
      .populate('receivedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Payment.countDocuments(filter);

    // Calculate summary statistics
    const summary = {
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      totalCount: payments.length,
      averageAmount: payments.length > 0 
        ? payments.reduce((sum, payment) => sum + payment.amount, 0) / payments.length 
        : 0
    };

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    };

    return {
      payments,
      summary,
      pagination
    };
  } catch (error) {
    logger.error('Error fetching payments', { 
      error: error.message, 
      options 
    });
    throw error;
  }
}

// // Main service method to get all technicians with balances
//   async getAllTechniciansWithBalances(options = {}) {
//     try {
//       const { page = 1, limit = 20, search } = options;

//       // Build filter for technicians
//       const filter = {};
//       if (search) {
//         filter.$or = [
//           { name: { $regex: search, $options: 'i' } },
//           { phone: { $regex: search, $options: 'i' } },
//           { email: { $regex: search, $options: 'i' } }
//         ];
//       }

//       // Get technicians with pagination using the service method
//       const result = await TechnicianService.listTechnicians({
//         ...filter,
//         page: parseInt(page),
//         limit: parseInt(limit)
//       });

//       // Calculate summary statistics
//       const summary = {
//         totalTechnicians: result.data.length,
//         totalOutstandingBalance: result.data.reduce((sum, tech) => sum + (tech.outstandingBalance || 0), 0),
//         totalDueFromDiscounts: result.data.reduce((sum, tech) => sum + (tech.dueFromDiscounts || 0), 0),
//         activeTechnicians: result.data.filter(tech => !tech.isBlocked).length,
//         blockedTechnicians: result.data.filter(tech => tech.isBlocked).length
//       };

//       return {
//         technicians: result.data,
//         summary,
//         pagination: result.pagination
//       };
//     } catch (error) {
//       logger.error('Error fetching technicians with balances', { 
//         error: error.message, 
//         options 
//       });
//       throw error;
//     }
//   }

  async getAllTechniciansWithBalances(options = {}) {
  try {
    const { page = 1, limit = 20, search } = options;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch technicians
    const technicians = await Technician.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Technician.countDocuments(filter);

    // Summary stats
    const summary = {
      totalTechnicians: technicians.length,
      totalOutstandingBalance: technicians.reduce((sum, t) => sum + (t.outstandingBalance || 0), 0),
      totalDueFromDiscounts: technicians.reduce((sum, t) => sum + (t.dueFromDiscounts || 0), 0),
      activeTechnicians: technicians.filter(t => !t.isBlocked).length,
      blockedTechnicians: technicians.filter(t => t.isBlocked).length
    };

    return {
      technicians,
      summary,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching technicians with balances', error);
    throw error;
  }
}

  // Additional method to get technician balance details
  async getTechnicianBalanceDetails(technicianId) {
    try {
      const technician = await Technician.findById(technicianId)
        .select('name phone email outstandingBalance dueFromDiscounts isBlocked');

      if (!technician) {
        throw new Error('Technician not found');
      }

      // You can add additional balance calculations here if needed
      const totalBalance = (technician.outstandingBalance || 0) + (technician.dueFromDiscounts || 0);

      return {
        technician,
        balanceSummary: {
          outstandingBalance: technician.outstandingBalance || 0,
          dueFromDiscounts: technician.dueFromDiscounts || 0,
          totalBalance,
          isBlocked: technician.isBlocked
        }
      };
    } catch (error) {
      logger.error('Error fetching technician balance details', { 
        technicianId, 
        error: error.message 
      });
      throw error;
    }
  }

  async getPaymentDetailsById(paymentId) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('technician', 'name phone email')
        .populate('receivedBy', 'name email role')
        .select('-__v'); // Exclude version key

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error) {
      logger.error('Error fetching payment details', { 
        paymentId, 
        error: error.message 
      });
      throw error;
    }
  }
}

module.exports = new PaymentService();