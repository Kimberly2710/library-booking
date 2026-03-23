const db = require('../config/db');

const UserModel = {
  // Find user by email
  findByEmail: async (email) => {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    return rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, membership_type, status, created_at FROM users WHERE id = ?', [id]
    );
    return rows[0];
  },

  // Create new user
  create: async (data) => {
    const { name, email, password_hash, phone, role, membership_type } = data;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, phone, role, membership_type) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password_hash, phone, role || 'member', membership_type || 'standard']
    );
    return result.insertId;
  },

  // Get all members
  getAll: async (status) => {
    let query = 'SELECT id, name, email, phone, role, membership_type, status, created_at FROM users WHERE role = "member"';
    const params = [];
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    const [rows] = await db.query(query, params);
    return rows;
  },

  // Update user status
  updateStatus: async (id, status) => {
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE id = ?', [status, id]
    );
    return result.affectedRows;
  },
};

module.exports = UserModel;