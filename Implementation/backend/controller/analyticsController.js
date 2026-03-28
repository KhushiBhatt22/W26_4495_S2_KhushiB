const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const Book = require("../models/Book");
const mongoose = require("mongoose");

exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Date filter
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);
    const hasDateFilter = from || to;

    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalBooks, totalActions] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      ActivityLog.countDocuments(hasDateFilter ? { createdAt: dateFilter } : {}),
    ]);

    // Daily active users
    const dauResult = await ActivityLog.distinct("userId", {
      createdAt: { $gte: todayStart },
    });

    // Most used actions
    const mostUsedActions = await ActivityLog.aggregate([
      ...(hasDateFilter ? [{ $match: { createdAt: dateFilter } }] : []),
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Last 7 days graph
    const last7DaysData = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top active users
    const userWiseActivity = await ActivityLog.aggregate([
      ...(hasDateFilter ? [{ $match: { createdAt: dateFilter } }] : []),
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          avatar: "$user.avatar",
          count: 1,
        },
      },
    ]);

    // Gender distribution
    const genderData = await User.aggregate([
      { $match: { gender: { $ne: null } } },
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]);

    // Age group distribution
    const ageData = await User.aggregate([
      { $match: { age: { $ne: null } } },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 18, 25, 35, 45, 60, 100],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const ageLabels = {
      0: "Under 18", 18: "18-24", 25: "25-34",
      35: "35-44", 45: "45-59", 60: "60+",
    };

    const formattedAge = ageData.map((a) => ({
      name: ageLabels[a._id] || a._id,
      count: a.count,
    }));

    res.json({
      totalUsers,
      totalBooks,
      totalActions,
      dailyActiveUsers: dauResult.length,
      mostUsedActions,
      last7DaysData,
      userWiseActivity,
      genderData,
      ageData: formattedAge,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: err.message });
  }
};