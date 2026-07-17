const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/profile/:facultyId', authController.getProfile);
router.put('/profile/:facultyId', authController.updateProfile);
router.put('/change-password/:facultyId', authController.changePassword);

module.exports = router;
