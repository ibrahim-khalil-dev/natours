const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('./../utils/apiFeatures');

// function for deleting one document
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that id.', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   // If no tour is found, return a 404 error
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   // Respond with 204 and no content
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// this function is for updating one
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that id.', 404));
    }
    res.status(201).json({
      status: 'success',
      doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      message: 'success',
      data: doc,
    });
  });
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     message: 'success',
//     tour: newTour,
//   });
// });

// the query will check if there are population options there
// then this will use the query.populate(popOptions)

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

// exports.tour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // Tour.findOne({_id: req.params.id}) The above line works exactly the same as this one
//   if (!tour) {
//     return next(new AppError('Tour not found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     tour,
//   });
// });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    // .explain() is a method that gets all the data in the result of a request that what happend before the result.
    // means that when we filter the tour data for price lt=1000 then it will show that how many elements were examinened
    // and shows the results of all the states
    const docs = await features.query;
    //const tour = await Tour.find().where(duration).equals(5).where(difficulty).equals(easy);
    res.status(200).json({
      results: docs.length,
      data: docs,
    });
  });
