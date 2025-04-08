const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, "review can' be empty"],
      minLength: [5, 'a review must have at least 5 characters.'],
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, 'rating must be 1 or greater than 1'],
      max: [5, 'rating must be less than 5 '],
    },
    tour: { type: mongoose.Schema.ObjectId, ref: 'Tour', required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// this is the same middleweear for populating as we used in the tour modle. for getting all the tour using the ids
// by refrencing in the tour models. each time when there is a query start with find there this middle will be called and
// this will refrence the data form the data base using these ids of the tours and uses.
// we have to use the ref in the above schem so this. refers to that.

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo ', 
  });
  next();
});

// this is to calculte the avg rating for the tour and sum of all the ratings
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: tourId,
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 4.7,
      ratingsAverage: 0,
    });
  }
};
reviewSchema.post('save', function () {
  // this point to the current document
  this.constructor.calcAverageRatings(this.tour);
});

// this code is to update the rating avg and nRatings
// the first middlewear gets the document which is queryied
//  the second middlewear save the document to the tour
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  //console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
