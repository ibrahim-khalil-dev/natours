const express = require('express');
const router = express.Router();
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const reviewRouter = require('./reviewRoutes');

// router 
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createNewReview
//   );

router.use('/:tourId/reviews', reviewRouter);

// router.param('id', tourController.checkID) ;
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router
  .route('/distances/:distance/:latlng/unit/:unit')
  .get(tourController.getDistances);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// /tours-within?distance=233&cetner-40,45&unit=mi
// /tours-within/233/center/34.01327184803305, 72.32577315846709/unit/mi
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTours
  )
  .get(tourController.tour);

module.exports = router;
