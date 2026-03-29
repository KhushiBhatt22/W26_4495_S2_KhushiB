const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  age: { type: Number },
  gender: { type: String, enum: ["male", "female", "other"] },
  genre: { type: String },
  targetAudience: { type: String },
  timeTaken: { type: String },
  wouldRecommend: { type: String, enum: ["yes", "no", "maybe"] },
  rating: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model("Survey", surveySchema);