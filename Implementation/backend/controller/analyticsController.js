const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const Book = require("../models/Book");

exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    // Total users & books
    const [totalUsers, totalBooks, totalActions] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      ActivityLog.countDocuments(),
    ]);

    // Daily active users (today)
    const dauResult = await ActivityLog.distinct("userId", {
      createdAt: { $gte: todayStart },
    });
    const dailyActiveUsers = dauResult.length;

    // Most used actions
    const mostUsedActions = await ActivityLog.aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Last 7 days graph data
    const last7DaysData = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User-wise activity (top 5 most active users)
    const userWiseActivity = await ActivityLog.aggregate([
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

    res.json({
      totalUsers,
      totalBooks,
      totalActions,
      dailyActiveUsers,
      mostUsedActions,
      last7DaysData,
      userWiseActivity,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: err.message });
  }
};