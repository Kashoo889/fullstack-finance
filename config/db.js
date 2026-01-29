import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20, // Increased from 10 to handle more concurrent requests
  queueLimit: 0,
  // Connection timeout settings
  acquireTimeout: 60000, // 60 seconds to acquire connection
  timeout: 60000, // 60 seconds query timeout
  // Enable connection retry
  reconnect: true,
  // Connection pool options
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Enhanced connection test with retry logic
const checkConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Connected to MySQL Database');
      connection.release();
      return true;
    } catch (error) {
      console.error(`❌ MySQL Connection Failed (Attempt ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  return false;
};

// Monitor connection pool
pool.on('connection', (connection) => {
  console.log(`🔌 New MySQL connection established as id ${connection.threadId}`);
});

pool.on('error', (err) => {
  console.error('❌ MySQL Pool Error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Attempting to reconnect to MySQL...');
  }
});

// Test connection on startup
checkConnection();

// Wrapper function to execute queries with automatic retry
const executeWithRetry = async (query, params, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.execute(query, params);
      return result;
    } catch (error) {
      // If it's the last attempt or not a connection error, throw
      if (attempt === maxRetries || 
          (error.code !== 'ECONNRESET' && 
           error.code !== 'PROTOCOL_CONNECTION_LOST' &&
           !error.message.includes('Access denied'))) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⚠️ Query failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Export both pool and retry wrapper
export { executeWithRetry };
export default pool;
