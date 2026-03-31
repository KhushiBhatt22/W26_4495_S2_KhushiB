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

router.get("/feed", protect, trackActivity("view_feed"), getFeed);
router.get("/suggested", protect, getSuggestedUsers);
router.get("/profile/:userId", protect, getUserProfile);
router.post("/follow/:userId", protect, trackActivity("follow"), followUser);
router.delete("/follow/:userId", protect, trackActivity("unfollow"), unfollowUser);
router.get("/follow-status/:userId", protect, getFollowStatus);
router.post("/like/:bookId", protect, trackActivity("like"), likeBook);
router.delete("/like/:bookId", protect, trackActivity("unlike"), unlikeBook);
router.get("/followers/:userId", protect, getFollowers);
router.get("/following/:userId", protect, getFollowing);

module.exports = router;