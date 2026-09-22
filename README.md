# Disaster News - Emergency Monitoring Dashboard

A comprehensive real-time disaster monitoring platform with live data integration from USGS, NASA, and global monitoring systems. Features interactive maps, real-time charts, AI-powered predictions, and a modern responsive interface.

## ✨ Features

- 🌍 **Real-time Data** - Live disaster data from USGS (earthquakes) and NASA FIRMS (wildfires)
- 📊 **Interactive Map** - Dynamic global map with real-time disaster event markers
- 📈 **Live Charts** - Activity trends and severity breakdown with Chart.js
- 🔔 **Live Feed** - Auto-updating disaster alerts with severity classifications
- 🤖 **AI Predictor** - Machine learning forecast model based on trends
- 📱 **Responsive Design** - Mobile-friendly with hamburger navigation
- ♿ **Accessible** - ARIA labels, keyboard navigation, and semantic HTML
- ⚡ **Auto-refresh** - Updates every 30 seconds automatically

## 🚀 Quick Start Guide

### ⚡ Fastest Way (Frontend Only - Simulated Data)

If you just want to see the dashboard working immediately:

```bash
cd disaster-news-theme-blue
python3 -m http.server 8000
```

Then open: `http://localhost:8000/index.html`

**What you get:**
- ✅ Fully functional dashboard with simulated data
- ✅ Maps, charts, feeds all working
- ✅ Auto-updates every 10 seconds
- ✅ Perfect for demos and presentations

**Note:** A notice will appear saying "Using Simulated Data" - this is normal!

---

### 🚀 Full Setup (With Backend - Real Data)

### Prerequisites

- Node.js (v14 or higher) and npm installed
- Internet connection (for fetching real disaster data)

### Installation & Setup

1. **Install dependencies:**
   ```bash
   cd disaster-news-theme-blue
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:3000`

3. **Open in browser:**
   - Navigate to `http://localhost:3000`
   - The dashboard will automatically fetch real disaster data
   - Data refreshes every 10 minutes automatically

**OR** run frontend separately on port 8000:
   ```bash
   # In a new terminal
   python3 -m http.server 8000
   ```
   Then open: `http://localhost:8000/dashboard.html`
   
   The frontend will automatically try to connect to backend on port 3000 for real data.

### What the Backend Does

- Fetches real earthquake data from USGS API
- Retrieves wildfire data from NASA FIRMS
- Aggregates and processes disaster information
- Serves data via RESTful API endpoints
- Auto-refreshes data every 10 minutes
- Stores data locally for faster access

## 📋 API Endpoints

- `GET /api/disasters` - Get all disaster events
- `GET /api/stats` - Get disaster statistics
- `GET /api/disasters/recent` - Get recent disasters (last 24h)
- `POST /api/disasters/refresh` - Manually refresh data
- `GET /api/health` - Health check

## 🔄 Quick Start (Frontend Only - Limited Features)

### Method 1: Open Directly in Browser (Simplest)

1. Navigate to the project folder:
   ```bash
   cd disaster-news-theme-blue
   ```

2. Double-click `index.html` or open it in your browser

**Note:** Some features may not work perfectly due to browser security restrictions. For full functionality, use a local server (recommended).

### Method 2: Python HTTP Server (Recommended)

If you have Python installed:

**Python 3:**
```bash
cd disaster-news-theme-blue
python3 -m http.server 8000
```

**Python 2:**
```bash
cd disaster-news-theme-blue
python -m SimpleHTTPServer 8000
```

Then open your browser and visit: `http://localhost:8000`

### Method 3: Node.js http-server

If you have Node.js installed:

1. Install http-server globally (one-time setup):
   ```bash
   npm install -g http-server
   ```

2. Run the server:
   ```bash
   cd disaster-news-theme-blue
   http-server -p 8000
   ```

3. Open `http://localhost:8000` in your browser

### Method 4: PHP Built-in Server

If you have PHP installed:

```bash
cd disaster-news-theme-blue
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Method 5: VS Code Live Server Extension

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 📁 Project Structure

```
disaster-news-theme-blue/
├── server.js           # Backend Express server
├── package.json        # Node.js dependencies
├── index.html          # Home page
├── dashboard.html      # Main dashboard with maps and charts
├── about.html          # About page
├── contact.html        # Contact form page
├── style.css           # Main stylesheet
├── script.js           # Dashboard functionality (maps, charts, feed)
├── navigation.js       # Mobile menu navigation handler
├── data/               # Data storage (auto-created)
│   └── disasters.json  # Cached disaster data
└── assets/
    └── project_report.pdf
```

## 📦 Dependencies

### Backend (npm packages)
- **express** - Web server framework
- **axios** - HTTP client for API requests
- **cors** - Cross-origin resource sharing
- **node-cron** - Task scheduling for auto-refresh

### Frontend (CDN)
- **Leaflet.js** - Interactive maps
- **Chart.js** - Data visualization
- **Google Fonts** - Poppins font family

All frontend dependencies load automatically from CDN. Backend dependencies are installed via `npm install`.

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 🎯 Features Breakdown

### Dashboard (`dashboard.html`)
- **Real-time Statistics** - Total events, severity breakdown
- **Interactive World Map** - Live disaster markers from real APIs
- **Activity Trend Chart** - 24-hour hourly disaster count
- **Severity Breakdown** - Pie chart with severe/moderate/minor distribution
- **Live Feed** - Auto-updating alerts with timestamps and details
- **AI Prediction** - Forecast based on current trends
- **Controls** - Pause/Resume, Clear, and Manual Refresh buttons

### Data Sources
- **USGS** - Real earthquake data from around the world
- **NASA FIRMS** - Active wildfire detection data
- **Simulated Data** - Additional disaster types (floods, storms, etc.)

### Navigation
- Responsive hamburger menu for mobile
- Smooth animations
- Keyboard accessible

### Forms
- Contact form with real-time validation
- Accessible error messages
- Email format validation

## 🔧 Troubleshooting

### Backend Issues

**Server won't start:**
- Ensure Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 3000 is already in use
- Review server logs for specific errors

**No data loading:**
- Check internet connection (backend fetches from external APIs)
- Verify APIs are accessible (USGS, NASA FIRMS)
- Check browser console for CORS or network errors
- Try manual refresh: Click "Refresh" button on dashboard

**API errors:**
- Some APIs may have rate limits
- Check server console for specific error messages
- Data will fallback to cached data if APIs fail

### Frontend Issues

**Map not loading:**
- Make sure backend server is running on port 3000
- Check browser console for errors
- Verify internet connection (maps load from CDN)
- Try hard refresh (Ctrl+F5 or Cmd+Shift+R)

**Charts not displaying:**
- Check browser console for Chart.js errors
- Ensure JavaScript is enabled in your browser
- Verify data is being fetched from backend API

**Styling looks broken:**
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check that `style.css` is in the same directory
- Verify all CSS files are loading properly

## Customization

### Changing Update Interval
Edit `script.js`:
```javascript
const CONFIG = {
  UPDATE_INTERVAL: 4500, // Change this value (in milliseconds)
  // ...
};
```

### Adding New Disaster Events
Edit the `eventsPool` array in `script.js`:
```javascript
const eventsPool = [
  { title: 'Your Event Name', type: 'event-type' },
  // ...
];
```

## License

This is a demo project for presentation purposes.

## Author

Akshey - Developer & Designer

