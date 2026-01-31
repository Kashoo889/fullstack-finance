import db, { executeWithRetry } from '../config/db.js';

// Helper function to find user by email (used internally)
const findByEmailInternal = async (email) => {
  // Use LOWER() for case-insensitive email comparison
  const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)';
  try {
    const [rows] = await executeWithRetry(query, [email]);
    return rows[0];
  } catch (error) {
    console.error('Error finding user by email:', error.message);
    throw error;
  }
};

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
    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = email.toLowerCase().trim();
    return findByEmailInternal(normalizedEmail);
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

  updateEmail: async (id, newEmail) => {
    // First check if email already exists
    const existingUser = await findByEmailInternal(newEmail);
    if (existingUser && existingUser.id !== id) {
      throw new Error('Email already in use');
    }

    const query = 'UPDATE users SET email = ? WHERE id = ?';
    try {
      const [result] = await executeWithRetry(query, [newEmail, id]);
      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }
      return true;
    } catch (error) {
      console.error('Error updating email:', error.message);
      throw error;
    }
  },

  updateName: async (id, newName) => {
    const query = 'UPDATE users SET name = ? WHERE id = ?';
    try {
      const [result] = await executeWithRetry(query, [newName, id]);
      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }
      return true;
    } catch (error) {
      console.error('Error updating name:', error.message);
      throw error;
    }
  },
};

export default User;
