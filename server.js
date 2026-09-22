/**
 * Disaster News Backend Server
 * Provides real-time disaster data from various APIs
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// Data storage
const DATA_FILE = path.join(__dirname, 'data', 'disasters.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Initialize data storage
async function initData() {
  await ensureDataDir();
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({
      disasters: [],
      lastUpdate: null,
      stats: {
        total: 0,
        severe: 0,
        moderate: 0,
        minor: 0
      }
    }));
  }
}

// Load data from file
async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading data:', error);
    return { disasters: [], lastUpdate: null, stats: { total: 0, severe: 0, moderate: 0, minor: 0 } };
  }
}

// Save data to file
async function saveData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Fetch real earthquake data from USGS
async function fetchEarthquakes() {
  try {
    const response = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson', {
      timeout: 10000
    });
    
    const earthquakes = response.data.features.map(feature => {
      const props = feature.properties;
      const mag = props.mag || 0;
      
      // Determine severity based on magnitude
      let severity = 'minor';
      if (mag >= 6.0) severity = 'severe';
      else if (mag >= 4.5) severity = 'moderate';
      
      return {
        id: feature.id,
        title: props.title || `Earthquake - ${props.place || 'Unknown'}`,
        type: 'earthquake',
        severity: severity,
        magnitude: mag,
        time: new Date(props.time).toISOString(),
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        depth: feature.geometry.coordinates[2],
        url: props.url,
        source: 'USGS'
      };
    });
    
    return earthquakes;
  } catch (error) {
    console.error('Error fetching earthquakes:', error.message);
    return [];
  }
}

// Fetch wildfire data from NASA MODIS
async function fetchWildfires() {
  try {
    // Using NASA's FIRMS API (free, no key required for basic usage)
    const response = await axios.get('https://firms.modaps.eosdis.nasa.gov/api/country/csv/0/1d/world/0', {
      timeout: 10000,
      headers: {
        'Accept': 'text/csv'
      }
    });
    
    // Parse CSV data
    const lines = response.data.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    const wildfires = [];
    for (let i = 1; i < Math.min(lines.length, 50); i++) {
      const values = lines[i].split(',');
      if (values.length >= 5) {
        const confidence = parseFloat(values[4]) || 0;
        let severity = 'minor';
        if (confidence >= 80) severity = 'severe';
        else if (confidence >= 50) severity = 'moderate';
        
        wildfires.push({
          id: `wildfire-${i}-${Date.now()}`,
          title: `Wildfire - ${values[0] || 'Unknown Location'}`,
          type: 'wildfire',
          severity: severity,
          time: new Date().toISOString(),
          lat: parseFloat(values[2]) || 0,
          lon: parseFloat(values[3]) || 0,
          confidence: confidence,
          source: 'NASA FIRMS'
        });
      }
    }
    
    return wildfires;
  } catch (error) {
    console.error('Error fetching wildfires:', error.message);
    return [];
  }
}

// Simulate other disaster types (since APIs are limited)
function generateSimulatedDisasters() {
  const disasters = [];
  const types = [
    { title: 'Flood Warning - Jakarta', type: 'flood', baseLat: -6.2, baseLon: 106.8 },
    { title: 'Cyclone Alert - Bay of Bengal', type: 'storm', baseLat: 15.0, baseLon: 88.0 },
    { title: 'Tsunami Warning - Pacific', type: 'tsunami', baseLat: -20.0, baseLon: -170.0 },
    { title: 'Landslide - Himalayas', type: 'landslide', baseLat: 28.0, baseLon: 84.0 }
  ];
  
  // Generate 2-4 simulated disasters
  const count = Math.floor(Math.random() * 3) + 2;
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = ['severe', 'moderate', 'minor'][Math.floor(Math.random() * 3)];
    
    disasters.push({
      id: `sim-${Date.now()}-${i}`,
      title: type.title,
      type: type.type,
      severity: severity,
      time: new Date().toISOString(),
      lat: type.baseLat + (Math.random() * 2 - 1),
      lon: type.baseLon + (Math.random() * 2 - 1),
      source: 'Simulated'
    });
  }
  
  return disasters;
}

// Fetch all disaster data
async function fetchAllDisasters() {
  console.log('Fetching disaster data...');
  
  const [earthquakes, wildfires] = await Promise.all([
    fetchEarthquakes(),
    fetchWildfires()
  ]);
  
  const simulated = generateSimulatedDisasters();
  
  // Combine all disasters
  const allDisasters = [...earthquakes, ...wildfires, ...simulated];
  
  // Sort by time (most recent first)
  allDisasters.sort((a, b) => new Date(b.time) - new Date(a.time));
  
  // Calculate statistics
  const stats = {
    total: allDisasters.length,
    severe: allDisasters.filter(d => d.severity === 'severe').length,
    moderate: allDisasters.filter(d => d.severity === 'moderate').length,
    minor: allDisasters.filter(d => d.severity === 'minor').length
  };
  
  const data = {
    disasters: allDisasters.slice(0, 100), // Limit to 100 most recent
    lastUpdate: new Date().toISOString(),
    stats: stats
  };
  
  await saveData(data);
  console.log(`Fetched ${allDisasters.length} disasters. Stats:`, stats);
  
  return data;
}

// API Routes

// Get all disasters
app.get('/api/disasters', async (req, res) => {
  try {
    const data = await loadData();
    
    // If data is older than 5 minutes, refresh
    if (!data.lastUpdate || (Date.now() - new Date(data.lastUpdate).getTime()) > 5 * 60 * 1000) {
      const freshData = await fetchAllDisasters();
      return res.json(freshData);
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error getting disasters:', error);
    res.status(500).json({ error: 'Failed to fetch disasters' });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data.stats || { total: 0, severe: 0, moderate: 0, minor: 0 });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get recent disasters (last 24 hours)
app.get('/api/disasters/recent', async (req, res) => {
  try {
    const data = await loadData();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    const recent = data.disasters.filter(disaster => {
      return new Date(disaster.time).getTime() > oneDayAgo;
    });
    
    res.json(recent);
  } catch (error) {
    console.error('Error getting recent disasters:', error);
    res.status(500).json({ error: 'Failed to fetch recent disasters' });
  }
});

// Refresh disaster data manually
app.post('/api/disasters/refresh', async (req, res) => {
  try {
    const data = await fetchAllDisasters();
    res.json({ message: 'Data refreshed successfully', data });
  } catch (error) {
    console.error('Error refreshing disasters:', error);
    res.status(500).json({ error: 'Failed to refresh data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize and start server
async function startServer() {
  await initData();
  
  // Fetch initial data
  await fetchAllDisasters();
  
  // Schedule automatic updates every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    await fetchAllDisasters();
  });
  
  app.listen(PORT, () => {
    console.log(`🚀 Disaster News Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard.html`);
    console.log(`🔄 Auto-refresh: Every 10 minutes`);
  });
}

startServer().catch(console.error);

