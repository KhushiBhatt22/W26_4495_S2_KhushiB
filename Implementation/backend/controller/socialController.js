const Follow = require("../models/Follow");
const User = require("../models/User");
const Book = require("../models/Book");
// Follow a user
exports.followUser = async (req, res) => {
  try {
    const followerId = req.user._id;
    const followingId = req.params.userId;

    if (followerId.toString() === followingId) 
      return res.status(400).json({ message: "Can't follow yourself" });

    await Follow.create({ follower: followerId, following: followingId });
    res.json({ message: "Followed successfully" });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Already following" });
    res.status(500).json({ message: err.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    await Follow.findOneAndDelete({
      follower: req.user._id,
      following: req.params.userId,
    });
    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if current user follows another
exports.getFollowStatus = async (req, res) => {
  try {
    const follow = await Follow.findOne({
      follower: req.user._id,
      following: req.params.userId,
    });
    res.json({ isFollowing: !!follow });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    const followersCount = await Follow.countDocuments({ following: req.params.userId });
    const followingCount = await Follow.countDocuments({ follower: req.params.userId });
    const postsCount = await Book.countDocuments({ userId: req.params.userId });

    res.json({ user, followersCount, followingCount, postsCount });
  } catch (err) {
    console.error("getUserProfile error:", err.message); // ← add this
    res.status(500).json({ message: err.message });
  }
};


// Like a book — placeholder (needs Book model)
exports.likeBook = async (req, res) => {
  res.json({ message: "likeBook - coming soon" });
};

// Unlike a book — placeholder (needs Book model)
exports.unlikeBook = async (req, res) => {
  res.json({ message: "unlikeBook - coming soon" });
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get users you already follow
    const following = await Follow.find({ follower: currentUserId }).select("following");
    const followingIds = following.map(f => f.following);

    // Suggest users you don't follow (exclude yourself)
    const suggested = await User.find({
      _id: { $nin: [...followingIds, currentUserId] }
    }).select("name email avatar").limit(5);

    // Attach isFollowing flag (will be false for all, but good for consistency)
    const result = suggested.map(u => ({ ...u._doc, isFollowing: false }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};