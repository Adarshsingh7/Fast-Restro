const Router = require('express').Router();
const couponController = require('../controllers/coupon.controller');

Router.route('/')
  .get(couponController.getAllCoupons)
  .post(couponController.createCoupon);

Router.route('/:id')
  .get(couponController.getCoupon)
  .patch(couponController.updateCoupon)
  .delete(couponController.deleteCoupon);

module.exports = Router;
