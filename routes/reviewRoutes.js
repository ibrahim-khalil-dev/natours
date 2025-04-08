const express = require('express');
const router = express.Router({ mergeParams: true });

const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');
// protect all the route after this middle wear
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createNewReview
  );
router
  .route('/:id')
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    reviewController.deleteReview
  )
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('admin', 'lead-guide'),
    reviewController.updateReview
  );

module.exports = router;
