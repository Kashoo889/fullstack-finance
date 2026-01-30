# 🔧 Troubleshooting Guide - Database Connection Error

## Current Issue: "Database connection error. Please try again in a moment."

If you're still seeing this error after applying the fixes, follow these steps:

---

## Step 1: Check Server Logs

**On Hostinger, check your application logs for:**

1. **Database Configuration Logs** (should appear on startup):
   ```
   📊 Database Configuration:
      Host: localhost
      User: u410869863_abid
      Database: u410869863_Abiddatabse
      Connection Limit: 5
   ```

2. **Connection Error Logs**:
   ```
   ❌ MySQL Connection Failed (Attempt 1/3):
      Error Code: ER_ACCESS_DENIED_ERROR
      Error Message: Access denied for user...
   ```

**What to look for:**
- ❌ If you see "NOT SET" for any variable → Environment variables are missing
- ❌ If you see "Access denied" → Wrong username/password
- ❌ If you see "ECONNREFUSED" → Wrong hostname
- ❌ If you see "ER_BAD_DB_ERROR" → Database doesn't exist

---

## Step 2: Test Database Connection

### Option A: Use the Diagnostic Script (Recommended)

1. **SSH into your Hostinger server** (if you have SSH access)
2. **Navigate to your project directory**
3. **Run the diagnostic script**:
   ```bash
   node scripts/testDbConnection.js
   ```

This will show you:
- ✅ Which environment variables are set
- ✅ Exact error message from MySQL
- ✅ Specific troubleshooting tips based on the error

### Option B: Check Health Endpoint

Visit: `https://kbtech.live/api/health`

This will show:
- Database connection status
- Environment variable values (without passwords)
- Any connection errors

**Expected Response (Success)**:
```json
{
  "success": true,
  "message": "Server is running",
  "dbStatus": "Connected",
  "dbConfig": {
    "host": "localhost",
    "user": "u410869863_abid",
    "database": "u410869863_Abiddatabse",
    "connectionLimit": "5"
  }
}
```

**If you see `dbStatus: "Disconnected"`**, check the `dbError` field for details.

---

## Step 3: Verify Environment Variables in Hostinger Panel

### How to Set Environment Variables in Hostinger:

1. **Log into Hostinger Control Panel** (hPanel)
2. **Go to**: Websites → Your Domain → Advanced → Environment Variables
3. **Add these variables** (one by one):

```env
DB_HOST=localhost
DB_USER=u410869863_abid
DB_PASSWORD=Abid@123uncle
DB_NAME=u410869863_Abiddatabse
DB_CONNECTION_LIMIT=5
JWT_SECRET=<generate-a-strong-32-character-secret>
NODE_ENV=production
PORT=3000
```

**⚠️ IMPORTANT:**
- Replace `<generate-a-strong-32-character-secret>` with a real secret (use a password generator)
- Make sure there are **NO spaces** around the `=` sign
- Make sure there are **NO quotes** around values (unless the value itself contains spaces)
- **Restart your application** after setting environment variables

---

## Step 4: Verify MySQL Hostname

**The hostname might NOT be `localhost`!**

### How to Find Your MySQL Hostname:

1. **In Hostinger Panel**:
   - Go to: **Databases** → **MySQL Databases**
   - Look for: **MySQL Host** or **Server**
   - Common values:
     - `localhost`
     - `127.0.0.1`
     - `mysql.hostinger.com`
     - A specific IP address

2. **Update `DB_HOST`** in environment variables with the exact value shown

3. **Restart your application**

---

## Step 5: Verify Database Credentials

### Check in Hostinger Panel:

1. **Go to**: Databases → MySQL Databases
2. **Verify**:
   - ✅ Database name matches `DB_NAME`
   - ✅ Username matches `DB_USER`
   - ✅ Password matches `DB_PASSWORD`

**⚠️ Common Issues:**
- Password contains special characters that need escaping
- Username has extra spaces
- Database name is case-sensitive

---

## Step 6: Check Database Exists

1. **In Hostinger Panel**:
   - Go to: **Databases** → **MySQL Databases**
   - Verify the database `u410869863_Abiddatabse` exists
   - If it doesn't exist, create it

2. **If database doesn't exist**:
   - Create it in Hostinger panel
   - Run `node scripts/initDb.js` to create tables

---

## Step 7: Test with Direct MySQL Connection

If you have **phpMyAdmin** or **MySQL Workbench** access:

1. **Try connecting** with the same credentials:
   - Host: `localhost` (or the hostname from Hostinger)
   - User: `u410869863_abid`
   - Password: `Abid@123uncle`
   - Database: `u410869863_Abiddatabse`

2. **If this fails**, the credentials are wrong → Update them in Hostinger panel

3. **If this works**, the issue is with how Node.js is reading environment variables

---

## Step 8: Check Application Restart

**After changing environment variables, you MUST restart your application:**

1. **In Hostinger Panel**:
   - Go to: **Websites** → Your Domain → **Node.js App**
   - Click: **Restart** or **Redeploy**

2. **Wait 1-2 minutes** for the application to restart

3. **Check logs** to see if it connected successfully

---

## Common Error Messages and Solutions

### Error: "Access denied for user 'u410869863_abid'@'localhost'"

**Cause**: Wrong username or password

**Solution**:
1. Verify username and password in Hostinger MySQL panel
2. Update `DB_USER` and `DB_PASSWORD` in environment variables
3. Make sure password doesn't have extra spaces
4. Restart application

---

### Error: "ECONNREFUSED" or "getaddrinfo ENOTFOUND"

**Cause**: Wrong database hostname

**Solution**:
1. Check MySQL hostname in Hostinger panel
2. Update `DB_HOST` in environment variables
3. Try `localhost` if not sure
4. Restart application

---

### Error: "ER_BAD_DB_ERROR" or "Unknown database"

**Cause**: Database doesn't exist or wrong name

**Solution**:
1. Verify database name in Hostinger panel
2. Update `DB_NAME` in environment variables
3. Create database if it doesn't exist
4. Run `node scripts/initDb.js` to create tables

---

### Error: Environment variables show "NOT SET"

**Cause**: Environment variables not configured in Hostinger

**Solution**:
1. Go to Hostinger panel → Environment Variables
2. Add all required variables (see Step 3)
3. Restart application
4. Check logs to verify they're loaded

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Environment variables are set in Hostinger panel
- [ ] `DB_HOST` matches MySQL hostname from Hostinger
- [ ] `DB_USER` matches MySQL username from Hostinger
- [ ] `DB_PASSWORD` matches MySQL password from Hostinger
- [ ] `DB_NAME` matches database name from Hostinger
- [ ] Application was restarted after setting environment variables
- [ ] Database exists in Hostinger panel
- [ ] Can connect to database using phpMyAdmin/MySQL Workbench
- [ ] Checked server logs for specific error messages
- [ ] Tested `/api/health` endpoint

---

## Still Having Issues?

### Get More Information:

1. **Check server logs** for the exact error message
2. **Run diagnostic script**: `node scripts/testDbConnection.js`
3. **Check health endpoint**: `https://kbtech.live/api/health`
4. **Share the error details** from logs or health endpoint

### Most Likely Causes (in order):

1. 🔴 **Environment variables not set** in Hostinger panel
2. 🔴 **Wrong MySQL hostname** (not `localhost`)
3. 🔴 **Wrong database credentials** (username/password)
4. 🟡 **Database doesn't exist**
5. 🟡 **Application not restarted** after changing environment variables

---

## Next Steps

1. ✅ Run `node scripts/testDbConnection.js` to get exact error
2. ✅ Check `/api/health` endpoint for configuration status
3. ✅ Verify all environment variables in Hostinger panel
4. ✅ Restart application
5. ✅ Test login again

---

**Last Updated**: Based on current error analysis

