# Disaster News - Project Report

**Project Name:** Disaster News - Real-time Emergency Monitoring Dashboard  
**Version:** 2.0.0  
**Author:** Akshey  
**Date:** November 2025

---

## Project Overview

Disaster News is a full-stack web application that provides real-time monitoring and visualization of natural disasters worldwide. The platform aggregates data from multiple sources including USGS (earthquakes) and NASA FIRMS (wildfires) to display disaster events on an interactive dashboard.

---

## Key Features

### Core Functionality
- **Real-time Disaster Monitoring**: Live updates from USGS and NASA APIs
- **Interactive Global Map**: Visual representation of disaster locations with severity indicators
- **Live Feed**: Auto-updating stream of disaster events with timestamps
- **Data Visualization**: Charts showing activity trends and severity breakdown
- **AI Predictions**: Forecasting model based on current disaster patterns
- **Statistics Dashboard**: Real-time counts and severity classifications

### User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Theme**: Optimized for emergency operations monitoring
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
- **Modern UI**: Smooth animations and intuitive navigation

---

## Technology Stack

### Frontend
- **HTML5 & CSS3**: Structure and styling
- **JavaScript (ES6+)**: Client-side functionality
- **Leaflet.js**: Interactive mapping
- **Chart.js**: Data visualization

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web server framework
- **Axios**: HTTP client for API calls
- **node-cron**: Automated data refresh scheduling

### Data Sources
- **USGS API**: Real-time earthquake data
- **NASA FIRMS API**: Active wildfire detection
- **OpenStreetMap**: Map tiles

---

## Project Structure

```
disaster-news-theme-blue/
├── Frontend
│   ├── index.html          # Home page
│   ├── dashboard.html      # Main dashboard
│   ├── about.html          # About page
│   ├── contact.html        # Contact page
│   ├── style.css           # Stylesheet
│   ├── script.js           # Dashboard logic
│   └── navigation.js       # Navigation handler
│
├── Backend
│   ├── server.js           # Express server
│   ├── package.json        # Dependencies
│   └── data/               # Data storage
│
└── Documentation
    ├── README.md
    ├── QUICKSTART.md
    └── PROJECT_REPORT.md
```

---

## Installation & Setup

### Quick Start (Frontend Only)

```bash
# Start simple HTTP server
python3 -m http.server 8000

# Open browser
http://localhost:8000/index.html
```

### Full Setup (With Backend)

```bash
# Install dependencies
npm install

# Start backend server
npm start

# Start frontend (new terminal)
python3 -m http.server 8000
```

---

## How It Works

### Data Flow
1. Backend fetches disaster data from USGS and NASA APIs
2. Data is processed, normalized, and cached locally
3. Frontend requests data via RESTful API
4. Dashboard displays data on map, charts, and feed
5. Auto-refresh every 10 seconds (frontend) and 10 minutes (backend)

### Features
- **Fallback System**: Uses simulated data if backend unavailable
- **Real-time Updates**: Continuous monitoring with automatic refresh
- **Interactive Elements**: Clickable map markers, hover tooltips
- **Control Options**: Pause, clear, and manual refresh buttons

---

## API Endpoints

- `GET /api/disasters` - Get all disaster events
- `GET /api/stats` - Get statistics summary
- `GET /api/disasters/recent` - Get recent events (24h)
- `POST /api/disasters/refresh` - Manually refresh data
- `GET /api/health` - Health check

---

## Key Components

### Dashboard Components
1. **Statistics Cards**: Total events and severity breakdown
2. **Global Map**: Interactive map with disaster markers
3. **Live Feed**: Scrollable list of recent disasters
4. **Activity Chart**: 24-hour trend visualization
5. **Severity Chart**: Distribution pie chart
6. **AI Predictor**: Forecast display

### Technical Components
- **Error Handling**: Graceful fallbacks and recovery
- **Loading States**: Visual feedback during operations
- **Responsive Grid**: Adaptive layout for all screen sizes
- **Mobile Menu**: Hamburger navigation for mobile devices

---

## Statistics

- **Total Lines of Code**: ~3,300+
- **Frontend Files**: 7 files
- **Backend Files**: 3 files
- **Dependencies**: 5 npm packages
- **API Integrations**: 2 external APIs
- **Pages**: 4 (Home, Dashboard, About, Contact)

---

## Use Cases

1. **Emergency Management**: Real-time disaster awareness for responders
2. **Public Awareness**: Informative dashboard for general public
3. **Research**: Data analysis and pattern recognition
4. **Education**: Demonstration of modern web technologies
5. **Portfolio**: Showcase full-stack development skills

---

## Future Enhancements

- User authentication and preferences
- Push notifications for severe events
- Historical data analysis
- Export functionality (CSV, PDF)
- Additional data sources
- Mobile applications

---

## Conclusion

Disaster News successfully delivers a functional, user-friendly disaster monitoring platform. The application demonstrates proficiency in full-stack development, API integration, and modern web technologies. With real-time data visualization and responsive design, it serves as both a practical tool and an impressive technical demonstration.

**Project Status**: ✅ Production Ready  
**Browser Support**: Chrome, Firefox, Safari, Edge (latest versions)

---

*For detailed documentation, see README.md*  
*For quick start guide, see QUICKSTART.md*

