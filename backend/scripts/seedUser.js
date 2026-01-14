import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

/**
 * Seed user in database
 */
const seedUser = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // User data
    const userData = {
      name: 'Kashif Shah',
      email: 'mkashifshah10@gmail.com',
      password: 'Kashif@123',
      role: 'user',
      isActive: true,
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      console.log('⚠️  User already exists');
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create user
    const user = await User.create(userData);

    console.log('✅ User created successfully!');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Name:', user.name);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding user:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedUser();

