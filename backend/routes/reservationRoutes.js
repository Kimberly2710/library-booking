const express = require('express');
const router = express.Router();
const {
  getAllReservations,
  getReservationById,
  createReservation,
  returnBook,
} = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getAllReservations);
router.get('/:id', protect, getReservationById);
router.post('/', protect, createReservation);
router.patch('/:id/return', protect, returnBook);

module.exports = router;