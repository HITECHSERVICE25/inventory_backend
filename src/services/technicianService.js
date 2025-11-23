const Technician = require('../models/Technician');
const CommissionAgreement = require('../models/CommissionAgreement');
const  logger  = require('../utils/logger');
const Product = require('../models/Product');

class TechnicianService {
  // async createTechnician(technicianData) {
  //   try {
  //     const technician = await Technician.create(technicianData);
  //     logger.info('Technician created', { technicianId: technician._id });
  //     return technician;
  //   } catch (error) {
  //     logger.error('Technician creation failed', { error: error.message });
  //     throw error;
  //   }
  // }

  async createTechnician(technicianData) {
  try {
    const technician = await Technician.create(technicianData);
    logger.info('Technician created', { technicianId: technician._id });
    return technician;
  } catch (error) {
    logger.error('Technician creation failed', { error: error.message });

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];

      // Throw a clean error
      const customError = new Error(`${field} already exists`);
      customError.statusCode = 400;
      throw customError;
    }

    // For all other errors
    error.statusCode = 500;
    throw error;
  }
}


  async getTechnicianById(id) {
    try {
      return await Technician.findById(id).populate('companies', 'name');
    } catch (error) {
      logger.error('Error fetching technician', { technicianId: id, error: error.message });
      throw error;
    }
  }

  async updateTechnician(id, updateData) {
    try {
      const technician = await Technician.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      }).populate('companies', 'name');
      
      logger.info('Technician updated', { technicianId: id });
      return technician;
    } catch (error) {
      logger.error('Technician creation failed', { error: error.message });

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];

      // Throw a clean error
      const customError = new Error(`${field} already exists`);
      customError.statusCode = 400;
      throw customError;
    }

    // For all other errors
    error.statusCode = 500;
    throw error;
    }
  }

  async updateBlockStatus(id, isBlocked) {
    try {
      const technician = await Technician.findByIdAndUpdate(
        id,
        { isBlocked },
        { new: true }
      );
      logger.info('Block status updated', { technicianId: id, status: isBlocked });
      return technician;
    } catch (error) {
      logger.error('Block status update failed', { technicianId: id, error: error.message });
      throw error;
    }
  }

  async listTechnicians(filterParams = {}) {
    try {

      const { page = 1, limit = 10, ...filters } = filterParams;
      console.log('Filter----------:', filterParams, (page - 1) * limit);

      const query = Technician.find(filters)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('companies', 'name');

      const [technicians, total] = await Promise.all([
        query.exec(),
        Technician.countDocuments(filters)
      ]);

      return {
        data: technicians,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error listing technicians', { error: error.message });
      throw error;
    }
  }

  // POST /api/commissions
async createCommissionAgreement(technicianId, productId, amount) {
  try {
    const [technician, product] = await Promise.all([
      Technician.findById(technicianId),
      Product.findById(productId)
    ]);

    if (!technician) throw new Error('Technician not found');
    if (!product) throw new Error('Product not found');

    // Check if agreement already exists
    const existingAgreement = await CommissionAgreement.findOne({
      technician: technicianId,
      product: productId
    });

    if (existingAgreement) {
      throw new Error('Commission agreement already exists');
    }

    // Create new agreement
    const agreement = await CommissionAgreement.create({
      technician: technicianId,
      product: productId,
      amount,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    logger.info('Commission agreement created', { technicianId, productId, amount });
    return agreement;
  } catch (error) {
    logger.error('Failed to create commission agreement', { error: error.message });
    throw error;
  }
}

  // PUT /api/commissions/:technicianId/:productId
async updateCommissionAgreement(technicianId, productId, amount) {
  try {
    const [technician, product] = await Promise.all([
      Technician.findById(technicianId),
      Product.findById(productId)
    ]);

    if (!technician) throw new Error('Technician not found');
    if (!product) throw new Error('Product not found');

    // Find and update existing agreement
    const agreement = await CommissionAgreement.findOneAndUpdate(
      { technician: technicianId, product: productId },
      { amount, updatedAt: Date.now() },
      { new: true } // Return updated document
    );

    if (!agreement) {
      throw new Error('Commission agreement not found');
    }

    logger.info('Commission agreement updated', { technicianId, productId, amount });
    return agreement;
  } catch (error) {
    logger.error('Failed to update commission agreement', { error: error.message });
    throw error;
  }
}

async listCommissions(filter = {}, options = {}) {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', ...filters } = options;

    // Build query with filtering, sorting, and pagination
    const query = CommissionAgreement.find(filters)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('product', 'name price') // Include product details
      .populate('technician', 'name'); // Include technician name if needed

    // Execute query and count total documents
    const [commissions, total] = await Promise.all([
      query.exec(),
      CommissionAgreement.countDocuments(filter)
    ]);

    // Return standardized response format
    return {
      data: commissions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error listing commissions', { 
      filter, 
      options, 
      error: error.message 
    });
    throw error;
  }
}

  async calculateTechnicianEarnings(technicianId, productId, saleAmount) {
    try {
      const agreement = await CommissionAgreement.findOne({
        technician: technicianId,
        product: productId
      }).populate('product', 'basePrice');
  
      if (!agreement) {
        throw new Error('No commission agreement found');
      }
  
      const basePrice = agreement.product.price;
      const profit = saleAmount - basePrice;
      const commission = (profit * agreement.percentage) / 100;
  
      const earnings = {
        percentage: agreement.percentage,
        basePrice: basePrice,
        salePrice: saleAmount,
        profit: profit,
        commission: commission,
        calculationNote: profit < 0 
          ? 'Commission calculated on negative profit' 
          : undefined
      };
  
      logger.info('Earnings calculated', { 
        technicianId, 
        productId,
        ...earnings 
      });
  
      return earnings;
    } catch (error) {
      logger.error('Earnings calculation failed', {
        technicianId,
        productId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new TechnicianService();