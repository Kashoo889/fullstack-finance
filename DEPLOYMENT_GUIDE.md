# 🚀 Deployment Guide - Kashif Hisaab Kitaab

This guide will help you deploy your MERN stack application for **FREE** using:
- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Node.js/Express)
- **Database**: MongoDB Atlas (Already configured)

---

## 📋 Prerequisites

1. GitHub account (free)
2. MongoDB Atlas account (already set up)
3. Vercel account (free)
4. Render account (free)

---

## 🗂️ Step 1: Prepare Your Project for Deployment

### 1.1 Create a `.gitignore` file (if not exists)

Make sure your `.gitignore` includes:
```
node_modules/
.env
.env.local
.DS_Store
dist/
build/
*.log
```

### 1.2 Push your code to GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## 🎯 Step 2: Deploy Backend to Render

### 2.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (free)
3. Verify your email

### 2.2 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository
4. Configure the service:
   - **Name**: `kashif-hisab-kitab-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or set to `backend` if needed)

### 2.3 Add Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
MONGO_URI=your_mongodb_atlas_connection_string
PORT=10000
JWT_SECRET=your_secure_jwt_secret_here_min_32_characters
NODE_ENV=production
```

**Important**: 
- Replace `your_mongodb_atlas_connection_string` with your actual MongoDB Atlas connection string
- Generate a strong JWT_SECRET (at least 32 characters)
- Render uses port 10000 by default, but it's usually auto-detected

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL (e.g., `https://kashif-hisab-kitab-backend.onrender.com`)

**Note**: Free tier on Render spins down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds.

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)
3. Import your GitHub repository

### 3.2 Configure Project

1. Select your repository
2. Configure project:
   - **Framework Preset**: Vite (or "Other" if Vite not available)
   - **Root Directory**: `frontend`
   - **Build Command**: `node node_modules/vite/bin/vite.js build` (fixes permission issues)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
   
   **Alternative**: Use `npm run vercel-build` (which uses the Node.js method)

### 3.3 Add Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

Replace `your-backend-url.onrender.com` with your actual Render backend URL.

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

---

## 🔧 Step 4: Update MongoDB Atlas Connection

### 4.1 Allow All IPs (for testing) or Add Specific IPs

1. Go to MongoDB Atlas Dashboard
2. Click **"Network Access"**
3. Click **"Add IP Address"**
4. For testing: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
5. For production: Add Render's IP ranges (check Render docs)

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend

Visit: `https://your-backend-url.onrender.com/api/health` (if you have a health endpoint)

Or test login: `POST https://your-backend-url.onrender.com/api/auth/login`

### 5.2 Test Frontend

1. Visit your Vercel URL
2. Try logging in with your admin credentials
3. Test all features

---

## 🔄 Step 6: Automatic Deployments

Both platforms support automatic deployments:
- **Render**: Auto-deploys on push to main branch
- **Vercel**: Auto-deploys on push to main branch

Just push to GitHub and both will redeploy automatically!

---

## 🐛 Troubleshooting

### Backend Issues

1. **Backend not responding**: 
   - Check Render logs
   - Verify environment variables
   - Check MongoDB connection

2. **CORS errors**:
   - Update CORS in `backend/server.js` to include your Vercel URL

3. **MongoDB connection fails**:
   - Check MongoDB Atlas Network Access
   - Verify connection string in environment variables

### Frontend Issues

1. **API calls failing**:
   - Verify `VITE_API_URL` environment variable
   - Check browser console for errors
   - Ensure backend is running

2. **Build fails**:
   - Check Vercel build logs
   - Verify all dependencies in `package.json`

---

## 📝 Important Notes

1. **Free Tier Limitations**:
   - Render: Spins down after 15 min inactivity (first request slow)
   - Vercel: Unlimited requests, but bandwidth limits apply
   - MongoDB Atlas: 512MB free storage

2. **Environment Variables**:
   - Never commit `.env` files to GitHub
   - Always set them in platform dashboards

3. **Custom Domain** (Optional):
   - Vercel: Free custom domain support
   - Render: Custom domain available on paid plans

---

## 🎉 You're Done!

Your application should now be live and accessible from anywhere!

**Frontend URL**: `https://your-project.vercel.app`  
**Backend URL**: `https://your-backend.onrender.com`

---

## 📞 Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

