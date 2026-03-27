const express = require("express");
const router = express.Router();
const {
  createBook, getBooks, getAllBooksPublic,
  getBookById, getBookByIdPublic,
  updateBook, deleteBook, updateBookCover,
} = require("../controller/bookController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const trackActivity = require("../middlewares/trackActivity");

router.use(protect);
// IMPORTANT: specific named routes MUST come before /:id wildcard
router.get("/explore", getAllBooksPublic);
router.get("/public/:id", getBookByIdPublic);
router.post("/", createBook);
router.get("/", getBooks);
router.put("/cover/:id", upload, updateBookCover);
router.get("/:id", getBookById);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);
router.post("/", protect, trackActivity("create_book"), createBook);
router.delete("/:id", protect, trackActivity("delete_book"), deleteBook);
router.get("/explore", protect, trackActivity("explore"), getAllBooksPublic);

module.exports = router;