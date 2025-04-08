const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: "${value}" for field "${field}". Please use another one.`;
  return new AppError(message, 400);
};
const handlevalidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data.${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = (err) =>
  new AppError('Invalid token, please login', 401);
const handleTokenExpiredError = (err) =>
  new AppError('Expired token, please login again', 401);

const sendErrorDev = (err, req, res) => {
  // Added 'req'
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'There is not tour with name.',
  });
};

// const sendErrorDev = (err, req, res) => {
//   // Check if it's an API request
//   if (req.originalUrl.startsWith('/api')) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       error: err,
//       message: err.message,
//       stack: err.stack,
//     });
//   } else {
//     // Render the error.pug page for normal web requests
//     res.status(err.statusCode).render('error', {
//       title: 'Something went wrong!',
//       msg: 'There is not route with that name.',
//     });
//   }
// }

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      message: err.message || 'An unexpected error occurred.',
    });
  } else {
    //1) Log error
    console.error('Error 💣', err);

    //2) Send actual error message if available, otherwise a generic one
    res.status(err.statusCode).render('error', {
      title: 'Something went very wrong!',
      message: err.message || 'Please try again later.',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name, message: err.message };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === 'ValidationError') error = handlevalidationError(error);
    if (error.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError(error);
    if (error.name === 'TokenExpiredError')
      error = handleTokenExpiredError(error);

    sendErrorProd(error, req, res);
  }
};
