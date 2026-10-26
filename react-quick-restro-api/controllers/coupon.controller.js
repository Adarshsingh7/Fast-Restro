const Coupon = require('../models/coupon.model');
const handlerFactory = require('./handlerFactory');

exports.createCoupon = handlerFactory.createOne(Coupon);
exports.getCoupon = handlerFactory.getOne(Coupon);
exports.getAllCoupons = handlerFactory.getAll(Coupon);
exports.updateCoupon = handlerFactory.updateOne(Coupon);
exports.deleteCoupon = handlerFactory.deleteOne(Coupon);
