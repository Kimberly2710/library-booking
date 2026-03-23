const db = require('../config/db');

const ReservationModel = {
  // Get all reservations
  getAll: async (filters) => {
    let query = `
      SELECT r.*, u.name as member_name, b.title as book_title
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
    `;
    const params = [];
    const conditions = [];

    if (filters.member_id) {
      conditions.push('r.user_id = ?');
      params.push(filters.member_id);
    }
    if (filters.status) {
      conditions.push('r.status = ?');
      params.push(filters.status);
    }
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await db.query(query, params);
    return rows;
  },

  // Find by ID
  findById: async (id) => {
    const [rows] = await db.query(
      'SELECT * FROM reservations WHERE id = ?', [id]
    );
    return rows[0];
  },

  // Create reservation
  create: async (data) => {
    const { user_id, book_id, copy_id, borrowed_date, due_date } = data;
    const [result] = await db.query(
      'INSERT INTO reservations (user_id, book_id, copy_id, borrowed_date, due_date) VALUES (?, ?, ?, ?, ?)',
      [user_id, book_id, copy_id, borrowed_date, due_date]
    );
    return result.insertId;
  },

  // Return a book
  returnBook: async (id, returned_date) => {
    const [result] = await db.query(
      'UPDATE reservations SET status = "returned", returned_date = ? WHERE id = ?',
      [returned_date, id]
    );
    return result.affectedRows;
  },

  // Mark overdue reservations
  markOverdue: async () => {
    await db.query(
      'UPDATE reservations SET status = "overdue" WHERE due_date < CURDATE() AND status = "active"'
    );
  },

  // Check if member has overdue books
  hasOverdue: async (user_id) => {
    const [rows] = await db.query(
      'SELECT id FROM reservations WHERE user_id = ? AND status = "overdue"',
      [user_id]
    );
    return rows.length > 0;
  },

  // Get available copy for a book
  getAvailableCopy: async (book_id) => {
    const [rows] = await db.query(
      'SELECT id FROM book_copies WHERE book_id = ? AND is_available = TRUE LIMIT 1',
      [book_id]
    );
    return rows[0];
  },

  // Update copy availability
  setCopyAvailability: async (copy_id, is_available) => {
    await db.query(
      'UPDATE book_copies SET is_available = ? WHERE id = ?',
      [is_available, copy_id]
    );
  },
};

module.exports = ReservationModel;