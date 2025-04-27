// ======================
// CORE CONFIGURATION
// ======================
const config = {
  maxDataPoints: 4000,
  timeColumn: "timestamp",
  valueColumns: ["flow", "pressure", "phase", "volume"],
  playbackRates: {
    min: 0.1,    // 10x slower
    normal: 1.0, // Real-time (1ms/row)
    max: 100.0   // 100x faster
  },
  dataFiles: ["data.xlsx"]
};

// ======================
// APPLICATION STATE
// ======================
const appState = {
  dataset: null,
  breathData: {
    pv: [],
    fv: []
  },
  playback: {
    active: false,
    currentIndex: 0,
    speed: config.playbackRates.normal,
    direction: 1
  },
  ui: {
    lastRenderTime: 0,
    renderInterval: 1000 / 30 // Target 30fps
  }
};

// ======================
// CORE INITIALIZATION
// ======================
async function initializeApplication() {
  try {
    // Phase 1: Setup visual components
    initializeAllCharts();
    
    // Phase 2: Load and prepare static data
    const fileUrl = await locateDataFile();
    const rawData = await loadExcelData(fileUrl);
    
    // Phase 3: Process data in single pass
    appState.dataset = preprocessDataset(rawData);
    appState.breathData = extractBreathPatterns(rawData);
    
    // Phase 4: Enable controls
    setupControlHandlers();
    updateStatusDisplay();
    
  } catch (error) {
    handleInitializationError(error);
  }
}

// ======================
// DATA PROCESSING
// ======================
function preprocessDataset(rawData) {
  return rawData.map((record, idx) => ({
    ...record,
    indexer: idx,
    displayTime: record[config.timeColumn]
  }));
}

function extractBreathPatterns(data) {
  const patterns = { pv: [], fv: [] };
  let currentBreath = [];
  let breathing = false;

  data.forEach(record => {
    if (record.phase === 1 && !breathing) {
      // Breath start detected
      if (currentBreath.length >= 10) {
        commitBreathSegment(patterns, currentBreath);
      }
      currentBreath = [];
      breathing = true;
    }

    if (breathing) {
      currentBreath.push(record);
      if (record.phase === 0) breathing = false;
    }
  });

  return patterns;
}

function commitBreathSegment(target, breathData) {
  target.pv.push({
    points: breathData.map(d => ({ x: d.volume, y: d.pressure }))
  });
  target.fv.push({
    points: breathData.map(d => ({ x: d.flow, y: d.volume }))
  });
  
  // Maintain fixed-size buffer
  if (target.pv.length > 3) target.pv.shift();
  if (target.fv.length > 3) target.fv.shift();
}

// ======================
// PLAYBACK ENGINE
// ======================
function startPlayback() {
  if (appState.playback.active) return;
  
  appState.playback.active = true;
  appState.ui.lastRenderTime = performance.now();
  
  const playbackFrame = (timestamp) => {
    if (!appState.playback.active) return;
    
    // Calculate virtual time progression
    const delta = timestamp - appState.ui.lastRenderTime;
    const virtualDelta = delta * appState.playback.speed * appState.playback.direction;
    
    appState.playback.currentIndex = Math.floor(
      (appState.playback.currentIndex + virtualDelta) % appState.dataset.length
    );
    
    // Throttled rendering
    if (delta >= appState.ui.renderInterval) {
      renderCurrentFrame();
      appState.ui.lastRenderTime = timestamp;
    }
    
    requestAnimationFrame(playbackFrame);
  };
  
  requestAnimationFrame(playbackFrame);
}

function renderCurrentFrame() {
  const currentData = appState.dataset[appState.playback.currentIndex];
  
  // Update all visual components
  updateTimeSeriesCharts(currentData);
  updateLoopVisualizations();
  updateDataTable(currentData);
}

// ======================
// CHART MANAGEMENT
// ======================
function initializeAllCharts() {
  // Time-series charts
  config.valueColumns.forEach(param => {
    createTimeSeriesChart(`chart-${param}`, {
      minY: getParameterRange(param).min,
      maxY: getParameterRange(param).max
    });
  });
  
  // Loop charts
  createLoopChart('pv-loop', 'Pressure-Volume');
  createLoopChart('fv-loop', 'Flow-Volume');
}

function updateTimeSeriesCharts(dataPoint) {
  config.valueColumns.forEach(param => {
    const chart = getChartInstance(`chart-${param}`);
    addDataPoint(chart, dataPoint.indexer, dataPoint[param]);
  });
}

// ======================
// UTILITIES
// ======================
function getParameterRange(param) {
  const ranges = {
    flow: { min: -100, max: 100 },
    pressure: { min: 0, max: 50 },
    volume: { min: 0, max: 1000 }
  };
  return ranges[param] || { min: 0, max: 100 };
}

// ======================
// INITIALIZATION
// ======================
document.addEventListener('DOMContentLoaded', initializeApplication);
