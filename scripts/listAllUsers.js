import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * List all users in the database
 * Shows which users can log in
 */
const listAllUsers = async () => {
  try {
    console.log('🔍 Fetching all users from database...\n');

    const query = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC';
    const [rows] = await db.execute(query);

    if (rows.length === 0) {
      console.log('⚠️  No users found in the database.');
      process.exit(0);
    }

    console.log(`✅ Found ${rows.length} user(s) in database:\n`);
    console.log('═'.repeat(80));
    console.log('ID  | Name          | Email                          | Role   | Created At');
    console.log('═'.repeat(80));

    rows.forEach((user, index) => {
      const id = String(user.id).padEnd(3);
      const name = (user.name || 'N/A').padEnd(13);
      const email = (user.email || 'N/A').padEnd(30);
      const role = (user.role || 'user').padEnd(6);
      const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
      
      console.log(`${id} | ${name} | ${email} | ${role} | ${createdAt}`);
    });

    console.log('═'.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   - Total Users: ${rows.length}`);
    console.log(`   - Admin Users: ${rows.filter(u => u.role === 'admin').length}`);
    console.log(`   - Regular Users: ${rows.filter(u => u.role === 'user' || !u.role).length}`);
    console.log(`\n✅ All users listed above can log in to the system.\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    process.exit(1);
  }
};

// Run the function
listAllUsers();

