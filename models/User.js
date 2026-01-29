import db, { executeWithRetry } from '../config/db.js';

const User = {
  create: async ({ name, email, password, role = 'user' }) => {
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    try {
      const [result] = await executeWithRetry(query, [name, email, password, role]);
      return { id: result.insertId, name, email, role };
    } catch (error) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  },

  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    try {
      const [rows] = await executeWithRetry(query, [email]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error.message);
      throw error;
    }
  },

  findById: async (id) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    try {
      const [rows] = await executeWithRetry(query, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by id:', error.message);
      throw error;
    }
  },

  updatePassword: async (id, hashedPassword) => {
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    try {
      const [result] = await executeWithRetry(query, [hashedPassword, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating password:', error.message);
      throw error;
    }
  },
};

export default User;
