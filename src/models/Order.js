const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Core Fields
  TCRNumber: { type: String, unique: true },
  orderDate: { type: Date, default: Date.now },
  completionDate: Date,
  remarks: String,
  
  // Relationships
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: true },
  
  // Financials
  installationCharge: Number,
  miscellaneousCost: { type: Number, default: 0 },
  fittingCost: { type: Number, default: 0 },
  miscDiscountPercentage: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  discountApproved: { 
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  miscDiscountSplit: {
    ownerPercentage: { 
      type: Number, 
      default: 100,
      min: 0,
      max: 100
    },
    technicianPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  discountSplit: {
    ownerPercentage: { 
      type: Number, 
      default: 100,
      min: 0,
      max: 100
    },
    technicianPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  discountApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Products
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    basePrice: Number,
    salePrice: Number,
    technicianPercentage: Number
  }],
  
  // Calculated Fields
  totalAmount: Number,
  netAmount: Number,
  technicianCut: Number,
  companyCut: Number,
  outstandingAmount: Number,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending-approval', 'completed'],
    default: 'draft'
  },

  customer: {
    name: {
      type: String,
      required: true
    },
    contact: {
      phone: {
        type: String,
        required: true
      },
      alternatePhone: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: {
        type: String,
        required: true
      }
    }
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);