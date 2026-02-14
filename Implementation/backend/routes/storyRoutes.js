const express = require("express");
const router = express.Router();
const {
  createStory,
  getAllStories,
  getUserStories,
  deleteStory,
} = require("../controller/storyController");
const { protect } = require("../middlewares/authMiddleware");

// Apply protect middleware to all routes in this file
// This uses your provided JWT logic to populate req.user
router.use(protect);

// Route for the main feed and creating new AI stories
router.route("/")
  .get(getAllStories)    // To show the round circles on the landing page
  .post(createStory);    // To save a newly generated AI story

// Route for deleting a specific story by ID
router.route("/:id")
  .delete(deleteStory);

// Route for viewing stories of a specific user (useful for profile pages)
router.route("/user/:userId")
  .get(getUserStories);

module.exports = router;