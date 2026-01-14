# Admin User Setup

## Admin Credentials

- **Email**: `kashifadmin@gmail.com`
- **Password**: `Kashif@123`
- **Role**: `admin`

## Setup Instructions

### Step 1: Install Dependencies

Make sure you have the required packages installed:

```bash
cd backend
npm install
```

This will install:
- `bcryptjs` - For password hashing
- `jsonwebtoken` - For JWT token generation

### Step 2: Create Admin User

Run the seed script to create the admin user in the database:

```bash
npm run seed:admin
```

### Expected Output

If successful, you should see:

```
✅ Connected to MongoDB
✅ Admin user created successfully!
Email: kashifadmin@gmail.com
Role: admin
Name: Admin
✅ Database connection closed
```

If the admin user already exists:

```
✅ Connected to MongoDB
⚠️  Admin user already exists
Email: kashifadmin@gmail.com
Role: admin
✅ Database connection closed
```

### Step 3: Verify Login

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Test login with the admin credentials:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"kashifadmin@gmail.com","password":"Kashif@123"}'
   ```

3. You should receive a JWT token in the response.

## Database Model

The User model includes:
- **name**: User's full name
- **email**: Unique email address (lowercase)
- **password**: Hashed password (not returned by default)
- **role**: 'admin' or 'user'
- **isActive**: Account status
- **timestamps**: createdAt, updatedAt

## Security Features

- ✅ Passwords are hashed with bcrypt (salt rounds: 10)
- ✅ Password field is excluded from queries by default
- ✅ JWT tokens expire in 30 days
- ✅ Email is normalized to lowercase
- ✅ Account status check (isActive)

## Authentication Flow

1. User submits email and password
2. System finds user by email
3. Password is verified using bcrypt
4. JWT token is generated
5. Token and user data are returned

## Troubleshooting

### Admin User Not Created
- Check MongoDB connection in `.env`
- Verify database name is correct
- Check for duplicate email errors

### Login Fails
- Verify password is correct: `Kashif@123`
- Check email is lowercase: `kashifadmin@gmail.com`
- Ensure user exists in database (run seed script again)

### JWT Secret Error
- Make sure `JWT_SECRET` is set in `.env` file
- Use a strong, random secret in production

