const Tour = require('./../Models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('./../Models/bookingModel');
const factory = require('./handlerFactory');

exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  // 1) get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create check out session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            // Fix the image URL
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100, // Amount in cents
        },
        quantity: 1,
      },
    ],
  });

  // 3) Create session as a response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckOut = async (req, res, next) => {
  // This is temprary. because this is unsecure and every one can make booking without paying.
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });

  // the original url is what? it the url form where the request came form. i.e. (${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}) then this will be  splited in the ?
  res.redirect(req.originalUrl.split('?')[0]);
  // first it has the user price and tour.
  // this url when split in the ? the this will redirect to the home page "/" with all the data
};

exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
