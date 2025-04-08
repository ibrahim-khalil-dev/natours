const express = require('express');
const router = express.Router();

const bookingController = require('../controller/bookingController');
const authController = require('../controller/authController');

router.use(authController.protect);

router.get(
  '/checkout-session/:tourId',

  bookingController.getCheckOutSession
);

router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;
