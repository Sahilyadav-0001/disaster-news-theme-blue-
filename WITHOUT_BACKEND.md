# Running Without Backend ✅

**Good news!** The dashboard works perfectly without the backend server. Here's what you need to know:

## Current Setup (No Backend)

When you run the frontend on port 8000 without starting the backend:

✅ **Everything works automatically:**
- Dashboard loads instantly with simulated data
- Maps, charts, and feeds all function normally
- New events appear every 10 seconds
- All features work perfectly

## What You'll See

1. **Dashboard loads immediately** with disaster events
2. **Notice appears** (top-right): "Using Simulated Data"
   - This is normal and expected!
   - You can click the × to dismiss it
   - It auto-hides after 8 seconds
3. **Status shows**: "Last updated: [time] (Simulated Data)"

## How It Works

The system automatically:
1. Tries to connect to backend on port 3000
2. If backend isn't running (like now), it uses simulated data
3. Generates realistic disaster events automatically
4. Updates every 10 seconds with new events

## Simulated Data Features

- ✅ 8+ different disaster types (earthquakes, floods, wildfires, etc.)
- ✅ Realistic locations around the world
- ✅ Proper severity classifications (severe, moderate, minor)
- ✅ Timestamps and detailed information
- ✅ Perfect for demos and presentations

## Starting the Backend (Optional)

If you want real data from USGS and NASA APIs later:

```bash
# Terminal 1: Start backend
npm start

# Keep frontend running on port 8000 in another terminal
python3 -m http.server 8000
```

Then refresh the dashboard - it will automatically use real data!

## Troubleshooting

**Dashboard shows no data?**
- Check browser console (F12) for errors
- Try refreshing the page
- Make sure JavaScript is enabled

**Want to disable backend attempts completely?**
Edit `script.js` line 20:
```javascript
USE_BACKEND: false, // Change to false
```

**Everything working fine?** 
- You're all set! The simulated data is perfect for demos.

---

**Bottom line:** Your current setup (frontend on port 8000, no backend) works perfectly! 🎉

