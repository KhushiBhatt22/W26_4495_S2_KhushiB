const express = require("express");
const router = express.Router();
const {
  createThread,
  getThreads,
  likeThread,
  addComment,
  deleteThread,
  deleteComment,
} = require("../controller/threadController");
const { protect } = require("../middlewares/authMiddleware");
const trackActivity = require("../middlewares/trackActivity");
const { upload } = require("../config/cloudinary");

router.get("/", protect, getThreads);

router.post("/", protect, (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      console.error("MULTER/CLOUDINARY ERROR DETAILS:", err);
      return res.status(500).json({ message: "Upload failed", details: err });
    }
    next();
  });
}, trackActivity("create_thread"), createThread);

router.put("/:id/like", protect, trackActivity("like_thread"), likeThread);
router.post("/:id/comment", protect, trackActivity("comment_thread"), addComment);
router.delete("/:id", protect, trackActivity("delete_thread"), deleteThread);
router.delete("/:threadId/comment/:commentId", protect, deleteComment);

module.exports = router;