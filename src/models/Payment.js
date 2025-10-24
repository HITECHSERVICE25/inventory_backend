const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  technician: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Technician', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  method: { 
    type: String, 
    enum: ['cash', 'check', 'online', 'bank_transfer'], 
    required: true 
  },
  reference: {
    type: String,
    required: function() {
      return this.method !== 'cash';
    }
  },
  receivedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'collected', 'remitted'],
    default: 'collected'
  },
  collectedAt: {
    type: Date,
    default: Date.now
  },
  notes: String
}, { 
  timestamps: true 
});

// Index for better query performance
paymentSchema.index({ technician: 1, collectedAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);