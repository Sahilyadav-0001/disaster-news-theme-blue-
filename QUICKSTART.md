# Quick Start Guide

## Current Setup

You're running the frontend on **port 8000** using a static file server. This works perfectly! Here are your options:

## Option 1: Frontend Only (What you're doing now) ✅

**What's working:**
- ✅ Dashboard displays simulated data automatically
- ✅ All pages work correctly
- ✅ Maps, charts, and feeds update every 10 seconds
- ✅ No backend server needed

**How to run:**
```bash
# Using Python (what you're likely using)
python3 -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000
```

Then open: `http://localhost:8000/index.html`

**Note:** You'll see a notice about "Using Simulated Data" - this is normal and expected.

## Option 2: Full Setup with Backend (Real Data) 🚀

To get **real disaster data** from USGS and NASA APIs, you need to run both servers:

### Step 1: Start Backend Server (Terminal 1)
```bash
cd disaster-news-theme-blue
npm install  # First time only
npm start
```
This starts the backend on **port 3000**

### Step 2: Start Frontend Server (Terminal 2)
```bash
cd disaster-news-theme-blue
python3 -m http.server 8000
```

### Step 3: Open Dashboard
Visit: `http://localhost:8000/dashboard.html`

The dashboard will automatically:
- Try to connect to backend on port 3000
- Use real data if backend is available
- Fall back to simulated data if backend is not running

## Option 3: All-in-One Backend Server (Recommended for Real Data)

The backend server can also serve the frontend files!

### Start Everything:
```bash
cd disaster-news-theme-blue
npm install  # First time only
npm start
```

Then visit: `http://localhost:3000/index.html`

This runs everything on one port (3000) and includes:
- ✅ Real-time disaster data from APIs
- ✅ Automatic data refresh every 10 minutes
- ✅ Full backend functionality

## Troubleshooting

### Dashboard shows no data?
- Check browser console (F12) for errors
- The dashboard should load with simulated data automatically
- Try refreshing the page

### Want to disable the backend notice?
Edit `script.js` line 20:
```javascript
USE_BACKEND: false, // Change to false to always use simulated data
```

### Backend won't start?
- Make sure Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 3000 is in use

## Current Status

**Your setup (port 8000):**
- ✅ Frontend: Working
- ⚠️ Backend: Not running (using simulated data - this is fine!)
- ✅ Dashboard: Should display data automatically

The simulated data works great for demos and presentations!

