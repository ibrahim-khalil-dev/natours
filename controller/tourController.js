const Tour = require('./../Models/tourModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload the image.', 404), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
// const upload = multer({ dest: 'public/img/users' });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// upload.single('image'); req.file
// upload.array('images', 5); req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // Ensure files exist before processing
  if (!req.files || !req.files.imageCover) return next();

  // ✅ Correct access to Multer's uploaded file
  const imageCoverFile = req.files.imageCover[0];

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(imageCoverFile.buffer) // ✅ Use `imageCoverFile.buffer`
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 }) // ✅ Corrected format
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer) // ✅ Use `imageCoverFile.buffer`
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 }) // ✅ Corrected format
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});

// exports.checkID = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       message: 'Not found',
//       status: 'failed',
//     });
//   }
//   console.log(val);
//   next();
// };
// exports.checkPostData = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'unsuccessful',
//       message: 'Bad request',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,ratingsAverage,summary';
  next();
};

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // // 1) filtering query
//   // // excluding the other fields
//   // const queryObj = { ...req.query };
//   // const excludeFields = ['page', 'sort', 'limit', 'fields'];
//   // excludeFields.forEach((el) => delete queryObj[el]);

//   // //2) Advanced filtering
//   // // adding the $ sign with ( gte|lte|gt|lt)
//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);

//   // let query = Tour.find(JSON.parse(queryStr));
//   // if (req.query.sort) {
//   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   query = query.sort(sortBy);
//   // } else {
//   //   query = query.sort('-createdAt');
//   // }

//   // Fields limiting
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   query = query.select(fields);
//   // } else {
//   //   query = query.select('-__v');
//   // }

//   // Pagination
//   // const page = req.query.page * 1 || 1;
//   // const limit = req.query.limit * 1 || 100;
//   // const skip = (page - 1) * limit;
//   // query = query.skip(skip).limit(limit);

//   // if (req.query.page) {
//   //   const numTours = await Tour.countDocuments();
//   //   if (skip > numTours) throw new Error('This page does not exist');
//   // }
//   const features = new ApiFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();
//   const tours = await features.query;
//   //const tours = await Tour.find().where(duration).equals(5).where(difficulty).equals(easy);
//   res.status(200).json({
//     results: tours.length,
//     data: tours,
//   });
// });

exports.tour = factory.getOne(Tour, { path: 'reviews' });

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

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     message: 'success',
//     tour: newTour,
//   });
// });

// exports.createTour = (req, res) => {
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);

//   fs.writeFile(
//     `${__dirname}/../dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       if (err) {
//         console.error('Error writing to file:', err);
//         return res.status(500).json({
//           status: 'error',
//           message: 'Failed to create tour',
//         });
//       }

//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
// };

exports.updateTours = factory.updateOne(Tour);

// for the below code i have create a
// handeler in the handlerfactory
// exports.updateTours = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('Tour not found with that ID', 404));
//   }
//   res.status(201).json({
//     status: 'success',
//     tour,
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);
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

module.exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    stats,
  });
});
module.exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 5,
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: plan.length,
    plan,
  });
});

// '/tour-within/:distance/center/:latlng/unit/:unit',
// /tours-within/233/center/34.01327184803305, 72.32577315846709/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.2;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide the latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  console.log(distance, lat, lng, unit);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in format lat,lng',
        400
      )
    );
  }

  const multiplier = unit === 'mi' ? 0.00062137 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Points',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});
