const Router = require('express').Router();
const reviewController = require('../controllers/review.controller');
Router.route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

Router.route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = Router;
