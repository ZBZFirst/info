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
  maxVisiblePoints: 5000, // Max points to show on charts
  wrapAround: true, // Don't loop playback
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
// ENHANCED DEBUGGING SYSTEM
// ======================
const debug = {
  log: [],
  maxLogEntries: 100,
  add: function(message, data = null) {
    const entry = {
      timestamp: performance.now(),
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null // Deep clone
    };
    this.log.unshift(entry); // Add to beginning
    if (this.log.length > this.maxLogEntries) this.log.pop();
    
    // Immediate console output
    console.groupCollapsed(`DEBUG: ${message}`);
    console.log('Timestamp:', entry.timestamp);
    if (data) console.log('Data:', data);
    console.groupEnd();
    
    this.updateDebugUI();
  },
  updateDebugUI: function() {
    const debugOutput = document.getElementById('debug-output') || 
                       this.createDebugOutput();
    debugOutput.innerHTML = this.log.map(entry => 
      `<div class="debug-entry">
        <span class="debug-time">${entry.timestamp.toFixed(2)}ms</span>
        <span class="debug-msg">${entry.message}</span>
        ${entry.data ? `<pre>${JSON.stringify(entry.data, null, 2)}</pre>` : ''}
      </div>`
    ).join('');
  },
  createDebugOutput: function() {
    const div = document.createElement('div');
    div.id = 'debug-output';
    div.style.position = 'fixed';
    div.style.bottom = '0';
    div.style.right = '0';
    div.style.width = '400px';
    div.style.height = '300px';
    div.style.overflow = 'auto';
    div.style.background = 'rgba(0,0,0,0.8)';
    div.style.color = '#0f0';
    div.style.padding = '10px';
    div.style.zIndex = '9999';
    document.body.appendChild(div);
    return div;
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

function updateVisualizations(currentIndex) {
  if (!appState.dataset || appState.dataset.length === 0) return;

  // Calculate visible window (last 5000 points or available points)
  const startIdx = Math.max(0, currentIndex - config.maxDataPoints + 1);
  const visibleData = appState.dataset.slice(startIdx, currentIndex + 1);

  // Update Overview Chart (all metrics)
  config.valueColumns.forEach(metric => {
    const datasetIndex = appState.charts.overview.data.datasets
      .findIndex(d => d.label === metric);
      
    if (datasetIndex >= 0) {
      appState.charts.overview.data.datasets[datasetIndex].data = 
        visibleData.map(d => ({
          x: d.timestamp,
          y: d[metric]
        }));
    }
  });

  // Update Flow Chart
  appState.charts.flow.data.datasets[0].data = visibleData.map(d => ({
    x: d.timestamp,
    y: d.flow
  }));

  // Update Pressure Chart
  appState.charts.pressure.data.datasets[0].data = visibleData.map(d => ({
    x: d.timestamp,
    y: d.pressure
  }));

  // Update Volume Chart
  appState.charts.volume.data.datasets[0].data = visibleData.map(d => ({
    x: d.timestamp,
    y: d.volume
  }));

  // Batch update all charts
  appState.charts.overview.update('none');
  appState.charts.flow.update('none');
  appState.charts.pressure.update('none');
  appState.charts.volume.update('none');

  // Debug output
  if (config.debug) {
    console.log(`Updated charts to index ${currentIndex}`, {
      visiblePoints: visibleData.length,
      timeRange: {
        start: visibleData[0].timestamp,
        end: visibleData[visibleData.length-1].timestamp
      }
    });
  }
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

function processRows(count) {
  const newIndex = appState.playback.currentIndex + 
                  (count * appState.playback.direction);

  // Clamp to valid range
  appState.playback.currentIndex = Math.max(0, 
    Math.min(newIndex, appState.dataset.length - 1));

  // Update table with current point
  updateDataTable(appState.dataset[appState.playback.currentIndex]);

  // Update visualizations
  updateVisualizations(appState.playback.currentIndex);
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
  debug.add('Direction toggle initiated', {
    currentState: {
      index: appState.playback.currentIndex,
      direction: appState.playback.direction,
      active: appState.playback.active,
      speed: appState.playback.speed
    },
    datasetInfo: {
      length: appState.dataset.length,
      currentData: appState.dataset[appState.playback.currentIndex]
    }
  });

  const prevDirection = appState.playback.direction;
  
  // Toggle direction
  appState.playback.direction *= -1;
  debug.add(`Direction changed from ${prevDirection} to ${appState.playback.direction}`);

  // Reset timing
  const now = performance.now();
  appState.playback.lastUpdateTime = now;
  debug.add('Timing reset', { lastUpdateTime: now });

  // UI update
  const reverseBtn = document.getElementById('reverseBtn');
  reverseBtn.textContent = appState.playback.direction > 0 ? '⏪ Reverse' : '⏩ Forward';
  debug.add('UI button updated', { buttonText: reverseBtn.textContent });

  // Boundary check
  if (prevDirection > 0 && appState.playback.currentIndex === 0) {
    appState.playback.direction = 1;
    debug.add('Boundary protection: Prevented reverse at start', {
      action: 'Reset direction to forward',
      index: appState.playback.currentIndex
    });
    return;
  }

  // Immediate processing debug
  debug.add('Starting immediate reverse processing', {
    targetRows: 1,
    currentIndexBefore: appState.playback.currentIndex
  });
  
  processRows(1, true); // Pass true for debug mode
  
  debug.add('Immediate processing completed', {
    currentIndexAfter: appState.playback.currentIndex,
    chartDataSizes: {
      timeSeries: appState.chartData.timeSeries.length,
      pvPoints: appState.chartData.pvPoints.length,
      fvPoints: appState.chartData.fvPoints.length
    }
  });
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
