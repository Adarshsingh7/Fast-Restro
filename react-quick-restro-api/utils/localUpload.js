const fs = require('fs');
const path = require('path');
const multer = require('multer');
const AppError = require('./appError');

// Images are stored on this server under /uploads and served as static files,
// so uploads work without a Cloudinary account.
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const fileUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/${filename}`;

// `name` builds the stored filename from the request, keeping uploads apart.
const makeUpload = (name) =>
  multer({
    storage: multer.diskStorage({
      destination: UPLOAD_DIR,
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.png';
        cb(null, `${name(req)}-${Date.now()}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new AppError('Please upload an image file', 400));
    },
  });

// Accepts an optional "file" field; when one is sent, req.body[field] becomes
// its URL. Requests without a file pass straight through unchanged.
const uploadImageField = (name, field) => {
  const upload = makeUpload(name).single('file');

  return [
    upload,
    (req, res, next) => {
      if (req.file) req.body[field] = fileUrl(req, req.file.filename);
      next();
    },
  ];
};

const removeStoredImage = (url) => {
  if (!url || !url.includes('/uploads/')) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(url)), () => {});
};

module.exports = { UPLOAD_DIR, fileUrl, makeUpload, uploadImageField, removeStoredImage };
