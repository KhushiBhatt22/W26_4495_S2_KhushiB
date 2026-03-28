const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controller/analyticsController");
const { protect } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Admin only!
router.get("/dashboard", protect, adminMiddleware, getDashboard);

module.exports = router;