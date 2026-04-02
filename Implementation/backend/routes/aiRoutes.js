const express = require("express");
const router = express.Router();
const {
  generateOutline,
  editAvatar,
  generateChapterContent,
  generateStoryImage,
  generateChapterImage,
  completeChapterContent,
  generateAvatar,
  improveThread,
  generateBookCover,
  generateContentImages
} = require("../controller/aiController");
const { protect } = require("../middlewares/authMiddleware");

// Apply protect middleware to all routes
router.use(protect);

router.post("/generate-outline", generateOutline);
router.post("/generate-chapter-content", generateChapterContent);
router.post("/generate-story-image", generateStoryImage);
router.post("/edit-avatar", editAvatar);
router.post("/generate-chapter-image", generateChapterImage);
router.post("/complete-chapter-content", protect, completeChapterContent);
router.post("/generate-avatar",  generateAvatar);
router.post("/improve-thread", improveThread);
router.post("/generate-book-cover", generateBookCover);
router.post("/generate-content-images", generateContentImages);
module.exports = router;