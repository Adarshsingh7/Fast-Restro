const mongoose = require('mongoose');
const Menu = require('./menu.model');
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  menuItem: {
    type: Schema.ObjectId,
    ref: 'Menu',
    required: [true, 'An order item must be associated with a menu item'],
  },
  variant: {
    type: Schema.Types.Mixed,
    default: {},
  },
  quantity: {
    type: Number,
    required: [true, 'An order item must have a quantity'],
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: [true, 'An order item must have a price'],
    min: [0, 'Price cannot be negative'],
  },
});

const orderSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: [true, 'An order must have a total amount'],
    min: [0, 'Total amount cannot be negative'],
  },
  status: {
    type: String,
    enum: {
      values: ['new', 'preparing', 'completed', 'cancelled'],
      message:
        'Order status must be one of: new, preparing, completed, cancelled',
    },
    default: 'new',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed'],
      message: 'Payment status must be one of: pending, paid, failed',
    },
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['cash', 'card', 'online'],
      message: 'Payment method must be one of: cash, card, online',
    },
    default: 'cash',
  },
  razorpayOrderId: {
    type: String,
    unique: true,
    sparse: true,
  },
  recipientName: {
    type: String,
    trim: true,
    maxlength: [50, 'recipient name must be less than 50 characters'],
    required: [true, 'A recipient name must be specified'],
  },
  recipientEmail: {
    type: String,
    trim: true,
    // maxlength: [50, 'recipient email must be less than 50 characters'],
    // required: [true, 'A recipient email must be specified'],
  },
  recipientPhoneNumber: {
    type: String,
    trim: true,
    required: [true, 'A recipient phone number must be specified'],
  },
  delivery: {
    type: String,
    enum: {
      values: ['dine-in', 'takeaway', 'delivery'],
      message: 'Delivery method must be one of: dine-in, takeaway, delivery',
    },
    required: [true, 'A delivery method must be specified'],
  },
  deliveryAddress: {
    type: String,
    trim: true,
    maxlength: [500, 'Delivery address must be less than 500 characters'],
    required: function () {
      return this.delivery === 'delivery';
    },
  },
  deliveryTime: {
    type: Date,
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

orderSchema.post('save', async function (doc, next) {
  try {
    doc.items.map(async (el) => {
      const item = await Menu.findById(el.menuItem);
      if (item) {
        item.stock -= el.quantity;
        await item.save();
      }
    });
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

// Middleware to update `updatedAt` on save
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
