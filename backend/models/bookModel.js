const db = require('../config/db');

const BookModel = {
  // Get all books
  getAll: async (filters) => {
    let query = 'SELECT * FROM books';
    const params = [];
    const conditions = [];

    if (filters.genre) {
      conditions.push('genre = ?');
      params.push(filters.genre);
    }
    if (filters.available === 'true') {
      conditions.push('available_copies > 0');
    }
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' LIMIT ? OFFSET ?';
const page = parseInt(filters.page) || 1;
const limit = 100;
const offset = (page - 1) * limit;
params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
  },

  // Get single book
  findById: async (id) => {
    const [rows] = await db.query(
      'SELECT * FROM books WHERE id = ?', [id]
    );
    return rows[0];
  },

  // Find by ISBN
  findByIsbn: async (isbn) => {
    const [rows] = await db.query(
      'SELECT * FROM books WHERE isbn = ?', [isbn]
    );
    return rows[0];
  },

  // Create book
  create: async (data) => {
    const { title, author, isbn, genre, total_copies } = data;
    const [result] = await db.query(
      'INSERT INTO books (title, author, isbn, genre, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, isbn, genre, total_copies, total_copies]
    );
    return result.insertId;
  },

  // Update book
  update: async (id, data) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const [result] = await db.query(
      `UPDATE books SET ${fields} WHERE id = ?`, values
    );
    return result.affectedRows;
  },

  // Delete book
  delete: async (id) => {
    const [result] = await db.query(
      'DELETE FROM books WHERE id = ?', [id]
    );
    return result.affectedRows;
  },

  // Update available copies
  updateCopies: async (id, change) => {
    await db.query(
      'UPDATE books SET available_copies = available_copies + ? WHERE id = ?',
      [change, id]
    );
  },
};

module.exports = BookModel;