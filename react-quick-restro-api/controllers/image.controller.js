/** @format */
const fs = require('fs');
const multer = require('multer');
const AppError = require('./../utils/appError');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/user');
  },
  filename: function (req, file, cb) {
    console.log('creating the storage');
    if (file.mimetype.startsWith('image/')) {
      cb(null, file.originalname);
    } else {
      cb(new Error('File must be an image'));
    }
  },
});

exports.cloudMid = (req, res, next) => {
  if (!req.file) return next();
  console.log(req.body);
  cloudinary.uploader.upload(
    req.file.path,
    {
      public_id: req.file.filename.split('.')[0],
      transformation: [{ quality: '70' }],
    },
    function (error, result) {
      if (error) {
        return next(error);
      }

      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error unlinking file:', err);
        } else {
          console.log('File unlinked successfully');
        }
      });

      res.locals.url = result.secure_url;
      res.locals.format = result.format;
      res.locals.height = result.height;
      res.locals.width = result.width;
      res.locals.type = result.resource_type;
      res.locals.size = result.bytes;
      req.imageUrl = result.url;
      if (req.body.fieldName) {
        req.body[req.body.fieldName] = result.url;
      }
      next();
    },
  );
};

const upload = multer({ storage: storage });
exports.createUpload = upload.single('file');

exports.imageUploader = async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }
  res.status(200).json({
    status: 'success',
    data: {
      res: res.locals,
    },
  });
};
