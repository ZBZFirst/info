import { CHART_CONFIGS } from './chartConfig.js';

// ======================
// CORE CONFIGURATION
// ======================
const config = {
  timeColumn: "timestamp",
  valueColumns: ["flow", "pressure", "phase", "volume"],
  playbackRates: {
    min: 0.1,    // 10x slower
    normal: 1.0, // Real-time (1ms/row)
    max: 100.0   // 100x faster
  },
  dataFiles: ["js/data.xlsx"],
  targetRowsPerSecond: 1000, // Base iteration rate
  maxDataPoints: 5000 // For performance optimization
};

// ======================
// APPLICATION STATE
// ======================
const appState = {
  dataset: null,
  playback: {
    active: false,
    currentIndex: 0,
    speed: config.playbackRates.normal,
    direction: 1,
    lastUpdateTime: 0,
    rowsProcessed: 0,
    rowsPerSecond: 0
  },
  metrics: {
    startTime: 0,
    totalRows: 0
  },
  charts: {
    overview: null,
    flow: null,
    pressure: null,
    volume: null,
    pvLoop: null,
    fvLoop: null
  },
  chartData: {
    timeSeries: [],
    pvPoints: [],
    fvPoints: []
  }
};

// ======================
// CHART MANAGEMENT
// ======================
function initializeCharts() {
  // Initialize all charts with their configurations
  appState.charts.overview = new Chart(
    document.getElementById('timeSeriesChart').getContext('2d'),
    CHART_CONFIGS.overview
  );
  
  appState.charts.flow = new Chart(
    document.getElementById('timeSeriesChartFlow').getContext('2d'),
    CHART_CONFIGS.flow
  );
  
  appState.charts.pressure = new Chart(
    document.getElementById('timeSeriesChartPressure').getContext('2d'),
    CHART_CONFIGS.pressure
  );
  
  appState.charts.volume = new Chart(
    document.getElementById('timeSeriesChartVolume').getContext('2d'),
    CHART_CONFIGS.volume
  );
  
  appState.charts.pvLoop = new Chart(
    document.getElementById('PVLoop').getContext('2d'),
    CHART_CONFIGS.pvLoop
  );
  
  appState.charts.fvLoop = new Chart(
    document.getElementById('FVLoop').getContext('2d'),
    CHART_CONFIGS.fvLoop
  );
  
  console.log("All charts initialized");
}

function updateVisualizations(currentData) {
  if (!currentData) return;

  // Helper to maintain single point per x-value
  const updateDataBuffer = (buffer, xValue, newPoint) => {
    const filtered = buffer.filter(point => point.x !== xValue);
    filtered.push(newPoint);
    return filtered;
  };

  // Update time series
  appState.chartData.timeSeries = updateDataBuffer(
    appState.chartData.timeSeries,
    currentData.timestamp,
    {
      x: currentData.timestamp,
      flow: currentData.flow,
      pressure: currentData.pressure,
      volume: currentData.volume
    }
  );

  // Update PV loop
  appState.chartData.pvPoints = updateDataBuffer(
    appState.chartData.pvPoints,
    currentData.volume,
    { x: currentData.volume, y: currentData.pressure }
  );

  // Update FV loop
  appState.chartData.fvPoints = updateDataBuffer(
    appState.chartData.fvPoints,
    currentData.volume,
    { x: currentData.volume, y: currentData.flow }
  );

  // Update charts
  updateTimeSeriesCharts();
  updateLoopCharts();
}

function updateTimeSeriesCharts() {
  // Update overview chart (all metrics)
  config.valueColumns.forEach(metric => {
    const datasetIndex = CHART_CONFIGS.overview.data.datasets.findIndex(d => d.label === metric);
    if (datasetIndex >= 0) {
      appState.charts.overview.data.datasets[datasetIndex].data = 
        appState.chartData.timeSeries.map(point => ({
          x: point.x,
          y: point[metric]
        }));
    }
  });
  appState.charts.overview.update();
  
  // Update individual charts
  appState.charts.flow.data.datasets[0].data = 
    appState.chartData.timeSeries.map(point => ({ x: point.x, y: point.flow }));
  appState.charts.flow.update();
  
  appState.charts.pressure.data.datasets[0].data = 
    appState.chartData.timeSeries.map(point => ({ x: point.x, y: point.pressure }));
  appState.charts.pressure.update();
  
  appState.charts.volume.data.datasets[0].data = 
    appState.chartData.timeSeries.map(point => ({ x: point.x, y: point.volume }));
  appState.charts.volume.update();
}

function updateLoopCharts() {
  // Update PV Loop
  appState.charts.pvLoop.data.datasets[0].data = appState.chartData.pvPoints;
  appState.charts.pvLoop.update();
  
  // Update FV Loop
  appState.charts.fvLoop.data.datasets[0].data = appState.chartData.fvPoints;
  appState.charts.fvLoop.update();
}



// ======================
// DATA LOADING & PROCESSING
// ======================
async function loadAndProcessData() {
  try {
    console.log(`Loading data from ${config.dataFiles[0]}...`);
    const response = await fetch(config.dataFiles[0]);
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    appState.dataset = jsonData.map((record, idx) => ({
      ...record,
      index: idx,
      timestamp: record[config.timeColumn]
    }));
    
    appState.metrics.totalRows = appState.dataset.length;
    console.log(`Loaded ${appState.metrics.totalRows} records`);
    
    return true;
  } catch (error) {
    console.error("Data loading failed:", error);
    return false;
  }
}

// ======================
// MODIFIED PLAYBACK LOOP
// ======================
function playbackLoop(currentTime) {
  if (!appState.playback.active) {
    console.log("Playback stopped - exiting animation frame loop");
    return;
  }
  
  const delta = currentTime - appState.playback.lastUpdateTime;
  
  if (delta > 0) {
    // Calculate virtual time progression based on speed and direction
    const virtualDelta = delta * appState.playback.speed * appState.playback.direction;
    
    // Calculate how many rows to process based on target rate
    const targetRows = Math.floor((virtualDelta * config.targetRowsPerSecond) / 1000);
    
    if (targetRows !== 0) {
      processRows(targetRows);
      
      // Update metrics
      appState.playback.rowsProcessed += Math.abs(targetRows);
      const elapsed = (currentTime - appState.metrics.startTime) / 1000;
      appState.playback.rowsPerSecond = Math.floor(appState.playback.rowsProcessed / elapsed);
      
      updateDebugInfo();
    }
  }
  
  appState.playback.lastUpdateTime = currentTime;
  requestAnimationFrame(playbackLoop);
}

function removePointFromCharts(dataPoint) {
  // Remove from time series
  appState.chartData.timeSeries = appState.chartData.timeSeries.filter(
    point => point.x !== dataPoint.timestamp
  );

  // Remove from PV loop
  appState.chartData.pvPoints = appState.chartData.pvPoints.filter(
    point => point.x !== dataPoint.volume
  );

  // Remove from FV loop
  appState.chartData.fvPoints = appState.chartData.fvPoints.filter(
    point => point.x !== dataPoint.volume
  );

  // Update charts immediately
  updateTimeSeriesCharts();
  updateLoopCharts();
}

// ======================
// UPDATED ROW PROCESSING
// ======================
function processRows(count) {
  if (!appState.dataset || appState.dataset.length === 0) return;

  let newIndex = appState.playback.currentIndex;
  let shouldResetCharts = false;
  let processedCount = 0;

  while (processedCount < count) {
    newIndex += appState.playback.direction;
    processedCount++;

    // Handle forward direction
    if (appState.playback.direction > 0) {
      if (newIndex >= appState.dataset.length) {
        newIndex = 0;
        shouldResetCharts = true;
        break; // Reset after this point
      }
    } 
    // Handle reverse direction
    else {
      if (newIndex < 0) {
        newIndex = 0;
        break; // Stop at beginning
      }
      
      // Remove the point we're moving away from when rewinding
      const prevIndex = newIndex + 1; // +1 because we already decremented
      if (prevIndex < appState.dataset.length) {
        removePointFromCharts(appState.dataset[prevIndex]);
      }
    }
  }

  // Ensure index stays within bounds
  newIndex = Math.max(0, Math.min(newIndex, appState.dataset.length - 1));
  appState.playback.currentIndex = newIndex;

  if (shouldResetCharts) {
    resetAllCharts();
  }

  updateDataTable(appState.dataset[newIndex]);
  updateVisualizations(appState.dataset[newIndex]);
}


function resetAllCharts() {
  // Clear all data buffers
  appState.chartData = {
    timeSeries: [],
    pvPoints: [],
    fvPoints: []
  };

  // Reset all chart datasets
  Object.values(appState.charts).forEach(chart => {
    chart.data.datasets.forEach(dataset => {
      dataset.data = [];
    });
    chart.update();
  });

  console.log("Charts reset for new playback cycle");
}

function updateDebugInfo() {
  const debugInfo = `
    Current Index: ${appState.playback.currentIndex}
    Playback Speed: ${appState.playback.speed}x
    Rows Processed: ${appState.playback.rowsProcessed}
    Current Rows/Sec: ${appState.playback.rowsPerSecond}
    Direction: ${appState.playback.direction > 0 ? 'Forward' : 'Reverse'}
  `;
  
  // Update debug display or console
  const debugElement = document.getElementById('debug-info') || createDebugElement();
  debugElement.textContent = debugInfo;
}

function createDebugElement() {
  const element = document.createElement('pre');
  element.id = 'debug-info';
  element.style.position = 'fixed';
  element.style.bottom = '10px';
  element.style.right = '10px';
  element.style.background = 'rgba(0,0,0,0.7)';
  element.style.color = 'white';
  element.style.padding = '10px';
  element.style.borderRadius = '5px';
  element.style.zIndex = '1000';
  document.body.appendChild(element);
  return element;
}

// ======================
// TABLE MANAGEMENT
// ======================
function initializeDataTable() {
  const tableHeader = document.getElementById('tableHeader');
  const tableBody = document.getElementById('tableBody');
  
  // Clear any existing content
  tableHeader.innerHTML = '';
  tableBody.innerHTML = '';
  
  // Create header row
  const headers = ['Index', 'Timestamp', ...config.valueColumns];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    tableHeader.appendChild(th);
  });
  
  console.log("Data table initialized with columns:", headers);
}

function updateDataTable(currentData) {
  const tableBody = document.getElementById('tableBody');
  
  // Clear previous row (or keep for history if you prefer)
  tableBody.innerHTML = '';
  
  // Create new row
  const row = document.createElement('tr');
  
  // Add cells in the same order as the header
  const cells = [
    currentData.index,
    currentData.timestamp,
    ...config.valueColumns.map(col => currentData[col])
  ];
  
  cells.forEach(cellValue => {
    const td = document.createElement('td');
    td.textContent = typeof cellValue === 'number' ? cellValue.toFixed(2) : cellValue;
    row.appendChild(td);
  });
  
  tableBody.appendChild(row);
  
  // Optional: Scroll to show the new row
  tableBody.parentElement.scrollTop = tableBody.parentElement.scrollHeight;
}


// ======================
// PLAYBACK ENGINE
// ======================
function startPlayback() {
  if (appState.playback.active) return;
  
  appState.playback.active = true;
  appState.metrics.startTime = performance.now();
  appState.playback.lastUpdateTime = performance.now();
  
  function playbackLoop(currentTime) {
    if (!appState.playback.active) {
      console.log("Playback stopped - exiting animation frame loop");
      return;
    }
    
    const delta = currentTime - appState.playback.lastUpdateTime;
    
    if (delta > 0) {
      // Calculate virtual time progression based on speed (ignore direction here)
      const virtualDelta = delta * appState.playback.speed;
      
      // Calculate how many rows to process
      const targetRows = Math.floor((virtualDelta * config.targetRowsPerSecond) / 1000);
      
      if (targetRows > 0) {
        processRows(targetRows);
        
        // Update metrics
        appState.playback.rowsProcessed += targetRows;
        const elapsed = (currentTime - appState.metrics.startTime) / 1000;
        appState.playback.rowsPerSecond = Math.floor(appState.playback.rowsProcessed / elapsed);
        
        updateDebugInfo();
      }
    }
    
    appState.playback.lastUpdateTime = currentTime;
    requestAnimationFrame(playbackLoop);
  }
  
  requestAnimationFrame(playbackLoop);
}

// ======================
// UPDATED PLAYBACK CONTROLS
// ======================
function setPlaybackSpeed(speed) {
  appState.playback.speed = speed;
  console.log(`Playback speed set to ${speed}x`);
}

function toggleDirection() {
  // Store previous direction
  const prevDirection = appState.playback.direction;
  
  // Toggle direction
  appState.playback.direction *= -1;
  
  // Reset timing to prevent jumps
  appState.playback.lastUpdateTime = performance.now();
  
  // Update UI
  const reverseBtn = document.getElementById('reverseBtn');
  reverseBtn.textContent = appState.playback.direction > 0 ? '⏪ Reverse' : '⏩ Forward';
  
  // If we were at index 0 and trying to reverse, do nothing
  if (prevDirection > 0 && appState.playback.currentIndex === 0) {
    appState.playback.direction = 1; // Keep forward direction
    console.log("Already at beginning - cannot reverse");
    return;
  }
  
  console.log(`Direction changed to ${appState.playback.direction > 0 ? 'Forward' : 'Reverse'}`);
}

function stopPlayback() {
  appState.playback.active = false;
  console.log("Playback stopped");
}

// ======================
// MODIFIED INITIALIZATION
// ======================
async function initialize() {
  const success = await loadAndProcessData();
  if (success) {
    initializeDataTable();
    initializeCharts(); // Initialize charts before setting up controls
    setupControls();
    updateDebugInfo();
    updateDataTable(appState.dataset[0]);
    
    // Initialize with first data point
    updateVisualizations(appState.dataset[0]);
    
    console.log("System ready - all visualizations initialized");
  }
}

// ======================
// CONTROL FUNCTIONS
// ======================
function setupControls() {
  // Get all control buttons
  const playBtn = document.getElementById('playBtn');
  const stopBtn = document.getElementById('stopBtn');
  const slowBtn = document.getElementById('slowBtn');
  const fastBtn = document.getElementById('fastBtn');
  const reverseBtn = document.getElementById('reverseBtn');
  const speedDisplay = document.getElementById('speedDisplay');

  // Play/Pause toggle functionality
  playBtn.addEventListener('click', () => {
    if (appState.playback.active) {
      stopPlayback();
      playBtn.textContent = '▶ Play';
    } else {
      startPlayback();
      playBtn.textContent = '⏸ Pause';
    }
  });

  // Stop button
  stopBtn.addEventListener('click', () => {
    stopPlayback();
    playBtn.textContent = '▶ Play';
  });

  // Speed controls
  slowBtn.addEventListener('click', () => {
    const newSpeed = Math.max(config.playbackRates.min, appState.playback.speed / 2);
    setPlaybackSpeed(newSpeed);
    updateSpeedDisplay();
  });

  fastBtn.addEventListener('click', () => {
    const newSpeed = Math.min(config.playbackRates.max, appState.playback.speed * 2);
    setPlaybackSpeed(newSpeed);
    updateSpeedDisplay();
  });

  // Reverse toggle
  reverseBtn.addEventListener('click', () => {
    toggleDirection();
    reverseBtn.textContent = appState.playback.direction > 0 ? '⏪ Reverse' : '⏩ Forward';
  });

  // Update speed display
  function updateSpeedDisplay() {
    speedDisplay.textContent = `${appState.playback.speed.toFixed(1)}x`;
  }

  // Initialize display
  updateSpeedDisplay();
}

// Start the application
document.addEventListener('DOMContentLoaded', initialize);
