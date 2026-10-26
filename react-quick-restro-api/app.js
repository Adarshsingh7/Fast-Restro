const path = require('path');
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');
const couponRouter = require('./routes/coupon.route');
const menuRouter = require('./routes/menu.route');
const orderRouter = require('./routes/order.route');
const userRouter = require('./routes/user.route');
const reviewRouter = require('./routes/review.route');
const seatRouter = require('./routes/seat.route');
const transactionRouter = require('./routes/transaction.route');
const imageUploader = require('./controllers/image.controller');
const pusherRouter = require('./routes/pusher.route');
const uploadRouter = require('./routes/upload.route');

app.use(express.json());
app.use(cors());
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: 'route is working fine',
  });
});

app.get('/adarsh', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: 'this is adarsh route',
  });
});

app.post(
  '/upload',
  imageUploader.createUpload,
  imageUploader.cloudMid,
  imageUploader.imageUploader,
);

app.use('/api/v1/coupons', couponRouter);
app.use('/api/v1/menus', menuRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/seats', seatRouter);
app.use('/api/v1/transactions', transactionRouter);
app.use('/api/v1/notify', pusherRouter);
app.use('/api/v1/uploads', uploadRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
