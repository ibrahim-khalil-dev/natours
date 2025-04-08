const User = require('../Models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const multer = require('multer');
const sharp = require('sharp'); 

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-7576abc-223434.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

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

exports.uploadUserPhotos = upload.single('photo');
 

exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next(); 

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpg`;

  try {
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg', { quality: 90 }) // Corrected format
      .toFile(`public/img/users/${req.file.filename}`);

    next(); // Call next() after processing
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      message: 'Image processing failed',
    });
  }
};


const filterObj = (Obj, ...allowFields) => {
  const newObj = {};
  Object.keys(Obj).forEach((el) => {
    if (allowFields.includes(el)) newObj[el] = Obj[el];
  });
  return newObj;
}; 

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
// exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const user = await User.find();
//   res.status(200).json({
//     results: user.length,
//     data: user,
//   });
// });

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log('thisi sit the file', req.file);
  console.log('this is th ebody', req.body);
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use the updatePassword Route. '
      )
    );
  }
  // 2) Update user document
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;
  
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: null,
  });
});
// exports.getUser = factory.getOne(User);
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'failed',
//     message: 'not user yet',
//   });
// };
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'This route is not defined yet. Please use the signup route.',
  });
};

// this is not to update password with this update.
// exports.updateUser = factory.updateOne(User);
// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'failed',
//     message: 'not user yet',
//   });
// };

// exports.getAllUsers = factory.getAll(User);
// exports.deleteUser = factory.deleteOne(User);
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'failed',
//     message: 'not user yet',
//   });
// };

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
