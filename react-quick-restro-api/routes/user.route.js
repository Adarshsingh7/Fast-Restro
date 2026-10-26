const Router = require('express').Router();
const userController = require('../controllers/user.controller');
const authController = require('./../controllers/auth.controller');

Router.get('/public/:id', userController.getPublicRestro);
Router.post('/login', authController.login);
Router.post('/signup', authController.signUp);
Router.post('/forgetPassword', authController.forgotPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);

Router.use(authController.protect);

Router.use(authController.restrictTo('admin', 'user'));
Router.get('/me', authController.getMe);
Router.patch('/me', userController.updateMe);
Router.post('/me/images/:kind', userController.uploadMyImage);

Router.use(authController.restrictTo('admin'));

Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = Router;
