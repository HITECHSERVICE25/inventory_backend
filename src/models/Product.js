const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    index: true
  },
  unitOfMeasure: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  totalCount: {
    type: Number,
    required: true,
    min: [0, 'Total count cannot be negative']
  },
  allocatedCount: {
    type: Number,
    default: 0,
    min: [0, 'Allocated count cannot be negative']
  },
  availableCount: {
    type: Number,
    virtual: true,
    get: function() { return this.totalCount - this.allocatedCount }
  }
}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);