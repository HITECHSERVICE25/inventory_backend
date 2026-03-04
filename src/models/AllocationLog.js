const mongoose = require('mongoose');

const allocationLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Minimum allocation quantity is 1']
  },
  allocatedAt: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {timestamps: true});

module.exports = mongoose.model('AllocationLog', allocationLogSchema);