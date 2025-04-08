const User = require('../Models/userModel');
const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const { token } = require('morgan');
const bcrypt = require('bcrypt');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETE, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      results: User.length,
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
 
  // this will send an email to the user when some one sign ups into our applications.
  new Email(newUser, url).sendWelcome();
  // creating the jwt token.
  // we have to specify in the sign =>  the id e.g. { id: newUser._id }, the secrete key, the expires in also.

  // creating a function of this code so that we can create the token when ever we want
  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRETE, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });

  createSendToken(newUser, 201, res);
});
 
// 1) check the email and password exist
// 2) check if user exists and password is correct
// 3) if every thing is okay send the token back to the client
exports.login = catchAsync(async (req, res, next) => {
  // 1) check the email and password exist
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Entered email or password is incorrect', 400));
  }
  // 2) check if user exists and password is correct
  const user = await User.findOne({ email }).select('password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(
        'User not found with that email or the password is incorrect',
        401
      )
    );
  }
  // 3) if every thing is okay send the token back to the client
  createSendToken(user, 200, res);
});

// 1) Get the token and check if it's there
// 2) Verify the token
// 3)) check if the user still exists
// 4) check if the user change password after the jwt was issued

// first we need the above steps for protecting the routes. The we have to use the
// req.headers in the console to see if all the data about authorization
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('Token is invalid or not found', 401));
  }
  // 2) Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRETE);

  // 3)) check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  // 4) check if the user change password after the jwt was issued
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(new AppError('Password was recently changed'));
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  // Grant access to next function
  next();
});
// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  //console.log("Cookies:", req.cookies) // Check if jwt cookie exists

  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRETE
      );
      //console.log("Decoded token:", decoded)

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      //console.log("Current user:", currentUser)

      if (!currentUser) {
        console.log('User not found');
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.passwordChangedAfter(decoded.iat)) {
        // console.log("Password changed after token issued")
        return next();
      }

      // THERE IS A LOGGED IN USER
      // console.log("User is logged in, setting res.locals.user")
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      // console.error("Error in isLoggedIn middleware:", err)
      return next();
    }
  }
  console.log('No JWT cookie found');
  next();
};

// Add these to your existing authController.js

// For direct browser logout (redirect)
exports.logout = (req, res) => {
  // Clear JWT cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  // Redirect to home page
  res.redirect('/');
};

// For API logout (AJAX)
exports.logoutAPI = (req, res) => {
  // Clear JWT cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  // Send success response
  res.status(200).json({ status: 'success' });
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role matches one of the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You don't have permission to perform this action",
          403 // Use 403 for Forbidden
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on Posted token
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User not found with that email.', 404));
  }

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  console.log(user);

  // const message = `If you forgot you password send a patch request with password and passwordConfirm to: ${resetURl}`;
  try {
    // 3) send it to user's email
    const resetURl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    // await sendMail({
    //   email: user.email,
    //   subject: 'you password reset token here',
    //   message,
    // });
    await new Email(user, resetURl).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'token send to email',
    });
  } catch (error) {
    console.error('Failed to send email:', error.message);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error while sending email', 500));
  }
});

// 1) Get user based on the token
// 2) If the token has not expired and there is a user, set new password
// 3) Update the passwordChangedAt property for the user
// 4) Log the user in, send the JWT
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  // 2) If the token has not expired and there is a user, set new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  // 3) Update the passwordChangedAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) Log the user in, send the JWT
  createSendToken(user, 200, res);
});

// 1) Get the user from the collection
// 2) check if the posted current password is correct
// 3) If so, update the password
// 4) Log user in, send JWT
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the user from the collection
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // 2) Ensure current password is provided
  if (!req.body.passwordCurrent) {
    return next(new AppError('Please provide your current password', 400));
  }

  // 3) Check if the current password is correct
  const isPasswordCorrect = await user.correctPassword(
    req.body.passwordCurrent,
    user.password
  );

  if (!isPasswordCorrect) {
    return next(new AppError('Password is incorrect', 401));
  }

  // 4) Ensure new password & confirmation are provided
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(
      new AppError('Please provide a new password and confirm it', 400)
    );
  }

  // 5) Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // Ensures password encryption runs

  // 6) Log user in, send JWT
  createSendToken(user, 200, res);
});
