const crypto = require('crypto');
const process = require('process');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('./../models/user.model.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const sendEmail = require('../controllers/email.controller.js');

const signToken = (id) =>
  jwt.sign({ id }, process.env.SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

const createAndSendToken = function (user, statusCode, res) {
  const token = signToken(user.id);

  const cookieOption = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 24,
    ),
    // secure: true,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  // console.log(req.cookie);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    photo: req.body.photo,
    phone: req.body.phone,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    restroName: req.body.restroName,
    restroAddress: req.body.restroAddress,
  });

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // checking user has input email and password
  if (!email || !password)
    return next(new AppError('enter email and password', 400));

  // check weather user is present in data base or not
  const user = await User.findOne({ email }).select('+password');

  // checking password from the data base
  // const correct = await user.correctPassword(password, user.password);
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('incorrect email or password', 403));

  createAndSendToken(user, 200, res);
  // res
  //   .status(200)
  //   .json({
  //     status: "success",
  //     token,
  //     data: {
  //       user,
  //       message: 'successfully login',
  //     }
  //   });
});
exports.logout = function (req, res) {
  res.cookie('jwt', 'null', {
    expiresIn: Date.now() - 1000,
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) check token and check if it is there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token) return next(new AppError('please log in to get access', 401));

  // 2) validate the token
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET);

  // 3) check user if he still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(new AppError('user does not exist log in again!', 401));

  // 4)check user changed password after jwt was issued
  if (freshUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('the password has been changed please login again', 401),
    );

  req.user = freshUser;
  next();
});

// this function will run for all the pages there will be no error for that
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  let token;
  // 1) check token and check if it is there then put in "token" variable
  if (req.cookies?.jwt === 'null') return next();
  if (req.cookies?.jwt) {
    token = req.cookies.jwt;

    // 2) validate the token
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET);

    // 3) check user if he still exist
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) return next();

    // 4)check user changed password after jwt was issued
    if (!freshUser.changedPasswordAfter()) return next();

    res.locals.user = freshUser;
    req.user = freshUser;
  }
  next();
});

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('you not have permision to perform this action', 403),
      );
    else next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // get the user based on posted email
  const freshUser = await User.findOne({ email: req.body.email });

  if (!freshUser) return next(new AppError('user not exist', 400));

  // generate random token for reseting password
  const resetToken = freshUser.createPasswordResetToken();
  await freshUser.save({ validateBeforeSave: false });

  // send it to users email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    const mailResponse = await sendEmail(req.body.email, resetURL);
    if (mailResponse.status !== 'success')
      return next(
        new AppError('failed to sent email do check your email', 400),
      );
    res.status(200).json({
      status: 'success',
      message: 'message sent successfully',
    });
  } catch (err) {
    freshUser.passwordResetToken = undefined;
    freshUser.passwordResetExpires = undefined;
    await freshUser.save({ validateBeforeSave: false });
    console.log(err);

    return next(new AppError('there was an error while sending an email', 500));
  }
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  console.log('resetting password');
  // 1) get user based on the token
  const hashed = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if password has not expired then set the new password
  if (!user)
    return next(new AppError('token is invalid or has been expired', 400));

  // 3) update the change password property
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;

  await user.save();

  // 4) log in the user
  const token = signToken(user.id);
  res.status(200).json({
    status: 'success',
    message: 'password changed successfully',
    token,
  });
});

exports.getMe = catchAsync(async (req, res) => {
  return res.status(200).json({
    status: 200,
    user: req.user,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) find the user
  const user = await User.findById(req.user.id).select('+password');

  // 2) take data
  const { currentPassword, newPassword, passwordConfirm } = req.body;
  if (newPassword != passwordConfirm)
    return next(
      new AppError('new password and password confirm are not same', 403),
    );

  // check password confirm is same to the database password
  if (!(await user.correctPassword(currentPassword, user.password)))
    return next(new AppError('invalid current password', 400));
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'password changed successfully',
    token,
  });
});
