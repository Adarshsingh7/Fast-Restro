const Order = require('../models/order.model');
const handlerFactory = require('./handlerFactory');
const sendEmail = require('./email.controller');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const process = require('process');
const { emitOrder } = require('../utils/socket');
const { generateBillPDF } = require('../utils/generateBill');

exports.sendMail = async (req, res, next) => {
  if (req.body.update && req.body.recipientEmail) {
    sendEmail(req.body.recipientEmail, 'paymentConfirmation', {
      name: req.body.recipientName,
      orderId: req.body._id,
      amount: req.body.totalAmount,
      paymentStatus: req.body.paymentStatus,
    });
  } else if (!req.body.update && req.body.recipientEmail) {
    sendEmail(req.body.recipientEmail, 'orderStatus', {
      name: req.body.recipientName,
      orderData: req.body,
      status: req.body.status,
    });
  }
  next();
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = catchAsync(async (req, res, next) => {
  const { totalAmount } = req.body;

  if (!totalAmount) {
    return res
      .status(400)
      .json({ success: false, message: 'Amount is required' });
  }

  const order = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100), // paise
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`,
  });

  // Attach to request object
  req.razorpayOrder = order;

  next();
});

exports.verifyOrder = catchAsync((req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    next();
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    next();
  } else {
    return new AppError('Invalid signature, payment verification failed', 400);
  }
});

exports.createOrder = catchAsync(async (req, res) => {
  const doc = await Order.create(req.body);
  emitOrder('order:new', doc);

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const doc = await Order.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true },
  );

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  emitOrder('order:updated', doc);

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const doc = await Order.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  emitOrder('order:deleted', { _id: doc._id, owner: doc.owner });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getOrder = handlerFactory.getOne(Order);
exports.getAllOrders = handlerFactory.getAll(Order);

// Customers are not logged in, so cancelling has its own endpoint with the
// rule enforced here: once the restaurant accepts an order, only staff may
// cancel it (through the dashboard's authenticated update).
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new AppError('No order found with that ID', 404));

  if (order.status === 'cancelled') {
    return next(new AppError('This order is already cancelled', 400));
  }

  if (order.status !== 'new') {
    return next(
      new AppError(
        'The restaurant has already started this order, so it can no longer be cancelled. Please call the restaurant.',
        400,
      ),
    );
  }

  // findByIdAndUpdate, not save(): the model's post-save hook deducts stock
  // for every item, and saving again here would deduct it a second time.
  const cancelled = await Order.findByIdAndUpdate(
    order._id,
    { status: 'cancelled', updatedAt: Date.now() },
    { new: true },
  );
  emitOrder('order:updated', cancelled);

  res.status(200).json({ status: 'success', data: { data: cancelled } });
});

// The receipt is the record of a finished order, so it is only available once
// the restaurant marks the order completed.
exports.getReceipt = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    path: 'items.menuItem',
    select: 'name',
  });

  if (!order) return next(new AppError('No order found with that ID', 404));

  if (order.status !== 'completed') {
    return next(
      new AppError(
        'The receipt is ready once the restaurant completes this order',
        400,
      ),
    );
  }

  // generateBillPDF expects a name on each item.
  const orderData = {
    ...order.toObject(),
    items: order.items.map((item) => ({
      ...item.toObject(),
      name: item.menuItem?.name || 'Item',
    })),
  };

  const pdf = await generateBillPDF(orderData);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="receipt-${order._id}.pdf"`,
    'Content-Length': pdf.length,
  });
  res.send(pdf);
});
