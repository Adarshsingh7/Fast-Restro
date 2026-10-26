const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'A coupon must have a code'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [5, 'Coupon code must be at least 5 characters long'],
    maxlength: [20, 'Coupon code must be at most 20 characters long'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description must be less than 200 characters'],
  },
  discount: {
    type: Number,
    required: [true, 'A coupon must have a discount amount'],
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
  },
  type: {
    type: String,
    enum: {
      values: ['percentage', 'fixed'],
      message: 'Discount type must be either "percentage" or "fixed"',
    },
    required: [true, 'A coupon must have a discount type'],
  },
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validTo: {
    type: Date,
    required: [true, 'A coupon must have an expiration date'],
  },
  usageLimit: {
    type: Number,
    default: 1,
    min: [1, 'Usage limit must be at least 1'],
  },
  usedBy: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update `updatedAt` on save
couponSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to ensure the coupon is valid
couponSchema.methods.isValid = function () {
  const now = Date.now();
  return now >= this.validFrom && now <= this.validTo && this.usageLimit > 0;
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
