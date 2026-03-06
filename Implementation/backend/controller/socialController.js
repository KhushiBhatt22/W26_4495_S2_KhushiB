const Follow = require("../models/Follow");
const Like = require("../models/Like");
const Book = require("../models/Book");
const User = require("../models/User");

// ─── FOLLOW / UNFOLLOW ───────────────────────────────────────────────

// @route  POST /api/social/follow/:userId
// @access Private
exports.followUser = async (req, res) => {
  try {
    const following = req.params.userId;
    const follower = req.user._id;

    if (follower.toString() === following) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existing = await Follow.findOne({ follower, following });
    if (existing) {
      return res.status(400).json({ message: "Already following" });
    }

    await Follow.create({ follower, following });
    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @route  DELETE /api/social/follow/:userId
// @access Private
exports.unfollowUser = async (req, res) => {
  try {
    const following = req.params.userId;
    const follower = req.user._id;

    await Follow.findOneAndDelete({ follower, following });
    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @route  GET /api/social/follow-status/:userId
// @access Private
exports.getFollowStatus = async (req, res) => {
  try {
    const following = req.params.userId;
    const follower = req.user._id;

    const exists = await Follow.findOne({ follower, following });
    const followersCount = await Follow.countDocuments({ following });
    const followingCount = await Follow.countDocuments({ follower: following });

    res.status(200).json({
      isFollowing: !!exists,
      followersCount,
      followingCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── LIKE / UNLIKE ───────────────────────────────────────────────────

// @route  POST /api/social/like/:bookId
// @access Private
exports.likeBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const userId = req.user._id;

    const existing = await Like.findOne({ userId, bookId });
    if (existing) {
      return res.status(400).json({ message: "Already liked" });
    }

    await Like.create({ userId, bookId });
    const likesCount = await Like.countDocuments({ bookId });
    res.status(200).json({ message: "Liked successfully", likesCount });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @route  DELETE /api/social/like/:bookId
// @access Private
exports.unlikeBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const userId = req.user._id;

    await Like.findOneAndDelete({ userId, bookId });
    const likesCount = await Like.countDocuments({ bookId });
    res.status(200).json({ message: "Unliked successfully", likesCount });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET USER PROFILE (public) ───────────────────────────────────────

// @route  GET /api/social/profile/:userId
// @access Private
exports.getUserProfile = async (req, res) => {
  try {
    const profileUserId = req.params.userId;
    const currentUserId = req.user._id;

    const user = await User.findById(profileUserId).select("name email avatar");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get books
    const books = await Book.find({ userId: profileUserId }).sort({ createdAt: -1 });

    // Get like counts for each book + whether current user liked it
    const booksWithLikes = await Promise.all(
      books.map(async (book) => {
        const likesCount = await Like.countDocuments({ bookId: book._id });
        const isLiked = await Like.findOne({ userId: currentUserId, bookId: book._id });
        return { ...book.toObject(), likesCount, isLiked: !!isLiked };
      })
    );

    // Followers / following counts
    const followersCount = await Follow.countDocuments({ following: profileUserId });
    const followingCount = await Follow.countDocuments({ follower: profileUserId });

    // Is current user following this profile?
    const isFollowing = await Follow.findOne({
      follower: currentUserId,
      following: profileUserId,
    });

    res.status(200).json({
      user,
      books: booksWithLikes,
      followersCount,
      followingCount,
      postsCount: books.length,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};