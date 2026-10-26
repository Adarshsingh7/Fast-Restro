const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Review Schema
const reviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must be associated with a user'],
  },
  menuItem: {
    type: Schema.Types.ObjectId,
    ref: 'Menu',
    required: [true, 'Review must be associated with a menu item'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
  },
  reviewText: {
    type: String,
    trim: true,
    minlength: [1, 'Review text cannot be empty'],
    maxlength: [500, 'Review text cannot exceed 500 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt field on save
reviewSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

// Model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
