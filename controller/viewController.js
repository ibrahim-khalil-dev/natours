const AppError = require('../utils/appError');
const Tour = require('./../Models/tourModel');
const User = require('./../Models/userModel');
const Booking = require('./../Models/bookingModel');

const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data form the collection
  const tours = await Tour.find();
  // Build template
  // Render that template using tour data from

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // Get the data, for the requested tour (including the reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is not tour with that name', 404));
  }

  // build template
  // Render the template
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login in to you account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: ' Your Account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) file all bookings
  const bookings = await Booking.find({ user: req.user.id });
  // 2) find tours with the returned IDs
  console.log('User ID:', req.user.id);

  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

// exports.updateUserData = catchAsync(async (req, res, next) => {
//   const updateUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   res
//     .status(200)
//     .render('account', { title: 'Your Account', user: updateUser });
// });
// Add this to your viewController.js
exports.updateUserData = async (req, res, next) => {
  try {
    // This is for traditional form submission (non-AJAX)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Render the account page with updated user data
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser,
    });
  } catch (err) {
    // If there's an error, render the account page with an error message
    res.status(400).render('account', {
      title: 'Your account',
      user: req.user,
      error: err.message,
    });
  }
};
