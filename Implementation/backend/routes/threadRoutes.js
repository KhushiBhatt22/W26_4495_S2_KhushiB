// const express = require("express");
// const router = express.Router();
// const {
//   createThread,
//   getThreads,
//   likeThread,
//   addComment,
//   deleteThread,
//   deleteComment
// } = require("../controller/threadController");
// const { protect } = require("../middlewares/authMiddleware");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // ── Image upload setup ────────────────────────────────────────────────────────
// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) =>
//     cb(null, `thread-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
//   fileFilter: (req, file, cb) => {
//     const allowed = /jpeg|jpg|png|gif|webp/;
//     const ok = allowed.test(path.extname(file.originalname).toLowerCase());
//     ok ? cb(null, true) : cb("Images only!");
//   },
// }).array("images", 5); // max 5 images

// // ── Routes ────────────────────────────────────────────────────────────────────
// router.get("/", protect, getThreads);

// router.post("/", protect, (req, res, next) => {
//   upload(req, res, (err) => {
//     if (err) return res.status(400).json({ message: err });
//     next();
//   });
// }, createThread);

// router.put("/:id/like", protect, likeThread);
// router.post("/:id/comment", protect, addComment);
// router.delete("/:id", protect, deleteThread);
// router.delete("/:threadId/comment/:commentId", protect, deleteComment);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createThread,
  getThreads,
  likeThread,
  addComment,
  deleteThread,
  deleteComment
} = require("../controller/threadController");
const { protect } = require("../middlewares/authMiddleware");

// ── Cloudinary Image upload setup ──────────────────────────────────────────────
// Apna naya master Cloudinary middleware import karo
// Make sure path sahi ho tumhare project structure ke hisaab se
const {upload} = require("../config/cloudinary"); 

// ── Routes ────────────────────────────────────────────────────────────────────
router.get("/", protect, getThreads);

// Naya Cloudinary middleware: upload.array("images", 5) lagaya gaya hai
router.post("/", protect, (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      // Yeh exact error object ko terminal me print karega
      console.error("MULTER/CLOUDINARY ERROR DETAILS:", err); 
      return res.status(500).json({ message: "Upload failed", details: err });
    }
    next();
  });
}, createThread);

router.put("/:id/like", protect, likeThread);
router.post("/:id/comment", protect, addComment);
router.delete("/:id", protect, deleteThread);
router.delete("/:threadId/comment/:commentId", protect, deleteComment);

module.exports = router;