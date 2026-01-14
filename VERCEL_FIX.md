# 🔧 Vercel Build Fix - Permission Denied Error

## Problem
Getting `Permission denied` error when building on Vercel:
```
sh: line 1: /vercel/path0/node_modules/.bin/vite: Permission denied
Error: Command "npm run build" exited with 126
```

## ✅ Solution 1: Use Node.js Directly (RECOMMENDED - Fixes Permission Issue)

### In Vercel Dashboard:
1. Go to your project settings
2. Go to **Settings** → **General** → **Build & Development Settings**
3. Update:
   - **Build Command**: `node node_modules/vite/bin/vite.js build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
   - **Root Directory**: `frontend`

### Or use the vercel-build script:
- **Build Command**: `npm run vercel-build` (now uses Node.js directly)

---

## ✅ Solution 2: Remove vercel.json (Let Vercel Auto-Detect)

1. Delete or rename `frontend/vercel.json`
2. In Vercel dashboard:
   - **Framework Preset**: Select "Vite"
   - **Root Directory**: `frontend`
   - Let Vercel auto-detect the rest

---

## ✅ Solution 3: Manual Build Command

In Vercel dashboard, set:
- **Build Command**: `cd frontend && npm install && npx vite build`
- **Output Directory**: `frontend/dist`
- **Root Directory**: Leave empty

---

## 🔍 Additional Checks

1. **Node Version**: Ensure Node.js 18+ is selected in Vercel settings
2. **Package Manager**: Make sure npm is selected (not yarn/pnpm)
3. **Clear Build Cache**: In Vercel dashboard → Settings → Clear build cache

---

## 🚀 Quick Fix Steps

1. Go to Vercel Dashboard → Your Project → Settings
2. Navigate to **Build & Development Settings**
3. Change **Build Command** to: `npx vite build`
4. Set **Root Directory** to: `frontend`
5. Set **Output Directory** to: `dist`
6. Click **Save**
7. Redeploy

---

## 📝 Updated package.json Script

The `vercel-build` script has been added to `frontend/package.json`:
```json
"vercel-build": "npx vite build"
```

You can use either:
- `npm run vercel-build` in Build Command
- Or `npx vite build` directly

---

**After making these changes, push to GitHub and Vercel will auto-redeploy!**

