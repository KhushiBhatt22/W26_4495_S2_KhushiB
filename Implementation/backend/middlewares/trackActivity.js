const ActivityLog = require("../models/ActivityLog");

const trackActivity = (action) => async (req, res, next) => {
  res.on("finish", async () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        if (req.user?._id) {
          await ActivityLog.create({
            userId: req.user._id,
            action,
            metadata: { ip: req.ip },
          });
        }
      } catch (err) {
        console.error("Activity log error:", err);
      }
    }
  });
  next();
};

module.exports = trackActivity;