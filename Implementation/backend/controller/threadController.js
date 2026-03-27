const Thread = require("../models/Thread");
const BASE_URL = process.env.BASE_URL || "http://localhost:8000";

// @desc    Create a thread
// @route   POST /api/threads
// @access  Private
// controller/threadController.js mein isey replace karo:

exports.createThread = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    // Yeh line batayegi ki files successfully aayi ya nahi
    console.log("✅ Files reached controller:", req.files);

    // Dhyan do: f.path use karna hai
    const images = req.files ? req.files.map(f => f.path) : [];

    const thread = await Thread.create({
      user: req.user._id,
      text,
      images,
    });

    const populated = await Thread.findById(thread._id).populate("user", "name avatar");
    res.status(201).json(populated);
    
  } catch (err) {
    // Agar DB save karne mein fail hua toh ye print hoga
    console.error(" DATABASE ERROR DETAILS:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all threads
// @route   GET /api/threads
// @access  Private
exports.getThreads = async (req, res) => {
  try {
    const threads = await Thread.find()
      .populate("user", "name avatar")
      .populate("comments.user", "name avatar")
      .sort({ createdAt: -1 });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Like / Unlike a thread
// @route   PUT /api/threads/:id/like
// @access  Private
exports.likeThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const liked = thread.likes.includes(req.user._id);
    if (liked) {
      thread.likes = thread.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      thread.likes.push(req.user._id);
    }
    await thread.save();
    res.json({ likes: thread.likes.length, isLiked: !liked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add comment to thread
// @route   POST /api/threads/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    thread.comments.push({ user: req.user._id, text });
    await thread.save();

    const updated = await Thread.findById(req.params.id)
      .populate("user", "name avatar")
      .populate("comments.user", "name avatar");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a thread
// @route   DELETE /api/threads/:id
// @access  Private
exports.deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    if (thread.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });
    await thread.deleteOne();
    res.json({ message: "Thread deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @desc    Delete a comment
// @route   DELETE /api/threads/:threadId/comment/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const comment = thread.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    comment.deleteOne();
    await thread.save();

    const updated = await Thread.findById(req.params.threadId)
      .populate("user", "name avatar")
      .populate("comments.user", "name avatar");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};