const Review = require('../models/review.model');
const handlerFactory = require('./handlerFactory');

exports.createReview = handlerFactory.createOne(Review);
exports.getReview = handlerFactory.getOne(Review);
exports.getAllReviews = handlerFactory.getAll(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
