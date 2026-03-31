const express = require('express');
const { registerUser, loginUser, googleAuth, getProfile, updateUserProfile, uploadProfilePhoto,changePassword,deleteAccount} = require('../controller/authController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { upload } = require("../config/cloudinary");

const router = express.Router();

// ── Avatar Upload Setup ──────────────────────────────────────────────────────
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`),
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb("Images only!");
  },
}).single("avatar");

// ── Routes ───────────────────────────────────────────────────────────────────
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/profile', protect, getProfile);
router.put('/change-password', protect, changePassword);
router.put('/profile', protect, updateUserProfile);
router.put("/profile/photo", protect, upload.single("avatar"), uploadProfilePhoto);
router.delete('/delete', protect, deleteAccount);

// For handling avatar upload with Cloudinary
router.put('/profile/photo', protect, (req, res, next) => {
  avatarUpload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err });
    next();
  });
}, uploadProfilePhoto);

module.exports = router;