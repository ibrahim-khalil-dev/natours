const path = require('path');
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorControler');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoute');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const hpp = require('hpp');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Global middle wears
// 1) Set Security HTTP Headers
// Add this middleware before your routes
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https://*.stripe.com; base-uri 'self'; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://*.stripe.com data:; script-src 'self' https://*.stripe.com 'unsafe-inline' https://unpkg.com https://cdnjs.cloudflare.com https://js.stripe.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; frame-src 'self' https://*.stripe.com; connect-src 'self' https://*.stripe.com;"
  );
  next();
});
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Allow inline scripts
          "'unsafe-eval'", // Allow eval (only if necessary)
          'https://unpkg.com',
          'https://cdnjs.cloudflare.com',
          'https://js.stripe.com', // Allow Stripe scripts
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://unpkg.com',
          'https://fonts.googleapis.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://unpkg.com'],
        connectSrc: [
          "'self'",
          'https://unpkg.com',
          'https://js.stripe.com',
          'ws://127.0.0.1:61748/', // Allow WebSocket
        ],
      },
    },
  })
);

// 2) Development Logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// 3) Limit request from a single API
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: 'Too many request form that IP. Please try again an hour later.',
});
// Apply the rate limiting middleware to all requests.
app.use('/api', limiter);

// 4) Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQl query injection
app.use(mongoSanitize());

// Date sanitize against XSS
app.use(xss());

// hpp preventing parameter pollution
// Note: Whitelist is an array in which we allow duplicate key fields
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'price',
      'difficulty',
      'maxGroupSize',
    ],
  })
);

// 5) Serving static files

app.use((req, res, next) => {
  next();
});

// 6) Test middle wears
app.use(compression());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't not find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
