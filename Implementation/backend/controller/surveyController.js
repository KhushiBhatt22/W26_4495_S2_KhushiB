const Survey = require("../models/Survey");

exports.submitSurvey = async (req, res) => {
  try {
    const { bookId, age, gender, genre, targetAudience, timeTaken, wouldRecommend, rating } = req.body;
    const survey = await Survey.create({
      userId: req.user._id,
      bookId, age, gender, genre,
      targetAudience, timeTaken, wouldRecommend, rating,
    });
    res.status(201).json(survey);
  } catch (err) {
    console.error("Survey error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getSurveyAnalytics = async (req, res) => {
  try {
    const [
      totalSurveys,
      genderData,
      ageData,
      genreData,
      audienceData,
      recommendData,
      ratingData,
      timeTakenData,
    ] = await Promise.all([
      Survey.countDocuments(),
      Survey.aggregate([
        { $match: { gender: { $ne: null } } },
        { $group: { _id: "$gender", count: { $sum: 1 } } },
      ]),
      Survey.aggregate([
        { $match: { age: { $ne: null } } },
        {
          $bucket: {
            groupBy: "$age",
            boundaries: [0, 18, 25, 35, 45, 60, 100],
            default: "Other",
            output: { count: { $sum: 1 } },
          },
        },
      ]),
      Survey.aggregate([
        { $match: { genre: { $ne: null } } },
        { $group: { _id: "$genre", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Survey.aggregate([
        { $match: { targetAudience: { $ne: null } } },
        { $group: { _id: "$targetAudience", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Survey.aggregate([
        { $match: { wouldRecommend: { $ne: null } } },
        { $group: { _id: "$wouldRecommend", count: { $sum: 1 } } },
      ]),
      Survey.aggregate([
        { $match: { rating: { $ne: null } } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Survey.aggregate([
        { $match: { timeTaken: { $ne: null } } },
        { $group: { _id: "$timeTaken", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const ageLabels = { 0: "Under 18", 18: "18-24", 25: "25-34", 35: "35-44", 45: "45-59", 60: "60+" };

    res.json({
      totalSurveys,
      genderData,
      ageData: ageData.map(a => ({ name: ageLabels[a._id] || a._id, count: a.count })),
      genreData,
      audienceData,
      recommendData,
      ratingData,
      timeTakenData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};