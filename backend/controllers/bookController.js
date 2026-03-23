const BookModel = require('../models/bookModel');

// @GET /api/v1/books
const getAllBooks = async (req, res, next) => {
  try {
    const books = await BookModel.getAll(req.query);
    res.status(200).json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
};

// @GET /api/v1/books/:id
const getBookById = async (req, res, next) => {
  try {
    const book = await BookModel.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// @POST /api/v1/books
const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, genre, total_copies } = req.body;

    if (!title || !author || !isbn) {
      return res.status(400).json({
        success: false,
        message: 'Title, author and ISBN are required.',
      });
    }

    const existing = await BookModel.findByIsbn(isbn);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A book with this ISBN already exists.',
      });
    }

    const id = await BookModel.create({
      title, author, isbn, genre, total_copies: total_copies || 1
    });

    // Create book copies in book_copies table
    const db = require('../config/db');
    for (let i = 1; i <= (total_copies || 1); i++) {
      await db.query(
        'INSERT INTO book_copies (book_id, copy_code) VALUES (?, ?)',
        [id, `${isbn}-COPY-${i}`]
      );
    }

    const book = await BookModel.findById(id);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/v1/books/:id
const updateBook = async (req, res, next) => {
  try {
    const book = await BookModel.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    await BookModel.update(req.params.id, req.body);
    const updated = await BookModel.findById(req.params.id);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// @DELETE /api/v1/books/:id
const deleteBook = async (req, res, next) => {
  try {
    const book = await BookModel.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    await BookModel.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Book deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };