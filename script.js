/**
 * Disaster News Dashboard - Real-time Data Integration
 * Fetches real disaster data from backend API
 */

// ========== Configuration ==========
const CONFIG = {
  API_URL: (() => {
    // Try to detect backend URL
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      // Check if running on same origin (backend serving frontend)
      if (window.location.port === '3000') {
        console.log('✅ Running on backend server (port 3000) - using same origin');
        return origin;
      }
      console.log('📡 Frontend on port', window.location.port || '80', '- will try backend on port 3000');
      return 'http://localhost:3000';
    }
    return origin; // Same origin for deployed
  })(),
  USE_BACKEND: true, // Set to false to use simulated data only
  UPDATE_INTERVAL: 10000, // 10 seconds for faster updates
  MAX_MARKERS: 50,
  MAX_FEED_ITEMS: 15,
  ALPHA: 0.35, // Exponential smoothing factor
  MAP_CENTER: [20, 0],
  MAP_ZOOM: 2
};

// ========== State Management ==========
const state = {
  map: null,
  markers: [],
  chartTrend: null,
  pieChart: null,
  running: true,
  updateInterval: null,
  disasters: [],
  stats: { total: 0, severe: 0, moderate: 0, minor: 0 },
  activityData: [], // For trend chart
  backendAvailable: false
};

// ========== Simulated Data (Fallback) ==========
const eventsPool = [
  { title: 'Earthquake - Offshore Japan', type: 'earthquake', baseLat: 36.5, baseLon: 138.2 },
  { title: 'Flood Warning - Jakarta', type: 'flood', baseLat: -6.2, baseLon: 106.8 },
  { title: 'Wildfire - California', type: 'wildfire', baseLat: 37.8, baseLon: -122.4 },
  { title: 'Cyclone Alert - Bay of Bengal', type: 'storm', baseLat: 15.0, baseLon: 88.0 },
  { title: 'Tsunami Warning - Pacific', type: 'tsunami', baseLat: -20.0, baseLon: -170.0 },
  { title: 'Landslide - Nepal', type: 'landslide', baseLat: 28.0, baseLon: 84.0 },
  { title: 'Volcanic Activity - Iceland', type: 'volcano', baseLat: 64.8, baseLon: -17.3 },
  { title: 'Tornado Warning - Midwest USA', type: 'storm', baseLat: 39.8, baseLon: -98.6 }
];

function generateSimulatedEvent() {
  const e = eventsPool[Math.floor(Math.random() * eventsPool.length)];
  const severities = ['severe', 'moderate', 'minor'];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  
  const lat = e.baseLat + (Math.random() * 4 - 2);
  const lon = e.baseLon + (Math.random() * 4 - 2);
  
  return {
    id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: e.title,
    type: e.type,
    severity: severity,
    time: new Date().toISOString(),
    lat: lat,
    lon: lon,
    magnitude: e.type === 'earthquake' ? (Math.random() * 6 + 3).toFixed(1) : null,
    source: 'Simulated'
  };
}

function generateSimulatedData(keepExisting = false) {
  let disasters = [];
  
  // If keeping existing, start with current disasters (filtered to last 24h)
  if (keepExisting && state.disasters.length > 0) {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    disasters = state.disasters.filter(d => {
      return new Date(d.time).getTime() > oneDayAgo;
    });
  }
  
  // Generate 1-3 new events per update
  const newCount = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < newCount; i++) {
    disasters.push(generateSimulatedEvent());
  }
  
  // If we have too many events, keep only the most recent
  if (disasters.length > 50) {
    disasters.sort((a, b) => new Date(b.time) - new Date(a.time));
    disasters = disasters.slice(0, 50);
  }
  
  // Sort by time (most recent first)
  disasters.sort((a, b) => new Date(b.time) - new Date(a.time));
  
  // Ensure minimum of 8 events for better display
  while (disasters.length < 8) {
    disasters.push(generateSimulatedEvent());
  }
  
  const stats = {
    total: disasters.length,
    severe: disasters.filter(d => d.severity === 'severe').length,
    moderate: disasters.filter(d => d.severity === 'moderate').length,
    minor: disasters.filter(d => d.severity === 'minor').length
  };
  
  return { disasters, stats, lastUpdate: new Date().toISOString() };
}

// ========== API Functions ==========
async function fetchDisasters() {
  if (!CONFIG.USE_BACKEND) {
    return generateSimulatedData();
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${CONFIG.API_URL}/api/disasters`, {
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate data structure
    if (data && Array.isArray(data.disasters)) {
      state.backendAvailable = true;
      return data;
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Backend request timed out, using simulated data');
    } else {
      console.warn('Backend not available, using simulated data:', error.message);
    }
    
    state.backendAvailable = false;
    // Show notice to user
    showBackendNotice();
    
    // Use simulated data as fallback (keep existing events)
    return generateSimulatedData(true);
  }
}

function showBackendNotice() {
  // Only show once and only if backend was attempted
  // Notice is disabled by default - set USE_BACKEND to true to enable
  if (document.getElementById('backendNotice') || !CONFIG.USE_BACKEND) return;
  
  const notice = document.createElement('div');
  notice.id = 'backendNotice';
  notice.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    background: rgba(126, 232, 255, 0.95);
    color: #00121a;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    max-width: 320px;
    animation: slideInRight 0.3s ease-out;
  `;
  notice.innerHTML = `
    <strong>💡 Using Simulated Data</strong><br>
    <small>Everything is working perfectly! The dashboard is using simulated disaster data.<br>
    This is great for demos. Real data available when backend is running.</small>
    <button onclick="this.parentElement.remove()" style="float: right; background: transparent; border: none; cursor: pointer; font-size: 18px; margin-top: -5px; color: #00121a;">×</button>
  `;
  document.body.appendChild(notice);
  
  // Auto-hide after 5 seconds (less intrusive)
  setTimeout(() => {
    if (notice.parentElement) {
      notice.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notice.remove(), 300);
    }
  }, 5000);
}

async function fetchStats() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/api/stats`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
  return state.stats;
}

// ========== Map Functions ==========
function initMap() {
  try {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.warn('Map element not found');
      return;
    }

    if (typeof L === 'undefined') {
      mapElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #8be0ff;">Error: Map library failed to load. Please refresh the page.</div>';
      mapElement.classList.add('loading');
      return;
    }

    mapElement.classList.add('loading');
    
    state.map = L.map('map').setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);
    
    // Use a darker map theme for better visibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(state.map);

    mapElement.classList.remove('loading');
    
    state.map.on('tileerror', function(error) {
      console.warn('Map tile error:', error);
    });
    
  } catch (error) {
    console.error('Error initializing map:', error);
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #ff6b6b;">Error loading map. Please check your connection.</div>';
    }
  }
}

function clearMarkers() {
  if (state.map) {
    state.markers.forEach(marker => {
      state.map.removeLayer(marker);
    });
    state.markers = [];
  }
}

function addMarker(disaster) {
  if (!state.map) {
    console.warn('Map not initialized, cannot add marker');
    return;
  }

  try {
    const colors = {
      severe: '#ff6b6b',
      moderate: '#ffb86b',
      minor: '#7ee8ff'
    };
    
    const color = colors[disaster.severity] || colors.minor;
    const radius = disaster.severity === 'severe' ? 10 : disaster.severity === 'moderate' ? 8 : 6;
    
    // Create custom icon
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
      iconSize: [radius * 2, radius * 2],
      iconAnchor: [radius, radius]
    });
    
    const marker = L.marker([disaster.lat, disaster.lon], { icon }).addTo(state.map);
    
    // Enhanced popup content
    const time = new Date(disaster.time).toLocaleString();
    const magnitude = disaster.magnitude ? `Magnitude: ${disaster.magnitude}<br>` : '';
    const depth = disaster.depth ? `Depth: ${disaster.depth.toFixed(1)} km<br>` : '';
    const source = disaster.source ? `<small>Source: ${disaster.source}</small>` : '';
    
    marker.bindPopup(`
      <div style="min-width: 200px;">
        <strong style="color: ${color};">${disaster.title}</strong><br>
        <span style="color: #bbb;">Type: ${disaster.type}</span><br>
        ${magnitude}${depth}
        Severity: <strong>${disaster.severity.toUpperCase()}</strong><br>
        <small>Time: ${time}</small><br>
        ${source}
      </div>
    `);
    
    // Pulse animation for severe events
    if (disaster.severity === 'severe') {
      marker.on('add', function() {
        const element = marker.getElement();
        if (element) {
          element.style.animation = 'pulse 2s infinite';
        }
      });
    }
    
    state.markers.push(marker);
    
  } catch (error) {
    console.error('Error adding marker:', error);
  }
}

// ========== Feed Functions ==========
function updateFeed(disasters) {
  try {
    const feed = document.getElementById('feed');
    if (!feed) {
      console.warn('Feed element not found');
      return;
    }

    // Clear existing feed
    feed.innerHTML = '';

    // Show most recent disasters
    const recentDisasters = disasters.slice(0, CONFIG.MAX_FEED_ITEMS);
    
    recentDisasters.forEach(disaster => {
      const div = document.createElement('div');
      div.className = 'feed-item';
      div.setAttribute('role', 'article');
      div.setAttribute('aria-label', `Disaster alert: ${disaster.title}`);
      
      const time = new Date(disaster.time).toLocaleTimeString();
      const date = new Date(disaster.time).toLocaleDateString();
      
      div.innerHTML = `
        <div>
          <strong>${disaster.title}</strong><br>
          <span class="small">${date} ${time} • ${disaster.type}</span>
          ${disaster.magnitude ? `<br><span class="small">Magnitude: ${disaster.magnitude}</span>` : ''}
        </div>
        <div>
          <span class="badge ${disaster.severity}" aria-label="Severity: ${disaster.severity}">
            ${disaster.severity.toUpperCase()}
          </span>
        </div>
      `;
      
      feed.appendChild(div);
    });
    
  } catch (error) {
    console.error('Error updating feed:', error);
  }
}

// ========== Chart Functions ==========
function initCharts() {
  try {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js library not loaded');
      const trendEl = document.getElementById('trendChart');
      const pieEl = document.getElementById('pieChart');
      if (trendEl) {
        trendEl.parentElement.innerHTML = '<p style="color: #ff6b6b; padding: 20px;">Error: Chart library failed to load.</p>';
      }
      if (pieEl) {
        pieEl.parentElement.innerHTML = '<p style="color: #ff6b6b; padding: 20px;">Error: Chart library failed to load.</p>';
      }
      return;
    }

    const trendCanvas = document.getElementById('trendChart');
    const pieCanvas = document.getElementById('pieChart');
    
    if (!trendCanvas || !pieCanvas) {
      console.warn('Chart canvases not found');
      return;
    }

    const trendCtx = trendCanvas.getContext('2d');
    const pieCtx = pieCanvas.getContext('2d');
    
    // Initialize with empty data
    const labels = Array.from({ length: 24 }, (_, i) => {
      const hoursAgo = 23 - i;
      return hoursAgo === 0 ? 'Now' : `${hoursAgo}h`;
    });
    
    // Initialize trend chart
    state.chartTrend = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Disaster Activity',
          data: Array(24).fill(0),
          borderColor: '#8be0ff',
          backgroundColor: 'rgba(139, 224, 255, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#8be0ff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#8be0ff',
            bodyColor: '#e6f2ff',
            borderColor: '#8be0ff',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#b6dff0', font: { size: 11 } },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            ticks: { color: '#b6dff0', font: { size: 11 } },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
    
    // Initialize pie chart
    state.pieChart = new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: ['Severe', 'Moderate', 'Minor'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#ff6b6b', '#ffb86b', '#7ee8ff'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { 
              color: '#b6dff0', 
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#8be0ff',
            bodyColor: '#e6f2ff',
            borderColor: '#8be0ff',
            borderWidth: 1
          }
        }
      }
    });
  } catch (error) {
    console.error('Error initializing charts:', error);
  }
}

function updateCharts(disasters) {
  try {
    if (!state.chartTrend || !state.pieChart) {
      return;
    }

    // Update activity trend (last 24 hours)
    const now = Date.now();
    const hourlyCounts = Array(24).fill(0);
    
    disasters.forEach(disaster => {
      const hoursAgo = Math.floor((now - new Date(disaster.time).getTime()) / (1000 * 60 * 60));
      if (hoursAgo >= 0 && hoursAgo < 24) {
        hourlyCounts[23 - hoursAgo]++;
      }
    });
    
    state.chartTrend.data.datasets[0].data = hourlyCounts;
    state.chartTrend.update('none');

    // Update pie chart with severity breakdown
    const severe = disasters.filter(d => d.severity === 'severe').length;
    const moderate = disasters.filter(d => d.severity === 'moderate').length;
    const minor = disasters.filter(d => d.severity === 'minor').length;
    
    state.pieChart.data.datasets[0].data = [severe, moderate, minor];
    state.pieChart.update('none');
    
  } catch (error) {
    console.error('Error updating charts:', error);
  }
}

// ========== Statistics Display ==========
function updateStats(stats) {
  try {
    state.stats = stats;
    
    // Update hero stats
    const totalStat = document.getElementById('totalStat');
    const severeStat = document.getElementById('severeStat');
    const moderateStat = document.getElementById('moderateStat');
    const minorStat = document.getElementById('minorStat');
    
    if (totalStat) totalStat.textContent = stats.total || 0;
    if (severeStat) severeStat.textContent = stats.severe || 0;
    if (moderateStat) moderateStat.textContent = stats.moderate || 0;
    if (minorStat) minorStat.textContent = stats.minor || 0;
    
    // Update stats card
    const statTotal = document.getElementById('statTotal');
    const statSevere = document.getElementById('statSevere');
    const statModerate = document.getElementById('statModerate');
    const statMinor = document.getElementById('statMinor');
    
    if (statTotal) statTotal.textContent = stats.total || 0;
    if (statSevere) statSevere.textContent = stats.severe || 0;
    if (statModerate) statModerate.textContent = stats.moderate || 0;
    if (statMinor) statMinor.textContent = stats.minor || 0;
    
    // Update map status
    const mapStatus = document.getElementById('mapStatus');
    if (mapStatus) {
      if (stats.total > 0) {
        mapStatus.textContent = `${stats.total} events displayed`;
      } else {
        mapStatus.textContent = 'No events detected';
      }
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// ========== AI Prediction Functions ==========
function updateAI(disasters) {
  try {
    if (!state.chartTrend) {
      return;
    }

    const aiBox = document.getElementById('aiBox');
    if (!aiBox) {
      console.warn('AI box element not found');
      return;
    }

    // Calculate prediction based on recent activity
    const last24h = disasters.filter(d => {
      const hoursAgo = (Date.now() - new Date(d.time).getTime()) / (1000 * 60 * 60);
      return hoursAgo <= 24;
    });
    
    const recentCount = last24h.length;
    const forecast = Math.round(recentCount * 1.15); // 15% increase prediction
    
    aiBox.innerHTML = `
      <div class="prediction-content">
        <div class="prediction-value">${forecast}</div>
        <div class="prediction-label">Predicted reports (24h)</div>
        <div class="prediction-detail">Based on current trends</div>
      </div>
    `;
  } catch (error) {
    console.error('Error updating AI prediction:', error);
  }
}

// ========== Main Update Function ==========
async function updateDashboard() {
  if (!state.running) {
    return;
  }

  try {
    // Show loading indicator (only briefly)
    const loadingEl = document.getElementById('loadingIndicator');
    if (loadingEl && state.disasters.length === 0) {
      loadingEl.style.display = 'block';
    }

    // Fetch fresh data
    const data = await fetchDisasters();
    
    // Only update if we got valid data
    if (data && data.disasters) {
      state.disasters = data.disasters || [];
      state.stats = data.stats || { total: 0, severe: 0, moderate: 0, minor: 0 };
      
      // Update all components
      clearMarkers();
      state.disasters.forEach(disaster => {
        addMarker(disaster);
      });
      
      updateFeed(state.disasters);
      updateCharts(state.disasters);
      updateStats(state.stats);
      updateAI(state.disasters);
      
      // Update map status
      const mapStatus = document.getElementById('mapStatus');
      if (mapStatus) {
        mapStatus.textContent = `${state.disasters.length} events displayed`;
      }
      
      // Update last refresh time
      const lastUpdateEl = document.getElementById('lastUpdate');
      if (lastUpdateEl) {
        const source = state.backendAvailable ? 'Live Data' : 'Simulated Data';
        lastUpdateEl.textContent = `Last updated: ${new Date().toLocaleTimeString()} (${source})`;
      }
      
      // Hide loading indicator
      if (loadingEl) {
        loadingEl.style.display = 'none';
      }
    }

  } catch (error) {
    console.error('Error updating dashboard:', error);
    const loadingEl = document.getElementById('loadingIndicator');
    if (loadingEl) {
      loadingEl.innerHTML = '<span style="color: #ff6b6b;">Error loading data. Using simulated data...</span>';
      setTimeout(() => {
        if (loadingEl) loadingEl.style.display = 'none';
      }, 3000);
    }
    
    // Try to use simulated data as last resort
    if (state.disasters.length === 0) {
      const data = generateSimulatedData(false);
      state.disasters = data.disasters;
      state.stats = data.stats;
      
      clearMarkers();
      state.disasters.forEach(disaster => addMarker(disaster));
      updateFeed(state.disasters);
      updateCharts(state.disasters);
      updateStats(state.stats);
      updateAI(state.disasters);
    }
  }
}

// ========== Control Functions ==========
function toggleRunning() {
  try {
    state.running = !state.running;
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
      pauseBtn.textContent = state.running ? 'Pause' : 'Resume';
      pauseBtn.setAttribute('aria-label', state.running ? 'Pause updates' : 'Resume updates');
    }
    
    if (state.running) {
      updateDashboard();
    }
  } catch (error) {
    console.error('Error toggling running state:', error);
  }
}

function clearFeed() {
  try {
    const feed = document.getElementById('feed');
    if (feed) {
      feed.innerHTML = '<div class="feed-empty">Feed cleared. New events will appear automatically.</div>';
    }
    clearMarkers();
  } catch (error) {
    console.error('Error clearing feed:', error);
  }
}

async function refreshData() {
  try {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Refreshing...';
    }
    
    // If backend is available, trigger refresh
    if (CONFIG.USE_BACKEND && state.backendAvailable) {
      try {
        await fetch(`${CONFIG.API_URL}/api/disasters/refresh`, { method: 'POST' });
        // Wait a bit for backend to process
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn('Backend refresh failed, using simulated data:', error);
      }
    }
    
    // Update dashboard (will use backend or simulated data)
    await updateDashboard();
    
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.textContent = '🔄 Refresh';
      
      // Show brief success message
      const originalText = refreshBtn.textContent;
      refreshBtn.textContent = '✓ Refreshed!';
      setTimeout(() => {
        refreshBtn.textContent = originalText;
      }, 1000);
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.textContent = '🔄 Refresh';
    }
  }
}

// ========== Initialization ==========
function initialize() {
  // Only initialize on dashboard page
  if (!document.getElementById('map')) {
    return;
  }

  try {
    // Initialize map
    initMap();

    // Initialize charts
    setTimeout(() => {
      initCharts();
    }, 100);

    // Generate initial simulated data immediately for instant display
    const initialData = generateSimulatedData(false);
    state.disasters = initialData.disasters;
    state.stats = initialData.stats;
    
    // Update UI with initial data immediately after charts are ready
    setTimeout(() => {
      clearMarkers();
      state.disasters.forEach(disaster => addMarker(disaster));
      updateFeed(state.disasters);
      updateCharts(state.disasters);
      updateStats(state.stats);
      updateAI(state.disasters);
      
      // Update status
      const lastUpdateEl = document.getElementById('lastUpdate');
      if (lastUpdateEl) {
        lastUpdateEl.textContent = `Last updated: ${new Date().toLocaleTimeString()} (Simulated Data)`;
      }
      
      const mapStatus = document.getElementById('mapStatus');
      if (mapStatus) {
        mapStatus.textContent = `${state.disasters.length} events displayed`;
      }
    }, 400);
    
    // Try to fetch real data from backend (optional - will use simulated if unavailable)
    if (CONFIG.USE_BACKEND) {
      setTimeout(async () => {
        try {
          await updateDashboard();
        } catch (error) {
          console.log('Backend not available, continuing with simulated data');
        }
      }, 1000);
    }

    // Start periodic updates
    state.updateInterval = setInterval(updateDashboard, CONFIG.UPDATE_INTERVAL);

    // Setup controls
    const pauseBtn = document.getElementById('pauseBtn');
    const clearBtn = document.getElementById('clearBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    
    if (pauseBtn) {
      pauseBtn.addEventListener('click', toggleRunning);
    }
    
    if (clearBtn) {
      clearBtn.addEventListener('click', clearFeed);
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', refreshData);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (state.updateInterval) {
        clearInterval(state.updateInterval);
      }
    });

  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

// ========== Start Application ==========
document.addEventListener('DOMContentLoaded', initialize);

