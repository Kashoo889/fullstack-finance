import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas
 * Production-ready with proper error handling and graceful exit
 */
const connectDB = async () => {
  try {
    // Check if MONGO_URI is provided
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Replace <db_password> placeholder if present
    let mongoUri = process.env.MONGO_URI.replace('<db_password>', process.env.DB_PASSWORD || '');
    
    // Add database name if not present in URI
    const dbName = process.env.DB_NAME || 'kashif-hisab-kitab';
    // Check if database name is already in URI (format: ...mongodb.net/dbname?...)
    const hasDbName = mongoUri.match(/mongodb\.net\/[^/?]+/);
    if (!hasDbName) {
      // Insert database name before query parameters or at end
      mongoUri = mongoUri.replace(/(mongodb\.net\/)(\?|$)/, `$1${dbName}$2`);
    }

    // Connection options for MongoDB Atlas
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(mongoUri, options);

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }

    // Graceful exit with error code
    console.error('Exiting application due to database connection failure...');
    process.exit(1);
  }
};

export default connectDB;

