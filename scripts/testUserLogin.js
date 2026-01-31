/**
 * Test User Login Script
 * Tests login for all seeded users to diagnose login issues
 */

import bcrypt from 'bcryptjs';
import db, { executeWithRetry } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const testUserLogin = async () => {
  try {
    console.log('🔍 Testing User Login Functionality\n');
    console.log('='.repeat(80));

    // Get all users from database
    const [users] = await executeWithRetry('SELECT * FROM users ORDER BY id');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      process.exit(1);
    }

    console.log(`\n📊 Found ${users.length} user(s) in database:\n`);

    // Test credentials for seeded users
    const testCredentials = [
      { email: 'mkashifbukhari10@gmail.com', password: 'Abid@uncle' },
      { email: 'syedzadas889@gmail.com', password: 'abidadmin' },
      { email: 'abid707071@gmail.com', password: 'abidadmin' },
    ];

    console.log('🧪 Testing Login for Each User:\n');
    console.log('─'.repeat(80));

    for (const user of users) {
      console.log(`\n👤 User: ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'MISSING'}`);
      
      // Find matching test credentials
      const testCred = testCredentials.find(cred => 
        cred.email.toLowerCase() === user.email.toLowerCase()
      );

      if (testCred) {
        console.log(`   Test Password: ${testCred.password}`);
        
        // Test password verification
        if (user.password) {
          try {
            const isMatch = await bcrypt.compare(testCred.password, user.password);
            console.log(`   ✅ Password Match: ${isMatch ? 'YES' : 'NO'}`);
            
            if (!isMatch) {
              console.log(`   ⚠️  PASSWORD MISMATCH - User cannot login with this password!`);
              console.log(`   💡 Possible causes:`);
              console.log(`      - Password was changed manually in database`);
              console.log(`      - Password was hashed with different salt`);
              console.log(`      - Wrong password in test credentials`);
            }
          } catch (error) {
            console.log(`   ❌ Error verifying password: ${error.message}`);
          }
        } else {
          console.log(`   ❌ NO PASSWORD HASH - User cannot login!`);
        }
      } else {
        console.log(`   ℹ️  No test credentials found for this user`);
        console.log(`   💡 This user was likely created via registration`);
      }

      // Check for common issues
      const issues = [];
      if (!user.email) issues.push('Missing email');
      if (!user.password) issues.push('Missing password');
      if (!user.name) issues.push('Missing name');
      if (user.email && !user.email.includes('@')) issues.push('Invalid email format');

      if (issues.length > 0) {
        console.log(`   ⚠️  Issues found: ${issues.join(', ')}`);
      }
    }

    console.log('\n' + '─'.repeat(80));
    console.log('\n📋 Login Test Summary:\n');

    // Test each credential
    for (const cred of testCredentials) {
      const user = users.find(u => u.email.toLowerCase() === cred.email.toLowerCase());
      
      if (!user) {
        console.log(`❌ ${cred.email}: USER NOT FOUND IN DATABASE`);
        continue;
      }

      if (!user.password) {
        console.log(`❌ ${cred.email}: NO PASSWORD HASH IN DATABASE`);
        continue;
      }

      try {
        const isMatch = await bcrypt.compare(cred.password, user.password);
        if (isMatch) {
          console.log(`✅ ${cred.email}: CAN LOGIN (password matches)`);
        } else {
          console.log(`❌ ${cred.email}: CANNOT LOGIN (password does not match)`);
          console.log(`   💡 Password in database doesn't match expected password`);
          console.log(`   💡 Expected: "${cred.password}"`);
          console.log(`   💡 Solution: Reset password or re-seed user`);
        }
      } catch (error) {
        console.log(`❌ ${cred.email}: ERROR - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 Recommendations:\n');
    
    const usersWithIssues = users.filter(u => {
      const cred = testCredentials.find(c => c.email.toLowerCase() === u.email.toLowerCase());
      if (!cred) return false;
      if (!u.password) return true;
      // We can't test password here, but we'll note it
      return false;
    });

    if (usersWithIssues.length > 0) {
      console.log('⚠️  Some users have issues. Consider:');
      console.log('   1. Re-running initDb.js to re-seed users');
      console.log('   2. Manually resetting passwords in database');
      console.log('   3. Using the change password feature for affected users');
    } else {
      console.log('✅ All users appear to be set up correctly');
      console.log('   If login still fails, check:');
      console.log('   - Network/database connection issues');
      console.log('   - Email case sensitivity');
      console.log('   - Frontend login form sending correct data');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error testing user login:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    process.exit(1);
  }
};

testUserLogin();

