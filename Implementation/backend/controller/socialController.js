const Follow = require("../models/Follow");
const User = require("../models/User");
const Book = require("../models/Book");
const Like = require("../models/Like");
const mongoose = require("mongoose");

// ─── Helper: enrich books with like status + counts ──────────────────────────
const enrichBooksWithLikes = async (books, currentUserId) => {
  if (!books || books.length === 0) return [];

  const bookIds = books.map((b) => b._id);

  const [likedDocs, likeCounts] = await Promise.all([
    Like.find({ userId: currentUserId, bookId: { $in: bookIds } }).select("bookId"),
    Like.aggregate([
      { $match: { bookId: { $in: bookIds.map((id) => new mongoose.Types.ObjectId(id.toString())) } } },
      { $group: { _id: "$bookId", count: { $sum: 1 } } },
    ]),
  ]);

  const likedSet = new Set(likedDocs.map((l) => l.bookId.toString()));
  const likeCountMap = {};
  likeCounts.forEach((l) => { likeCountMap[l._id.toString()] = l.count; });

  return books.map((b) => ({
    ...b.toObject(),
    isLiked: likedSet.has(b._id.toString()),
    likesCount: likeCountMap[b._id.toString()] || 0,
  }));
};

// ─── Follow ──────────────────────────────────────────────────────────────────

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

// ─── User Profile ─────────────────────────────────────────────────────────────

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

    const enrichedBooks = await enrichBooksWithLikes(books, currentUserId);

    res.json({
      user,
      followersCount,
      followingCount,
      postsCount,
      isFollowing: !!followRecord,
      books: enrichedBooks,
    });
  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── Feed ─────────────────────────────────────────────────────────────────────

exports.getFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const following = await Follow.find({ follower: currentUserId }).select("following");
    const followingIds = following.map((f) => f.following);

    if (followingIds.length === 0) {
      return res.json([]);
    }

    const books = await Book.find({ userId: { $in: followingIds } })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    if (books.length === 0) {
      return res.json([]);
    }

    const enriched = await enrichBooksWithLikes(books, currentUserId);
    res.json(enriched);
  } catch (err) {
    console.error("getFeed error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── Like / Unlike ────────────────────────────────────────────────────────────

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

// ─── Suggested Users ──────────────────────────────────────────────────────────

exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const following = await Follow.find({ follower: currentUserId }).select("following");
    const followingIds = following.map((f) => f.following);

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

// ─── Followers / Following Lists ──────────────────────────────────────────────

exports.getFollowers = async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.userId })
      .populate("follower", "name avatar")
      .sort({ createdAt: -1 });

    res.json(followers.map((f) => f.follower));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.userId })
      .populate("following", "name avatar")
      .sort({ createdAt: -1 });

    res.json(following.map((f) => f.following));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};