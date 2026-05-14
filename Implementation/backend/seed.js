require("dotenv").config();
const mongoose = require("mongoose");
const ActivityLog = require("./models/ActivityLog");
const User = require("./models/User");

const ACTIONS = [
  "create_book", "create_book", "create_book",
  "like", "like", "like", "like",
  "follow", "follow",
  "view_feed", "view_feed", "view_feed",
  "explore",
  "like_thread", "create_thread",
  "comment_thread",
];

const randomDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(Math.floor(Math.random() * 23));
  d.setMinutes(Math.floor(Math.random() * 59));
  return d;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Get all users
    const users = await User.find().select("_id");
    if (users.length === 0) {
      console.log("No users found — create some users first");
      process.exit(1);
    }

    console.log(`Found ${users.length} user(s) — seeding activity logs...`);

    const logs = [];

    // Spread activity across last 7 days
    for (let day = 0; day <= 6; day++) {
      const actionsPerDay = Math.floor(Math.random() * 6) + 3; // 3-8 actions per day
      for (let i = 0; i < actionsPerDay; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        logs.push({
          userId: randomUser._id,
          action: randomAction,
          metadata: {},
          createdAt: randomDate(day),
        });
      }
    }

    await ActivityLog.insertMany(logs);
    console.log(`Seeded ${logs.length} activity logs across last 7 days`);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
};

seed();