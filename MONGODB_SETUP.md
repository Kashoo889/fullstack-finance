# MongoDB Atlas Connection Setup

## ✅ Backend is now connected to MongoDB Atlas

The backend has been configured to connect to MongoDB Atlas with production-ready error handling.

## Configuration Files

### 1. `.env` File (Create this file)

Create a `.env` file in the `backend` directory:

```env
MONGO_URI=mongodb+srv://studymentorhubblog_db_user:<db_password>@cluster0.xuurnxz.mongodb.net/?appName=Cluster0
PORT=5000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
DB_PASSWORD=your_actual_password_here
DB_NAME=kashif-hisab-kitab
```

### 2. Updated Files

- ✅ `backend/config/db.js` - Enhanced MongoDB connection with error handling
- ✅ `backend/server.js` - Async server startup with DB connection
- ✅ Environment variable validation
- ✅ Graceful shutdown handlers

## Features

### Production-Ready Connection
- ✅ Automatic password replacement from environment variable
- ✅ Connection timeout handling (5s)
- ✅ Socket timeout (45s)
- ✅ Graceful shutdown on SIGINT/SIGTERM
- ✅ Connection event listeners
- ✅ Detailed error logging

### Error Handling
- ✅ Validates required environment variables on startup
- ✅ Graceful exit if DB connection fails
- ✅ Detailed error messages in development
- ✅ Server error handling (port conflicts, etc.)

## Usage

1. **Create `.env` file** with your MongoDB Atlas password
2. **Replace `<db_password>`** or set `DB_PASSWORD` variable
3. **Start the server:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## Connection String Format

The connection string supports two formats:

**Format 1: Password in URI**
```env
MONGO_URI=mongodb+srv://studymentorhubblog_db_user:YourPassword@cluster0.xuurnxz.mongodb.net/kashif-hisab-kitab?appName=Cluster0
```

**Format 2: Password as separate variable (more secure)**
```env
MONGO_URI=mongodb+srv://studymentorhubblog_db_user:<db_password>@cluster0.xuurnxz.mongodb.net/?appName=Cluster0
DB_PASSWORD=YourPassword
```

## Database Name

The database name defaults to `kashif-hisab-kitab`. You can override it with:

```env
DB_NAME=your_custom_database_name
```

## Testing Connection

Once the server starts, you should see:

```
✅ MongoDB Atlas Connected: cluster0-shard-00-00.xuurnxz.mongodb.net
📊 Database: kashif-hisab-kitab
🚀 Server running in development mode
📡 Server listening on port 5000
🌐 API available at http://localhost:5000/api
```

## Health Check

Test the connection:
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "database": "connected",
  "timestamp": "2024-12-26T..."
}
```

## Troubleshooting

### Connection Failed
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for development)
- Verify username and password
- Check network connectivity

### Port Already in Use
- Change PORT in `.env` file
- Or stop the process using port 5000

### Environment Variables Not Loading
- Ensure `.env` file is in `backend/` directory
- Restart the server after creating/modifying `.env`

