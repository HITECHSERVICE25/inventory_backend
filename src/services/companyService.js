const Company = require('../models/Company');
const  logger  = require('../utils/logger');

// Create company
const createCompany = async (companyData) => {
  try {
    const company = await Company.create(companyData);
    logger.info('Company created', { companyId: company._id });
    return company;
  } catch (error) {
    logger.error('Company creation failed', { error: error.message });
    throw error;
  }
};

// Get all companies with technician count
const getCompanies = async (queryParams = {}) => {
  try {
    const { page = 1, limit = 10 } = queryParams;
    
    const companies = await Company.find()
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Company.countDocuments();

    logger.debug('Companies fetched', { count: companies.length });
    
    return {
      success: true,
      count: companies.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      },
      data: companies
    };
  } catch (error) {
    logger.error('Failed to fetch companies', { error: error.message });
    throw error;
  }
};


// Update company by ID
const updateCompany = async (companyId, updateData) => {
  try {
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { $set: updateData }, // Use $set to ensure partial updates
      { new: true, runValidators: true } // Return updated document and validate data
    );

    if (!updatedCompany) {
      logger.warn('Company not found for update', { companyId });
      throw new Error('Company not found');
    }

    logger.info('Company updated', { companyId: updatedCompany._id });
    return updatedCompany;
  } catch (error) {
    logger.error('Company update failed', { error: error.message });
    throw error;
  }
};

// Delete company by ID
const deleteCompany = async (companyId) => {
  try {
    const deletedCompany = await Company.findByIdAndDelete(companyId);

    if (!deletedCompany) {
      logger.warn('Company not found for deletion', { companyId });
      throw new Error('Company not found');
    }

    logger.info('Company deleted', { companyId: deletedCompany._id });
    return deletedCompany;
  } catch (error) {
    logger.error('Company deletion failed', { error: error.message });
    throw error;
  }
};

module.exports = {
    createCompany,
    getCompanies,
    updateCompany,
    deleteCompany
  };