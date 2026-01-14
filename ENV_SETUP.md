# Environment Variables Setup

## Create .env File

Create a `.env` file in the `backend` directory with the following content:

```env
MONGO_URI=mongodb+srv://studymentorhubblog_db_user:<db_password>@cluster0.xuurnxz.mongodb.net/?appName=Cluster0
PORT=5000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
DB_PASSWORD=your_actual_password_here
```

## Instructions

1. **Replace `<db_password>`** in MONGO_URI with your actual MongoDB Atlas password, OR
2. **Set `DB_PASSWORD`** environment variable with your password (the code will automatically replace `<db_password>`)

## Example

If your MongoDB Atlas password is `MySecurePassword123`, you can either:

**Option 1: Replace in MONGO_URI directly**
```env
MONGO_URI=mongodb+srv://studymentorhubblog_db_user:MySecurePassword123@cluster0.xuurnxz.mongodb.net/?appName=Cluster0
```

**Option 2: Use DB_PASSWORD variable**
```env
MONGO_URI=mongodb+srv://studymentorhubblog_db_user:<db_password>@cluster0.xuurnxz.mongodb.net/?appName=Cluster0
DB_PASSWORD=MySecurePassword123
```

## Security Notes

- Never commit `.env` file to version control
- `.env` is already in `.gitignore`
- Use strong, unique passwords
- Rotate JWT_SECRET regularly in production
