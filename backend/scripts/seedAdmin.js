import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

/**
 * Seed admin user in database
 */
const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI.replace(
      '<db_password>',
      process.env.DB_PASSWORD || ''
    );
    
    const dbName = process.env.DB_NAME || 'kashif-hisab-kitab';
    let finalUri = mongoUri;
    if (!mongoUri.match(/mongodb\.net\/[^/?]+/)) {
      finalUri = mongoUri.replace(/(mongodb\.net\/)(\?|$)/, `$1${dbName}$2`);
    }

    await mongoose.connect(finalUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'kashifadmin@gmail.com' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin',
      email: 'kashifadmin@gmail.com',
      password: 'Kashif@123',
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Name:', adminUser.name);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();

