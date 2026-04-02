const Story = require("../models/Story");

// @desc    Create a new AI-generated story
// @route   POST /api/stories
// @access  Private
const createStory = async (req, res) => {
  try {
    const { imageUrl, prompt, style } = req.body;

    if (!imageUrl || !prompt) {
      return res.status(400).json({ message: "Image and prompt are required" });
    }

    const story = await Story.create({
      user: req.user._id, // Matching your auth middleware
      imageUrl,
      prompt,
      style,
    });

    res.status(201).json(story);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating story" });
  }
};

// @desc    Get all active stories (for the top feed)
// @route   GET /api/stories
// @access  Private
const getAllStories = async (req, res) => {
  try {
    const Follow = require("../models/Follow");
    const currentUserId = req.user._id;

    // Get followed users
    const following = await Follow.find({ follower: currentUserId }).select("following");
    const followingIds = following.map(f => f.following);

    // Include own stories too
    followingIds.push(currentUserId);

    const stories = await Story.find({ user: { $in: followingIds } })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get stories for a specific user
// @route   GET /api/stories/user/:userId
// @access  Private
const getUserStories = async (req, res) => {
  try {
    const stories = await Story.find({ user: req.params.userId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a story (if user wants to remove it early)
// @route   DELETE /api/stories/:id
// @access  Private
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Check ownership
    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await story.deleteOne();
    res.status(200).json({ message: "Story removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createStory,
  getAllStories,
  getUserStories,
  deleteStory,
};