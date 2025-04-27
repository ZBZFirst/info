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
  targetRowsPerSecond: 1000 // Base iteration rate
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
  }
};

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
  
  // Calculate time delta since last update
  const delta = currentTime - appState.playback.lastUpdateTime;
  
  // Only process if we have meaningful time elapsed
  if (delta > 0) {
    // Calculate virtual time progression based on speed and direction
    const virtualDelta = delta * appState.playback.speed * appState.playback.direction;
    
    // Calculate how many rows to process based on target rate
    const targetRows = Math.floor((virtualDelta * config.targetRowsPerSecond) / 1000);
    
    if (targetRows !== 0) {
      // Process the calculated number of rows (can be negative for reverse playback)
      processRows(targetRows);
      
      // Update metrics
      appState.playback.rowsProcessed += Math.abs(targetRows);
      const elapsed = (currentTime - appState.metrics.startTime) / 1000;
      appState.playback.rowsPerSecond = Math.floor(appState.playback.rowsProcessed / elapsed);
      
      // Update debug display
      updateDebugInfo();
    }
  }
  
  appState.playback.lastUpdateTime = currentTime;
  requestAnimationFrame(playbackLoop);
}

// ======================
// UPDATED ROW PROCESSING
// ======================
function processRows(count) {
  const newIndex = appState.playback.currentIndex + count;
  
  // Handle bounds checking differently for forward and reverse
  if (count > 0) {
    // Forward playback
    if (newIndex >= appState.dataset.length) {
      appState.playback.currentIndex = 0;
      console.log("Reached end of dataset - looping back to start");
    } else {
      appState.playback.currentIndex = newIndex;
    }
  } else {
    // Reverse playback
    if (newIndex < 0) {
      appState.playback.currentIndex = appState.dataset.length - 1;
      console.log("Reached start of dataset - looping to end");
    } else {
      appState.playback.currentIndex = newIndex;
    }
  }
  
  // Get current data point
  const currentData = appState.dataset[appState.playback.currentIndex];
  
  // Update the table
  updateDataTable(currentData);
  
  // Optional: Update visualizations if they exist
  try {
    if (typeof updateVisualizations === 'function') {
      updateVisualizations(currentData);
    }
  } catch (error) {
    console.warn("Visualization update failed:", error);
  }
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
// CONTROL FUNCTIONS
// ======================
function setPlaybackSpeed(speed) {
  appState.playback.speed = Math.max(config.playbackRates.min, 
                                   Math.min(config.playbackRates.max, speed));
  console.log(`Playback speed set to ${appState.playback.speed}x`);
}

// ======================
// UPDATED PLAYBACK CONTROLS
// ======================
function toggleDirection() {
  // Reverse the direction
  appState.playback.direction *= -1;
  
  // Reset the last update time to prevent large jumps when changing direction
  appState.playback.lastUpdateTime = performance.now();
  
  console.log(`Playback direction changed to ${appState.playback.direction > 0 ? 'forward' : 'reverse'}`);
}

function stopPlayback() {
  appState.playback.active = false;
  console.log("Playback stopped");
}

// ======================
// UPDATED INITIALIZATION
// ======================
async function initialize() {
  const success = await loadAndProcessData();
  if (success) {
    initializeDataTable(); // Initialize table structure
    setupControls();
    updateDebugInfo();
    
    // Show first data point immediately
    updateDataTable(appState.dataset[0]);
    
    console.log("System ready - use startPlayback() to begin");
  }
}

function setupControls() {
  // These would be hooked to actual UI elements
  window.startPlayback = startPlayback;
  window.stopPlayback = stopPlayback;
  window.setPlaybackSpeed = setPlaybackSpeed;
  window.toggleDirection = toggleDirection;
}

// Start the application
document.addEventListener('DOMContentLoaded', initialize);
