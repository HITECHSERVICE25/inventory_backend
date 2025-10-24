const mongoose = require('mongoose');

const commissionAgreementSchema = new mongoose.Schema({
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative'],
  }
}, {timestamps: true});

// Compound index to ensure unique agreements
commissionAgreementSchema.index(
  { technician: 1, product: 1 },
  { unique: true }
);

module.exports = mongoose.model('CommissionAgreement', commissionAgreementSchema);