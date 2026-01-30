/**
 * Database Connection Test Script
 * Run this to diagnose database connection issues
 * Usage: node scripts/testDbConnection.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env') });

console.log('🔍 Database Connection Diagnostic Tool\n');
console.log('=' .repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log(`   DB_HOST: ${process.env.DB_HOST || '❌ NOT SET'}`);
console.log(`   DB_USER: ${process.env.DB_USER || '❌ NOT SET'}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : '❌ NOT SET'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME || '❌ NOT SET'}`);
console.log(`   DB_CONNECTION_LIMIT: ${process.env.DB_CONNECTION_LIMIT || '5 (default)'}`);

// Check for missing variables
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('\n❌ Missing required environment variables:', missingVars.join(', '));
  console.log('💡 Please set these in your hosting panel or .env file');
  process.exit(1);
}

// Test connection
console.log('\n🔌 Testing Database Connection...');
console.log('-'.repeat(50));

const testConnection = async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000,
  };

  console.log(`\nAttempting to connect to:`);
  console.log(`   Host: ${config.host}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('\n✅ SUCCESS: Connected to MySQL database!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Query test successful:', rows[0]);
    
    // Check if users table exists
    try {
      const [tables] = await connection.execute(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'",
        [config.database]
      );
      
      if (tables[0].count > 0) {
        console.log('✅ Users table exists');
        
        // Count users
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log(`   Total users: ${userCount[0].count}`);
      } else {
        console.log('⚠️  Users table does not exist. Run initDb.js to create tables.');
      }
    } catch (tableError) {
      console.log('⚠️  Could not check users table:', tableError.message);
    }
    
    await connection.end();
    console.log('\n✅ Connection closed successfully');
    process.exit(0);
    
  } catch (error) {
    console.log('\n❌ FAILED: Could not connect to database');
    console.log(`\nError Details:`);
    console.log(`   Code: ${error.code}`);
    console.log(`   Message: ${error.message}`);
    console.log(`   SQL State: ${error.sqlState || 'N/A'}`);
    
    // Provide specific guidance
    console.log('\n💡 Troubleshooting Tips:');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.message.includes('Access denied')) {
      console.log('   → Check your DB_USER and DB_PASSWORD');
      console.log('   → Verify the user has permissions to access the database');
      console.log('   → Make sure password doesn\'t contain special characters that need escaping');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   → Check your DB_HOST');
      console.log('   → Try "localhost" instead of "127.0.0.1"');
      console.log('   → Verify MySQL server is running');
      console.log('   → Check if MySQL port (usually 3306) is accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   → DB_HOST hostname cannot be resolved');
      console.log('   → Check if DB_HOST is correct');
      console.log('   → Try "localhost" if using shared hosting');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('   → Database does not exist');
      console.log('   → Check your DB_NAME');
      console.log('   → Create the database in your hosting panel if it doesn\'t exist');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('   → Connection timeout');
      console.log('   → Check if MySQL server is accessible');
      console.log('   → Verify firewall/network settings');
    } else {
      console.log('   → Check server logs for more details');
      console.log('   → Verify all environment variables are set correctly');
    }
    
    process.exit(1);
  }
};

testConnection();

