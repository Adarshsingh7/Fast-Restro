const Router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { makeUpload, fileUrl } = require('../utils/localUpload');
const AppError = require('../utils/appError');

// Stores one image and returns its URL, for the logged-in owner to use on a
// menu item. Keeps item create/update requests plain JSON.
Router.post(
  '/',
  authController.protect,
  makeUpload((req) => `menu-${req.user.id}`).single('file'),
  (req, res, next) => {
    if (!req.file) return next(new AppError('Please upload an image', 400));

    res.status(201).json({
      status: 'success',
      data: { url: fileUrl(req, req.file.filename) },
    });
  },
);

module.exports = Router;
