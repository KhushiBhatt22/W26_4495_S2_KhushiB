const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const trackActivity = require("../middlewares/trackActivity");
const {
  followUser,
  unfollowUser,
  getFollowStatus,
  likeBook,
  unlikeBook,
  getUserProfile,
  getFeed,
  getSuggestedUsers,
  getFollowers,
  getFollowing,
} = require("../controller/socialController");

router.get("/feed", protect, getFeed);
router.get("/suggested", protect, getSuggestedUsers);
router.get("/profile/:userId", protect, getUserProfile);
router.post("/follow/:userId", protect, followUser);
router.delete("/follow/:userId", protect, unfollowUser);
router.get("/follow-status/:userId", protect, getFollowStatus);
router.post("/like/:bookId", protect, likeBook);
router.delete("/like/:bookId", protect, unlikeBook);
router.get("/followers/:userId", protect, getFollowers);
router.get("/following/:userId", protect, getFollowing);
router.post("/follow/:userId", protect, trackActivity("follow"), followUser);
router.post("/like/:bookId", protect, trackActivity("like"), likeBook);
router.delete("/unlike/:bookId", protect, trackActivity("unlike"), unlikeBook);

module.exports = router;