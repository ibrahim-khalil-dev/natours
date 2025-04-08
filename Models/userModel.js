const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name required'],
    trim: true,
    minLength: [3, 'Name must have three characters'],
    maxLength: [25, 'Name must have less than or equal to 25 characters'],
  },
  email: {
    type: String,
    required: [true, 'User email required'],
    unique: [true, 'Email ID must be unique'],
    lowercase: true,
    validate: [validator.isEmail, 'Enter correct email formate'],
  },
  photo: {
    type: String, 
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guid', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password required'],
    minLength: [8, 'Password must be 8 characters long'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirmation is required'],
    // this only works on create and  save
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // this runs only if the password was actually modified
  // this mean that when i create a new user any use of the password field for anything mean for adding new
  // user or deleting i am mutating the password field
  if (!this.isModified('password')) next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // delete the confirm password field
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // This will ensure that the query only fetches users where active is true
  this.find({ active: { $ne: false } });
  next(); // Proceed with the query execution
});
// this code is an instance method of mongoose it is an asycn function and takes two arguments
//  the candidatePassword and the userpassword.
//  then return the true or false value on matching the candidatePassword mean the password from the req.body
//  in the other file we will call this method.userSchema
//  first it bcrypt the candidatePassword and then matches because the other argument mean the password will be in hash form

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
