const mongoose = require('mongoose');

const installationChargeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0, 'Charge amount cannot be negative']
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  isCurrent: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstallationCharge'
  }
}, { timestamps: true });

// Index for quick current charge lookup
installationChargeSchema.index({ isCurrent: 1 });

module.exports = mongoose.model('InstallationCharge', installationChargeSchema);