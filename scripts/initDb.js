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

    const createTradersTable = `
      CREATE TABLE IF NOT EXISTS traders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        short_name VARCHAR(10) NOT NULL,
        color VARCHAR(50) DEFAULT 'from-blue-500 to-blue-600',
        total_balance DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createBanksTable = `
      CREATE TABLE IF NOT EXISTS banks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trader_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) NOT NULL,
        total_balance DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trader_id) REFERENCES traders(id) ON DELETE CASCADE
      );
    `;

    const createBankLedgerTable = `
      CREATE TABLE IF NOT EXISTS bank_ledger_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bank_id INT NOT NULL,
        date VARCHAR(20) NOT NULL,
        reference_type ENUM('Online', 'Cash') NOT NULL,
        amount_added DECIMAL(15, 2) DEFAULT 0,
        amount_withdrawn DECIMAL(15, 2) DEFAULT 0,
        reference_person VARCHAR(100) DEFAULT '',
        remaining_amount DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE
      );
    `;

    const createSaudiTable = `
      CREATE TABLE IF NOT EXISTS saudi_hisaab_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date VARCHAR(20) NOT NULL,
        time VARCHAR(20) NOT NULL,
        ref_no VARCHAR(50) NOT NULL,
        pkr_amount DECIMAL(15, 2) NOT NULL,
        riyal_rate DECIMAL(10, 4) NOT NULL,
        riyal_amount DECIMAL(15, 2) DEFAULT 0,
        submitted_sar DECIMAL(15, 2) DEFAULT 0,
        reference2 VARCHAR(100) DEFAULT '',
        balance DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createSpecialTable = `
      CREATE TABLE IF NOT EXISTS special_hisaab_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL,
        date VARCHAR(20) NOT NULL,
        balance_type ENUM('Online', 'Cash') NOT NULL,
        name_rupees DECIMAL(15, 2) NOT NULL,
        submitted_rupees DECIMAL(15, 2) DEFAULT 0,
        reference_person VARCHAR(100) DEFAULT '',
        balance DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db.execute(createUsersTable);
    await db.execute(createTradersTable);
    await db.execute(createBanksTable);
    await db.execute(createBankLedgerTable);
    await db.execute(createSaudiTable);
    await db.execute(createSpecialTable);
    console.log('✅ All database tables created or verified');

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
