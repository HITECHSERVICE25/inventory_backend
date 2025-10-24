const companyService = require('../services/companyService');

exports.createCompany = async (req, res, next) => {
  try {
    const company = await companyService.createCompany(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

exports.getCompanies = async (req, res, next) => {
  try {
    const result = await companyService.getCompanies(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Update a company by ID
exports.updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract the company ID from the URL
    const updateData = req.body; // Extract the updated data from the request body

    const updatedCompany = await companyService.updateCompany(id, updateData);
    res.status(200).json({ success: true, data: updatedCompany });
  } catch (error) {
    next(error);
  }
};

// Delete a company by ID
exports.deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract the company ID from the URL

    const deletedCompany = await companyService.deleteCompany(id);
    res.status(200).json({ success: true, data: deletedCompany });
  } catch (error) {
    next(error);
  }
};

