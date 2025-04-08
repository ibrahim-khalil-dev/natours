const slugify = require('slugify');
const User = require('./userModel');
const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'name must have less than or equal to 40 characters'],
      minlength: [10, 'name must have more than 10 characters'],
      // validate: [validator.isAlpha, 'name must have only characters'],
    },
    duration: {
      type: Number,
      required: [true, 'tour must have a duration'],
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    startDates: {
      type: [Date], // Array of dates
    },
    startLocation: {
      // GeoJSON
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    //guides: Array,
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    difficulty: {
      type: String,
      required: [true, 'tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: ['difficulty muse be easy, medium or difficult'],
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be 1 or greater than 1'],
      max: [5, 'rating must be less than 5 '],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    maxGroupSize: Number,
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'priceDiscount ({VALUE}) should be less than the price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'],
    },
    images: [String],
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

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// Virtual populate
// This works similarly to the populate method used for tour and user references.
// However, it handles the population automatically,
// so you don't need to manually reference the IDs in the array in the request body.

// it is doing that it self
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// Document Middle wear that runs: before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// Your code runs before saving a document and updates the guides field.
//  It takes the list of guide IDs, finds the matching user documents from the database,
//  and replaces the IDs with the full user details. Then, it moves on to save the document.
//  Modelling Tour Guides: embedding the data

// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// }); this code is for embedding so it has some drawbacks

// tourSchema.pre('save', function (next) {
//   console.log('This will save the document');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// The populate function will get the guides id and will send the response with all the guides data
// by refrencing.
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -PasswordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
