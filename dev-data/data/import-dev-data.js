const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../Models/tourModel');
const User = require('./../../Models/userModel');
const Review = require('./../../Models/reviewModel');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('✅ Database connected successfully');
  });

// read tours json data
const tours = JSON.parse(fs.readFileSync('dev-data/data/tours.json', 'utf-8'));
//const users = JSON.parse(fs.readFileSync('dev-data/data/users.json', 'utf-8'));
//const reviews = JSON.parse(
  //fs.readFileSync('dev-data/data/reviews.json', 'utf-8')
//);

// import tours data in the the database
const importData = async () => {
  try {
    await Tour.create(tours);
   // await User.create(users);
    //await Review.create(reviews);
    console.log('Data add in the database');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    //await User.deleteMany(users);
    //await Review.deleteMany();
    console.log('Data deleted from the database');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// node dev-data/data/import-dev-data.js --import
// node dev-data/data/import-dev-data.js --delete
