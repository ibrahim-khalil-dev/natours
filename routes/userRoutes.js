const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

const uploads = multer({ dest: 'public/img/users ' });

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
// Add this to your user routes
router.get('/logout', authController.logoutAPI);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/forgotPassword', authController.forgotPassword);

// protect all the route after this middle wear
router.use(authController.protect);
router.patch('/updatePassword', authController.updatePassword);
router.get(
  '/me',

  userController.getMe,
  userController.getUser
);
router.patch(
  '/updateMe',
  userController.uploadUserPhotos,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .patch(userController.updateUser)
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = router;
