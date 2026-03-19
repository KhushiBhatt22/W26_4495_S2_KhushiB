const Follow = require("../models/Follow");
const User = require("../models/User");
const Book = require("../models/Book");
const Like = require("../models/Like");

// ─── Follow ──────────────────────────────────────────────────────────────────

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

// Get a user's public profile with follow status, books, and counts
exports.getUserProfile = async (req, res) => {
  try {
    const profileId = req.params.userId;
    const currentUserId = req.user._id;

    const user = await User.findById(profileId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const [followersCount, followingCount, postsCount, followRecord, books] = await Promise.all([
      Follow.countDocuments({ following: profileId }),
      Follow.countDocuments({ follower: profileId }),
      Book.countDocuments({ userId: profileId }),
      Follow.findOne({ follower: currentUserId, following: profileId }),
      Book.find({ userId: profileId }).sort({ createdAt: -1 }),
    ]);

    // Attach like status and count to each book
    const likedBookIds = await Like.find({
      userId: currentUserId,
      bookId: { $in: books.map((b) => b._id) },
    }).select("bookId");
    const likedSet = new Set(likedBookIds.map((l) => l.bookId.toString()));

    const likeCounts = await Like.aggregate([
      { $match: { bookId: { $in: books.map((b) => b._id) } } },
      { $group: { _id: "$bookId", count: { $sum: 1 } } },
    ]);
    const likeCountMap = {};
    likeCounts.forEach((l) => { likeCountMap[l._id.toString()] = l.count; });

    const enrichedBooks = books.map((b) => ({
      ...b.toObject(),
      isLiked: likedSet.has(b._id.toString()),
      likesCount: likeCountMap[b._id.toString()] || 0,
    }));

    res.json({
      user,
      followersCount,
      followingCount,
      postsCount,
      isFollowing: !!followRecord,
      books: enrichedBooks,
    });
  } catch (err) {
    console.error("getUserProfile error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ─── Like / Unlike ───────────────────────────────────────────────────────────

// Like a book
exports.likeBook = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookId = req.params.bookId;

    await Like.create({ userId, bookId });

    const likesCount = await Like.countDocuments({ bookId });
    res.json({ message: "Liked", likesCount });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Already liked" });
    res.status(500).json({ message: err.message });
  }
};

// Unlike a book
exports.unlikeBook = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookId = req.params.bookId;

    await Like.findOneAndDelete({ userId, bookId });

    const likesCount = await Like.countDocuments({ bookId });
    res.json({ message: "Unliked", likesCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Feed ────────────────────────────────────────────────────────────────────

// Get feed: books from users the current user follows, enriched with like status
exports.getFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get all users the current user follows
    const following = await Follow.find({ follower: currentUserId }).select("following");
    const followingIds = following.map((f) => f.following);

    if (followingIds.length === 0) {
      return res.json([]);
    }

    // Get books from followed users, newest first
    const books = await Book.find({ userId: { $in: followingIds } })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    // Attach like status for the current user
    const likedDocs = await Like.find({
      userId: currentUserId,
      bookId: { $in: books.map((b) => b._id) },
    }).select("bookId");
    const likedSet = new Set(likedDocs.map((l) => l.bookId.toString()));

    // Attach like counts
    const likeCounts = await Like.aggregate([
      { $match: { bookId: { $in: books.map((b) => b._id) } } },
      { $group: { _id: "$bookId", count: { $sum: 1 } } },
    ]);
    const likeCountMap = {};
    likeCounts.forEach((l) => { likeCountMap[l._id.toString()] = l.count; });

    const enriched = books.map((b) => ({
      ...b.toObject(),
      isLiked: likedSet.has(b._id.toString()),
      likesCount: likeCountMap[b._id.toString()] || 0,
    }));

    res.json(enriched);
  } catch (err) {
    console.error("getFeed error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ─── Suggested Users ─────────────────────────────────────────────────────────

exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get users the current user already follows
    const following = await Follow.find({ follower: currentUserId }).select("following");
    const followingIds = following.map((f) => f.following);

    // Suggest users not yet followed (exclude self)
    const suggested = await User.find({
      _id: { $nin: [...followingIds, currentUserId] },
    })
      .select("name email avatar bio")
      .limit(6);

    const result = suggested.map((u) => ({ ...u._doc, isFollowing: false }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};