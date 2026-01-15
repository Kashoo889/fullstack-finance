import db from '../config/db.js';

const User = {
  create: async ({ name, email, password, role = 'user' }) => {
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [name, email, password, role]);
    return { id: result.insertId, name, email, role };
  },

  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  },

  findById: async (id) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  updatePassword: async (id, hashedPassword) => {
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    const [result] = await db.execute(query, [hashedPassword, id]);
    return result.affectedRows > 0;
  },
};

export default User;
