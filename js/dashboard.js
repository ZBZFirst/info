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

console.log("Configuration loaded:", config);

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

console.log("Application state initialized:", appState);

// ======================
// CORE INITIALIZATION
// ======================
async function initializeApplication() {
  console.log("Starting application initialization...");
  
  try {
    // Phase 1: Setup visual components
    console.log("Initializing charts...");
    initializeAllCharts();
    
    // Phase 2: Load and prepare static data
    console.log("Loading Excel data...");
    const rawData = await loadExcelData(config.dataFiles[0]);
    console.log(`Loaded ${rawData.length} records from Excel file`);
    
    // Phase 3: Process data in single pass
    console.log("Preprocessing dataset...");
    appState.dataset = preprocessDataset(rawData);
    console.log(`Dataset preprocessed with ${appState.dataset.length} records`);
    
    console.log("Extracting breath patterns...");
    appState.breathData = extractBreathPatterns(rawData);
    console.log(`Extracted ${appState.breathData.pv.length} PV loops and ${appState.breathData.fv.length} FV loops`);
    
    // Phase 4: Enable controls
    console.log("Setting up control handlers...");
    setupControlHandlers();
    
    console.log("Updating status display...");
    updateStatusDisplay();
    
    console.log("Application initialization complete!");
    
    // Initial render of first data point
    renderCurrentFrame();
    
  } catch (error) {
    console.error("Initialization failed:", error);
    handleInitializationError(error);
  }
}

// ======================
// DATA LOADING
// ======================
async function loadExcelData(filePath) {
  console.log(`Loading Excel data from ${filePath}...`);
  
  try {
    // Using SheetJS (xlsx) library to parse Excel file
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Get first worksheet
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Successfully parsed ${jsonData.length} records`);
    
    return jsonData;
  } catch (error) {
    console.error("Failed to load Excel data:", error);
    throw error;
  }
}

// ======================
// DATA PROCESSING (keep existing implementations)
// ======================
function preprocessDataset(rawData) {
  console.log(`Preprocessing ${rawData.length} records...`);
  const startTime = performance.now();
  
  const result = rawData.map((record, idx) => ({
    ...record,
    indexer: idx,
    displayTime: record[config.timeColumn]
  }));
  
  const duration = performance.now() - startTime;
  console.log(`Preprocessing completed in ${duration.toFixed(2)}ms`);
  return result;
}

function extractBreathPatterns(data) {
  console.log("Extracting breath patterns from data...");
  const patterns = { pv: [], fv: [] };
  let currentBreath = [];
  let breathing = false;
  let breathCount = 0;

  data.forEach(record => {
    if (record.phase === 1 && !breathing) {
      // Breath start detected
      if (currentBreath.length >= 10) {
        breathCount++;
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

  console.log(`Detected ${breathCount} complete breath cycles`);
  return patterns;
}

function commitBreathSegment(target, breathData) {
  const breathId = target.pv.length + 1;
  console.log(`Processing breath segment #${breathId} with ${breathData.length} data points`);
  
  target.pv.push({
    points: breathData.map(d => ({ x: d.volume, y: d.pressure }))
  });
  target.fv.push({
    points: breathData.map(d => ({ x: d.flow, y: d.volume }))
  });
  
  // Maintain fixed-size buffer
  if (target.pv.length > 3) {
    console.log("PV buffer full - removing oldest segment");
    target.pv.shift();
  }
  if (target.fv.length > 3) {
    console.log("FV buffer full - removing oldest segment");
    target.fv.shift();
  }
}

// ======================
// PLAYBACK ENGINE (keep existing implementation)
// ======================
function startPlayback() {
  if (appState.playback.active) {
    console.log("Playback already active - ignoring start request");
    return;
  }
  
  console.log(`Starting playback at index ${appState.playback.currentIndex}, speed ${appState.playback.speed}x`);
  appState.playback.active = true;
  appState.ui.lastRenderTime = performance.now();
  
  const playbackFrame = (timestamp) => {
    if (!appState.playback.active) {
      console.log("Playback stopped - exiting animation frame loop");
      return;
    }
    
    // Calculate virtual time progression
    const delta = timestamp - appState.ui.lastRenderTime;
    const virtualDelta = delta * appState.playback.speed * appState.playback.direction;
    
    const prevIndex = appState.playback.currentIndex;
    appState.playback.currentIndex = Math.floor(
      (appState.playback.currentIndex + virtualDelta) % appState.dataset.length
    );
    
    if (prevIndex !== appState.playback.currentIndex) {
      console.debug(`Playback index updated from ${prevIndex} to ${appState.playback.currentIndex}`);
    }
    
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
  console.debug(`Rendering frame at index ${appState.playback.currentIndex}`, currentData);
  
  // Update all visual components
  updateTimeSeriesCharts(currentData);
  updateLoopVisualizations();
  updateDataTable(currentData);
}

// ======================
// CHART MANAGEMENT (keep existing implementation)
// ======================
function initializeAllCharts() {
  console.log("Initializing all chart components...");
  
  // Time-series charts
  config.valueColumns.forEach(param => {
    console.log(`Creating time-series chart for ${param}`);
    createTimeSeriesChart(`chart-${param}`, {
      minY: getParameterRange(param).min,
      maxY: getParameterRange(param).max
    });
  });
  
  // Loop charts
  console.log("Creating loop visualization charts");
  createLoopChart('pv-loop', 'Pressure-Volume');
  createLoopChart('fv-loop', 'Flow-Volume');
}

function updateTimeSeriesCharts(dataPoint) {
  config.valueColumns.forEach(param => {
    const chart = getChartInstance(`chart-${param}`);
    if (!chart) {
      console.warn(`Chart instance not found for parameter: ${param}`);
      return;
    }
    console.debug(`Updating ${param} chart with value: ${dataPoint[param]}`);
    addDataPoint(chart, dataPoint.indexer, dataPoint[param]);
  });
}

// ======================
// UTILITIES (keep existing implementation)
// ======================
function getParameterRange(param) {
  const ranges = {
    flow: { min: -100, max: 100 },
    pressure: { min: 0, max: 50 },
    volume: { min: 0, max: 1000 }
  };
  const range = ranges[param] || { min: 0, max: 100 };
  console.debug(`Range for ${param}: ${range.min} to ${range.max}`);
  return range;
}

// ======================
// INITIALIZATION
// ======================
console.log("Setting up DOM content loaded listener...");
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded - starting application");
  initializeApplication();
});

// Error handling
function handleInitializationError(error) {
  console.error("Initialization error:", error);
  // Display error to user
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = `Failed to initialize application: ${error.message}`;
  document.body.prepend(errorElement);
}

// Control handlers (minimal implementation)
function setupControlHandlers() {
  console.log("Setting up control handlers");
  
  document.getElementById('play-btn').addEventListener('click', () => {
    console.log("Play button clicked");
    startPlayback();
  });
  
  document.getElementById('pause-btn').addEventListener('click', () => {
    console.log("Pause button clicked");
    appState.playback.active = false;
  });
  
  document.getElementById('speed-control').addEventListener('change', (e) => {
    const newSpeed = parseFloat(e.target.value);
    console.log(`Speed changed to ${newSpeed}x`);
    appState.playback.speed = newSpeed;
  });
}
