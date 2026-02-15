const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  installationCharge: {
    type: Number,
    required: true,
    min: [0, 'Charge amount cannot be negative']
  }
}, {timestamps: true});

module.exports = mongoose.model('Company', companySchema);