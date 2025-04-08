const { Model } = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Review = require('./../Models/reviewModel');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review)
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const review = await Review.find(filter);
//   res.status(200).json({
//     results: review.length,
//     data: review,
//   });
// });

// for the nexted routes i created middleweare that will I will use in the routes section
// in the routes. so this will be use in the middle of create new reviews.
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createNewReview = factory.createOne(Review);
// exports.createNewReview = catchAsync(async (req, res, next) => {
//   // Allow nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id;
//   const newReview = await Review.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     result: newReview,
//   });
// });
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
