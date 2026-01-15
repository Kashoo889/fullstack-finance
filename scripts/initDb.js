import bcrypt from 'bcryptjs';
import db from '../config/db.js';

const initDb = async () => {
  try {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db.execute(createUsersTable);
    console.log('✅ Users table created or verified');

    // Seed Admin User
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', ['mkashifbukhari10@gmail.com']);

    if (rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Abid@uncle', salt);

      await db.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin', 'mkashifbukhari10@gmail.com', hashedPassword, 'admin']
      );
      console.log('✅ Admin user seeded successfully');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    // Don't exit process, just log error so server can try to start
  }
};

export default initDb;
