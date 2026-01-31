# 🔒 Critical Security Fixes - Action Plan

## ⚠️ IMMEDIATE ACTIONS REQUIRED

### 1. Remove Credentials from setupEnv.js

**File:** `scripts/setupEnv.js`

**Current (INSECURE):**
```javascript
const envContent = `MONGO_URI=mongodb+srv://heapp8720_db_user:szTxtpaMokHvUdJg@clusterabid.jmfs8k2.mongodb.net/...
DB_HOST=127.0.0.1
DB_USER=u410869863_abid
DB_PASSWORD=Abid@123uncle
DB_NAME=u410869863_Abiddatabse
`;
```

**Fixed Version:**
```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Template .env file - user must fill in actual values
const envTemplate = `# Database Configuration
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT Configuration
JWT_SECRET=your_strong_jwt_secret_here_min_32_chars

# Server Configuration
NODE_ENV=production
PORT=3000
`;

console.log('📝 Creating .env template file in:', rootDir);

try {
    const envPath = path.join(rootDir, '.env');
    
    // Only create if .env doesn't exist
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, envTemplate);
        console.log('✅ .env template file created!');
        console.log('⚠️  Please update .env with your actual credentials');
    } else {
        console.log('ℹ️  .env file already exists, skipping creation');
    }
} catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
}
```

### 2. Fix JWT Secret Handling

**File:** `middleware/authMiddleware.js`

**Current:**
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
```

**Fixed:**
```javascript
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('❌ JWT_SECRET is not set in environment variables');
  throw new Error('Server configuration error');
}

const decoded = jwt.verify(token, jwtSecret);
```

**File:** `routes/authRoutes.js`

**Current:**
```javascript
return jwt.sign({ userId }, process.env.JWT_SECRET || 'default_secret', {
  expiresIn: '30d',
});
```

**Fixed:**
```javascript
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not configured');
}

return jwt.sign({ userId }, jwtSecret, {
  expiresIn: '30d',
});
```

### 3. Add Authentication to Protected Routes

**Files to Update:**
- `routes/traderRoutes.js`
- `routes/saudiRoutes.js`
- `routes/specialRoutes.js`
- `routes/bankRoutes.js`
- `routes/bankLedgerRoutes.js`

**Example Fix for `routes/traderRoutes.js`:**

**Current:**
```javascript
router.route('/').get(getTraders).post(validateTrader, createTrader);
router.route('/:id').get(getTrader).put(validateTrader, updateTrader).delete(deleteTrader);
```

**Fixed:**
```javascript
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getTraders).post(protect, validateTrader, createTrader);
router.route('/:id').get(protect, getTrader).put(protect, validateTrader, updateTrader).delete(protect, deleteTrader);
```

### 4. Add Rate Limiting

**Install:**
```bash
npm install express-rate-limit
```

**Create:** `middleware/rateLimiter.js`
```javascript
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Update:** `routes/authRoutes.js`
```javascript
import { authLimiter } from '../middleware/rateLimiter.js';

router.post('/login', authLimiter, validateLogin, ...);
router.post('/register', authLimiter, validateRegister, ...);
```

### 5. Add Security Headers

**Install:**
```bash
npm install helmet
```

**Update:** `index.js`
```javascript
import helmet from 'helmet';

// Add after app initialization
app.use(helmet());
```

### 6. Add CORS Configuration

**Install:**
```bash
npm install cors
```

**Update:** `index.js`
```javascript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
```

### 7. Remove Passwords from Seed Script

**File:** `scripts/initDb.js`

**Current:**
```javascript
const usersToSeed = [
  { name: 'Admin', email: 'mkashifbukhari10@gmail.com', password: 'Abid@uncle', role: 'admin' },
  // ...
];
```

**Fixed:**
```javascript
// Get admin credentials from environment variables
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  console.warn('⚠️  ADMIN_PASSWORD not set, skipping admin user creation');
  return;
}

const usersToSeed = [
  { 
    name: 'Admin', 
    email: adminEmail, 
    password: adminPassword, 
    role: 'admin' 
  },
  // Add other users from env vars or remove hardcoded passwords
];
```

### 8. Create .env.example File

**Create:** `.env.example`
```env
# Database Configuration
DB_HOST=127.0.0.1
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name

# JWT Configuration
JWT_SECRET=your_strong_jwt_secret_minimum_32_characters_long

# Server Configuration
NODE_ENV=production
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# Admin User (for seeding)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
```

---

## 🔄 Steps to Apply Fixes

1. **Backup your current database** (in case credentials need to be changed)
2. **Change all database passwords** immediately
3. **Update `.env` file** with new credentials
4. **Apply code fixes** listed above
5. **Test authentication** after changes
6. **Remove old credentials** from git history (if committed):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch scripts/setupEnv.js" \
     --prune-empty --tag-name-filter cat -- --all
   ```
7. **Force push** (if working alone) or coordinate with team

---

## ✅ Verification Checklist

After applying fixes, verify:

- [ ] No credentials in source code
- [ ] `.env` file exists and is in `.gitignore`
- [ ] `.env.example` exists with template values
- [ ] JWT_SECRET is set and strong (32+ characters)
- [ ] All routes require authentication (except `/api/auth/*`)
- [ ] Rate limiting is active on auth routes
- [ ] Security headers are enabled
- [ ] CORS is configured
- [ ] Database passwords are changed
- [ ] Application starts without errors
- [ ] Login/logout works correctly
- [ ] Protected routes require authentication

---

## 🚨 If Credentials Were Committed to Git

If credentials were already committed:

1. **Change passwords immediately** (before fixing code)
2. **Remove from git history** (see step 6 above)
3. **Rotate all secrets** (database passwords, JWT secret)
4. **Notify team members** to pull latest changes
5. **Consider using git-secrets** to prevent future commits

---

*Last Updated: 2024*





