const express = require('express');
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');

const router = express.Router();

// Logout route (before isLoggedIn middleware)
router.get('/logout', authController.logout);
 
// Apply isLoggedIn middleware to all routes below
router.use(authController.isLoggedIn);

// View routes 
router.get(
  '/',
  bookingController.createBookingCheckOut,
  viewController.getOverview
);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);
router.get('/me', viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
router.post('/submit-user-data', viewController.updateUserData);

module.exports = router;
