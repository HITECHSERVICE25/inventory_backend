const mongoose = require('mongoose');
const validator = require('validator');

const technicianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Invalid Indian phone number'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: [validator.isEmail, 'Invalid email address']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  aadhaar: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'Invalid Aadhaar number'
    }
  },
  pan: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: 'Invalid PAN number'
    }
  },
  serviceRate: {
    type: Number,
    required: true,
    min: [0, 'Service rate cannot be negative']
  },
  companies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  isBlocked: {
    type: Boolean,
    default: false
  },
  miscShare: { type: Number, default: 0 },
  outstandingBalance: { type: Number, default: 0 },
  dueFromDiscounts: { type: Number, default: 0 }
}, {timestamps: true});


module.exports = mongoose.model('Technician', technicianSchema);