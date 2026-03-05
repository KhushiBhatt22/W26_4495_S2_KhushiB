const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // person who liked
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    }, // book that was liked
  },
  { timestamps: true }
);

// Prevent duplicate likes
likeSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);