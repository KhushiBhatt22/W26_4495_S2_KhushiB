const Book = require("../models/Book");
const Like = require("../models/Like");
const mongoose = require("mongoose");

// Helper: enrich books array with isLiked + likesCount for a given user
const enrichWithLikes = async (books, currentUserId) => {
  if (!books || books.length === 0) return [];

  const bookIds = books.map((b) => b._id);
  const objectIds = bookIds.map((id) => new mongoose.Types.ObjectId(id.toString()));

  const [likedDocs, likeCounts] = await Promise.all([
    Like.find({ userId: currentUserId, bookId: { $in: bookIds } }).select("bookId"),
    Like.aggregate([
      { $match: { bookId: { $in: objectIds } } },
      { $group: { _id: "$bookId", count: { $sum: 1 } } },
    ]),
  ]);

  const likedSet = new Set(likedDocs.map((l) => l.bookId.toString()));
  const likeCountMap = {};
  likeCounts.forEach((l) => { likeCountMap[l._id.toString()] = l.count; });

  return books.map((b) => ({
    ...b.toObject(),
    isLiked: likedSet.has(b._id.toString()),
    likesCount: likeCountMap[b._id.toString()] || 0,
  }));
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Private
const createBook = async (req, res) => {
  try {
    const { title, author, subtitle, chapters } = req.body;
    if (!title || !author)
      return res.status(400).json({ message: "Please provide a title and author" });
    const book = await Book.create({ userId: req.user._id, title, author, subtitle, chapters });
    res.status(201).json(book);
  } catch (error) {
    console.error("createBook:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all books for the logged-in user (own books only)
// @route   GET /api/books
// @access  Private
const getBooks = async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    console.error("getBooks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get ALL books from every user — for Explore page
// @route   GET /api/books/all
// @access  Private
const getAllBooks = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const books = await Book.find({})
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(100);

    const enriched = await enrichWithLikes(books, currentUserId);
    res.status(200).json(enriched);
  } catch (error) {
    console.error("getAllBooks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get ALL books from every user — for Explore page (alias)
// @route   GET /api/books/explore
// @access  Private
const getAllBooksPublic = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const books = await Book.find({})
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(100);

    const enriched = await enrichWithLikes(books, currentUserId);
    res.status(200).json(enriched);
  } catch (error) {
    console.error("getAllBooksPublic:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single book by ID — any logged-in user can read
// @route   GET /api/books/:id
// @access  Private
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    console.error("getBookById:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single book by ID — populated with author info
// @route   GET /api/books/public/:id
// @access  Private
const getBookByIdPublic = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("userId", "name avatar");
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    console.error("getBookByIdPublic:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized to update this book" });
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedBook);
  } catch (error) {
    console.error("updateBook:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized to delete this book" });
    await book.deleteOne();
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("deleteBook:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a book's cover image
// @route   PUT /api/books/cover/:id
// @access  Private
const updateBookCover = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized to update this book" });
    if (!req.file) return res.status(400).json({ message: "No image file provided" });
    book.coverImage = `/${req.file.path}`;
    const updatedBook = await book.save();
    res.status(200).json(updatedBook);
  } catch (error) {
    console.error("updateBookCover:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createBook,
  getBooks,
  getAllBooks,
  getAllBooksPublic,
  getBookById,
  getBookByIdPublic,
  updateBook,
  deleteBook,
  updateBookCover,
};