const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A menu item must have a name'],
    trim: true,
    maxlength: [
      100,
      'Menu item name must have less or equal than 100 characters',
    ],
    minlength: [3, 'Menu item name must have more or equal than 3 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must have less or equal than 500 characters'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  price: {
    type: Number,
    required: [true, 'A menu item must have a price'],
    min: [0, 'Price must be above 0'],
  },
  // Free text so each restaurant can name its own sections (for example
  // "thali", "south indian"), not just a fixed list.
  category: {
    type: String,
    required: [true, 'A menu item must belong to a category'],
    trim: true,
    lowercase: true,
    maxlength: [40, 'Category must be 40 characters or less'],
  },
  availability: {
    type: Boolean,
    default: true,
  },
  variants: [
    {
      name: {
        type: String,
        required: [
          true,
          'A variant must have a name (e.g., Small, Medium, Large)',
        ],
      },
      price: {
        type: Number,
        required: [true, 'A variant must have a price'],
        min: [0, 'Price must be positive'],
      },
      stock: {
        type: Number,
        required: [true, 'Stock is required for each variant'],
        min: [0, 'Stock cannot be negative'],
        default: 0,
      },
    },
  ],
  image: {
    type: String,
    default: 'https://example.com/default-image.jpg', // Default image URL or placeholder image
    validate: {
      validator: function (v) {
        return /^(http|https):\/\/[^\s]+$/.test(v); // Simple URL validation
      },
      message: 'Please provide a valid image URL',
    },
  },
  ingredients: [
    {
      type: String,
      trim: true,
      maxlength: [
        100,
        'Ingredient name must have less or equal than 100 characters',
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    select: false, // Hide this field by default
  },
  modifiedAt: {
    type: Date,
    default: Date.now,
  },
  isSpecial: {
    type: Boolean,
    default: false,
  },
  preparationTime: {
    type: Number,
    required: [true, 'A menu item must have a preparation time'],
    min: [1, 'Preparation time must be at least 1 minute'],
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be below 0%'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0,
  },
  stock: {
    type: Number,
    required: [true, 'A menu item must have a stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

menuSchema.plugin(AutoIncrement, { inc_field: 'itemId' });

menuSchema.pre('save', function (next) {
  this.isAvailable = this.stock > 0;
  next();
});

menuSchema.pre('save', function (next) {
  this.modifiedAt = Date.now();
  next();
});

menuSchema.pre('save', function (next) {
  // Set the menu item's availability based on stock in variants
  const isAvailable = this.variants.some((variant) => variant.stock > 0);
  this.isAvailable = isAvailable;
  next();
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
