# Quick Start Guide - MongoDB Atlas Connection

## Step 1: Create .env File

Create a `.env` file in the `backend` directory:

```env
MONGO_URI=mongodb+srv://studymentorhubblog_db_user:<db_password>@cluster0.xuurnxz.mongodb.net/?appName=Cluster0
PORT=5000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
DB_PASSWORD=your_actual_mongodb_password
DB_NAME=kashif-hisab-kitab
```

**Important:** Replace `your_actual_mongodb_password` with your real MongoDB Atlas password.

## Step 2: Install Dependencies

```bash
cd backend
npm install
```

## Step 3: Start Server

```bash
npm run dev
```

## Expected Output

If everything is configured correctly, you should see:

```
✅ MongoDB Atlas Connected: cluster0-shard-00-00.xuurnxz.mongodb.net
📊 Database: kashif-hisab-kitab
🚀 Server running in development mode
📡 Server listening on port 5000
🌐 API available at http://localhost:5000/api
```

## Test Connection

Open your browser or use curl:

```bash
curl http://localhost:5000/api/health
```

You should get:
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
1. Check MongoDB Atlas Network Access - Add your IP or `0.0.0.0/0` for development
2. Verify username and password in `.env`
3. Ensure password doesn't contain special characters that need URL encoding

### Port Already in Use
Change `PORT=5000` to another port in `.env` file

### Environment Variables Error
- Ensure `.env` file is in `backend/` directory
- Check for typos in variable names
- Restart server after modifying `.env`

## Next Steps

Once connected, your backend is ready to:
- ✅ Store Saudi Hisaab Kitaab entries
- ✅ Store Special Hisaab Kitaab entries  
- ✅ Store Traders, Banks, and Ledger entries
- ✅ Calculate all balances server-side

All API endpoints are ready at `http://localhost:5000/api`

