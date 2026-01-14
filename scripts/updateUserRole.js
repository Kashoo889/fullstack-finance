import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

/**
 * Update user role to admin
 */
const updateUserRole = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const userEmail = 'mkashifshah10@gmail.com';

    // Find and update user
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log(`❌ User with email ${userEmail} not found`);
      await mongoose.connection.close();
      process.exit(1);
    }

    // Update role to admin
    user.role = 'admin';
    await user.save();

    console.log('✅ User role updated successfully!');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Name:', user.name);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the update function
updateUserRole();

