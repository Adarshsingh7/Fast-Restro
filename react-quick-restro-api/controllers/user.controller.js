const User = require('../models/user.model');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { makeUpload, fileUrl, removeStoredImage } = require('../utils/localUpload');

exports.createUser = handlerFactory.createOne(User);
exports.getUser = handlerFactory.getOne(User);
exports.getAllUsers = handlerFactory.getAll(User);
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);

// The customer app has no login, so this returns only what a diner may see:
// never the email, phone or anything else private to the owner.
exports.getPublicRestro = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    'restroName restroAddress restroLogo paymentQr upiId',
  );

  if (!user) return next(new AppError('No restaurant found with that ID', 404));

  res.status(200).json({ status: 'success', data: { data: user } });
});

// Fields a restaurant owner may change on their own profile.
const EDITABLE_FIELDS = [
  'username',
  'phone',
  'restroName',
  'restroAddress',
  'upiId',
];

exports.updateMe = catchAsync(async (req, res) => {
  const updates = {};
  EDITABLE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', user });
});

const IMAGE_FIELDS = { logo: 'restroLogo', paymentQr: 'paymentQr' };

exports.uploadMyImage = [
  (req, res, next) => {
    if (!IMAGE_FIELDS[req.params.kind])
      return next(new AppError('Image type must be logo or paymentQr', 400));
    next();
  },
  makeUpload((req) => `${req.user.id}-${req.params.kind}`).single('file'),
  catchAsync(async (req, res, next) => {
    if (!req.file) return next(new AppError('Please upload an image', 400));

    const field = IMAGE_FIELDS[req.params.kind];
    const previous = req.user[field];

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { [field]: fileUrl(req, req.file.filename) },
      { new: true },
    );

    // Remove the image this one replaces, if it was stored here.
    removeStoredImage(previous);

    res.status(200).json({ status: 'success', user });
  }),
];
