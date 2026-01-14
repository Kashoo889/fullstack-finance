# ⚡ Quick Deployment Checklist

## 🎯 Before You Start

- [ ] Push your code to GitHub
- [ ] Have MongoDB Atlas connection string ready
- [ ] Generate a secure JWT_SECRET (32+ characters)

---

## 📦 Step 1: Deploy Backend (Render) - 10 minutes

1. **Go to**: [render.com](https://render.com) → Sign up with GitHub

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect GitHub repo
   - Select your repository

3. **Settings**:
   ```
   Name: kashif-hisab-kitab-backend
   Environment: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   ```

4. **Environment Variables** (in Render dashboard):
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=10000
   JWT_SECRET=your_secure_secret_here
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Deploy** → Copy backend URL (e.g., `https://xxx.onrender.com`)

---

## 🎨 Step 2: Deploy Frontend (Vercel) - 5 minutes

1. **Go to**: [vercel.com](https://vercel.com) → Sign up with GitHub

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repo

3. **Settings**:
   ```
   Framework Preset: Vite (or "Other")
   Root Directory: frontend
   Build Command: node node_modules/vite/bin/vite.js build
   Output Directory: dist
   Install Command: npm install --legacy-peer-deps
   ```
   
   **OR** use the npm script:
   ```
   Build Command: npm run vercel-build
   ```

4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   (Replace with your actual Render backend URL)

5. **Deploy** → Your app is live!

---

## ✅ Step 3: Update MongoDB Atlas

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Save

---

## 🧪 Step 4: Test

1. Visit your Vercel URL
2. Login with admin credentials
3. Test all features

---

## 🔄 Auto-Deploy

Both platforms auto-deploy on every push to main branch!

---

## 🆘 Quick Fixes

**Backend not working?**
- Check Render logs
- Verify environment variables
- Check MongoDB connection

**Frontend can't connect?**
- Verify `VITE_API_URL` in Vercel
- Check browser console
- Ensure backend is running

**CORS errors?**
- Add your Vercel URL to `FRONTEND_URL` in Render
- Check CORS settings in `backend/server.js`

---

## 📞 Your URLs

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **Health Check**: `https://your-backend.onrender.com/api/health`

---

**That's it! Your app is live! 🎉**

