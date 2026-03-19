const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  followUser,
  unfollowUser,
  getFollowStatus,
  likeBook,
  unlikeBook,
  getUserProfile,
  getFeed,
  getSuggestedUsers,
} = require("../controller/socialController");

router.get("/feed", protect, getFeed);
router.get("/suggested", protect, getSuggestedUsers);
router.get("/profile/:userId", protect, getUserProfile);
router.post("/follow/:userId", protect, followUser);
router.delete("/follow/:userId", protect, unfollowUser);
router.get("/follow-status/:userId", protect, getFollowStatus);
router.post("/like/:bookId", protect, likeBook);
router.delete("/like/:bookId", protect, unlikeBook);

module.exports = router;