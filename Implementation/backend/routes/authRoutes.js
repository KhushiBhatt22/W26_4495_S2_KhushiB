const express = require('express');
const { registerUser, loginUser, googleAuth, getProfile, updateUserProfile } = require('../controller/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);         // NEW — Firebase Google Auth
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;