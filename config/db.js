import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('⚠️ Please set these in your hosting panel or .env file');
}

// Get database configuration with better defaults and validation
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Add socket path if provided (for shared hosting that uses Unix sockets)
  ...(process.env.DB_SOCKET_PATH && { socketPath: process.env.DB_SOCKET_PATH }),
};

// Log configuration (without sensitive data)
console.log('📊 Database Configuration:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   User: ${dbConfig.user || 'NOT SET'}`);
console.log(`   Database: ${dbConfig.database || 'NOT SET'}`);
console.log(`   Connection Limit: ${dbConfig.connectionLimit}`);

const pool = mysql.createPool(dbConfig);

// Enhanced connection test with retry logic and better error reporting
const checkConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Connected to MySQL Database');
      connection.release();
      return true;
    } catch (error) {
      console.error(`❌ MySQL Connection Failed (Attempt ${i + 1}/${retries}):`);
      console.error(`   Error Code: ${error.code}`);
      console.error(`   Error Message: ${error.message}`);
      console.error(`   Host: ${dbConfig.host}`);
      console.error(`   User: ${dbConfig.user}`);
      console.error(`   Database: ${dbConfig.database}`);
      
      // Provide specific guidance based on error
      if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.message.includes('Access denied')) {
        console.error('💡 TIP: Check your DB_USER and DB_PASSWORD in environment variables');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.error('💡 TIP: Check your DB_HOST. Try "localhost" or the MySQL hostname from your hosting panel');
      } else if (error.code === 'ER_BAD_DB_ERROR') {
        console.error('💡 TIP: Check your DB_NAME. The database might not exist or name is incorrect');
      }
      
      if (i < retries - 1) {
        const delay = 1000 * (i + 1);
        console.log(`   Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('❌ All connection attempts failed. Please check your database configuration.');
  return false;
};

// Monitor connection pool
pool.on('connection', (connection) => {
  console.log(`🔌 New MySQL connection established as id ${connection.threadId}`);
});

pool.on('error', (err) => {
  console.error('❌ MySQL Pool Error:', err.message);
  console.error('   Error Code:', err.code);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Attempting to reconnect to MySQL...');
  }
});

// Test connection on startup
checkConnection();

// Wrapper function to execute queries with automatic retry and better error handling
const executeWithRetry = async (query, params, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.execute(query, params);
      return result;
    } catch (error) {
      // Log error details
      console.error(`⚠️ Query failed (attempt ${attempt}/${maxRetries}):`, {
        code: error.code,
        message: error.message,
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      });
      
      // If it's the last attempt or not a connection error, throw
      if (attempt === maxRetries || 
          (error.code !== 'ECONNRESET' && 
           error.code !== 'PROTOCOL_CONNECTION_LOST' &&
           error.code !== 'ER_ACCESS_DENIED_ERROR' &&
           !error.message.includes('Access denied') &&
           error.code !== 'ECONNREFUSED')) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`   Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Export both pool and retry wrapper
export { executeWithRetry };
export default pool;
