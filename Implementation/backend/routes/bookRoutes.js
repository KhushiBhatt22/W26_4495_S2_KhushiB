const express = require("express");
const router = express.Router();
const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  updateBookCover,
  getPublicFeed,
  toggleLike,
  addComment,
  getAllBooks
} = require("../controller/bookController");

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Apply protect middleware to all routes in this file

router.get("/all", protect, getAllBooks);
router.use(protect);

// router.get("/feed", getPublicFeed);
// router.post("/:id/like", toggleLike);
// router.post("/:id/comment", addComment);

router.route("/").post(createBook).get(getBooks);
router.route("/:id").get(getBookById).put(updateBook).delete(deleteBook);
router.route("/cover/:id").put(upload, updateBookCover);

module.exports = router;
