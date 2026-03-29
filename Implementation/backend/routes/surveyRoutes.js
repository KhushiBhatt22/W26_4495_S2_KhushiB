const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { submitSurvey, getSurveyAnalytics } = require("../controller/surveyController");

router.post("/submit", protect, submitSurvey);
router.get("/analytics", protect, adminMiddleware, getSurveyAnalytics);

module.exports = router;