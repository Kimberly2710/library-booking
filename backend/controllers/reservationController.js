const ReservationModel = require('../models/reservationModel');
const BookModel = require('../models/bookModel');

// @GET /api/v1/reservations
const getAllReservations = async (req, res, next) => {
  try {
    await ReservationModel.markOverdue();
    const reservations = await ReservationModel.getAll(req.query);
    res.status(200).json({ success: true, data: reservations });
  } catch (err) {
    next(err);
  }
};

// @GET /api/v1/reservations/:id
const getReservationById = async (req, res, next) => {
  try {
    const reservation = await ReservationModel.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.',
      });
    }
    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    next(err);
  }
};

// @POST /api/v1/reservations
const createReservation = async (req, res, next) => {
  try {
    const { book_id, member_id, days } = req.body;

    if (!book_id || !member_id) {
      return res.status(400).json({
        success: false,
        message: 'book_id and member_id are required.',
      });
    }

    // Check book exists and has available copies
    const book = await BookModel.findById(book_id);
    if (!book) {
      return res.status(404).json({
        success: false, message: 'Book not found.',
      });
    }
    if (book.available_copies < 1) {
      return res.status(400).json({
        success: false, message: 'No copies available for this book.',
      });
    }

    // Check member has no overdue books
    const hasOverdue = await ReservationModel.hasOverdue(member_id);
    if (hasOverdue) {
      return res.status(403).json({
        success: false,
        message: 'Member has overdue books. Please return them first.',
      });
    }

    // Get an available copy
    const copy = await ReservationModel.getAvailableCopy(book_id);
    if (!copy) {
      return res.status(400).json({
        success: false, message: 'No physical copy available.',
      });
    }

    // Calculate dates
    const borrowed_date = new Date().toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + (days || 14));
    const due_date = due.toISOString().split('T')[0];

    // Create reservation
    const id = await ReservationModel.create({
      user_id: member_id, book_id, copy_id: copy.id,
      borrowed_date, due_date,
    });

    // Mark copy as unavailable and reduce available count
    await ReservationModel.setCopyAvailability(copy.id, false);
    await BookModel.updateCopies(book_id, -1);

    const reservation = await ReservationModel.findById(id);
    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    next(err);
  }
};

// @PATCH /api/v1/reservations/:id/return
const returnBook = async (req, res, next) => {
  try {
    const reservation = await ReservationModel.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false, message: 'Reservation not found.',
      });
    }
    if (reservation.status === 'returned') {
      return res.status(409).json({
        success: false, message: 'Book already returned.',
      });
    }

    const returned_date = new Date().toISOString().split('T')[0];
    await ReservationModel.returnBook(req.params.id, returned_date);
    await ReservationModel.setCopyAvailability(reservation.copy_id, true);
    await BookModel.updateCopies(reservation.book_id, 1);

    res.status(200).json({
      success: true,
      message: 'Book returned successfully.',
      returned_date,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllReservations, getReservationById,
  createReservation, returnBook
};