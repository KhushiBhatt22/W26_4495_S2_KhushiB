const express = require("express");
const router = express.Router();
const {
  generateOutline,
  generateChapterContent,
  generateStoryImage,
  completeChapterContent,
  generateAvatar,
  improveThread
} = require("../controller/aiController");
const { protect } = require("../middlewares/authMiddleware");

// Apply protect middleware to all routes
router.use(protect);

router.post("/generate-outline", generateOutline);
router.post("/generate-chapter-content", generateChapterContent);
router.post("/generate-story-image", generateStoryImage);
router.post("/complete-chapter-content", protect, completeChapterContent);
router.post("/generate-avatar",  generateAvatar);
router.post("/improve-thread", improveThread);
module.exports = router;