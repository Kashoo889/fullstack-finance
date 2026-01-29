import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';

dotenv.config();

const usersToAdd = [
    {
        name: 'Syed Zada',
        email: 'syedzadas889@gmail.com',
        password: 'abidadmin',
        role: 'admin' // Assuming admin privilege due to password
    },
    {
        name: 'Abid',
        email: 'abid707071@gmail.com',
        password: 'abidadmin',
        role: 'admin'
    }
];

const addNewUsers = async () => {
    try {
        console.log('🚀 Starting user addition...');

        for (const user of usersToAdd) {
            // Check if user exists
            const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [user.email]);

            if (rows.length === 0) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);

                await db.execute(
                    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    [user.name, user.email, hashedPassword, user.role]
                );
                console.log(`✅ Created user: ${user.email}`);
            } else {
                console.log(`ℹ️ User already exists: ${user.email}`);
                // Optional: Update password if needed, but safe to skip for now
            }
        }

        console.log('✨ All users processed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding users:', error);
        process.exit(1);
    }
};

addNewUsers();
