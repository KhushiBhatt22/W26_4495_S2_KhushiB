const Message = require("../models/Message");
const User = require("../models/User");

// Get all conversations (unique users I've chatted with)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "name avatar")
      .populate("receiverId", "name avatar");

    // Get unique conversation partners
    const seen = new Set();
    const conversations = [];

    for (const msg of messages) {
      const other = msg.senderId._id.toString() === userId.toString()
        ? msg.receiverId
        : msg.senderId;

      if (!seen.has(other._id.toString())) {
        seen.add(other._id.toString());

        const unreadCount = await Message.countDocuments({
          senderId: other._id,
          receiverId: userId,
          read: false,
        });

        conversations.push({
          user: other,
          lastMessage: msg.text,
          lastTime: msg.createdAt,
          unread: unreadCount,
        });
      }
    }

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { senderId: otherId, receiverId: userId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, text } = req.body;

    const message = await Message.create({ senderId, receiverId, text });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users I can message (following)
exports.getMessageableUsers = async (req, res) => {
  try {
    const Follow = require("../models/Follow");
    const userId = req.user._id;

    const following = await Follow.find({ follower: userId })
      .populate("following", "name avatar email");

    const users = following.map(f => f.following);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherId = req.params.userId;
    await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId },
      ]
    });
    res.json({ message: "Conversation deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};