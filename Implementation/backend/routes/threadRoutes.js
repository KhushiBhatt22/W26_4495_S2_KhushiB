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
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Image upload setup ────────────────────────────────────────────────────────
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `thread-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb("Images only!");
  },
}).array("images", 5); // max 5 images

// ── Routes ────────────────────────────────────────────────────────────────────
router.get("/", protect, getThreads);

router.post("/", protect, (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err });
    next();
  });
}, createThread);

router.put("/:id/like", protect, likeThread);
router.post("/:id/comment", protect, addComment);
router.delete("/:id", protect, deleteThread);
router.delete("/:threadId/comment/:commentId", protect, deleteComment);

module.exports = router;