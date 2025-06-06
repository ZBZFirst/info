// dashboard.js 4-27-25

import { CHART_CONFIGS } from './chartConfig.js';

// ======================
// CORE CONFIGURATION
// ======================
const config = {timeColumn: "timestamp",valueColumns: ["flow", "pressure", "phase", "volume"],playbackRates: {min: 0.1,normal: 1.0,max: 100.0 },dataFiles: ["js/data.xlsx"],maxVisiblePoints: 5000, wrapAround: true,targetRowsPerSecond: 1000,maxDataPoints: 5000};

// ======================
// APPLICATION STATE
// ======================
const appState = {dataset: null,playback: {
active: false,currentIndex: 0,speed: config.playbackRates.normal,direction: 1,lastUpdateTime: 0,rowsProcessed: 0,rowsPerSecond: 0},metrics: {startTime: 0,totalRows: 0},charts: {overview: null,flow: null,pressure: null,volume: null,pvLoop: null,fvLoop: null},chartData: {timeSeries: [],pvPoints: [],fvPoints: []}};

// ======================
// CHART MANAGEMENT
// ======================
function initializeCharts() {
  appState.charts.overview = new Chart(document.getElementById('timeSeriesChart').getContext('2d'),CHART_CONFIGS.overview);
  appState.charts.flow = new Chart(document.getElementById('timeSeriesChartFlow').getContext('2d'),CHART_CONFIGS.flow);
  appState.charts.pressure = new Chart(document.getElementById('timeSeriesChartPressure').getContext('2d'),CHART_CONFIGS.pressure);
  appState.charts.volume = new Chart(document.getElementById('timeSeriesChartVolume').getContext('2d'),CHART_CONFIGS.volume);
  appState.charts.pvLoop = new Chart(document.getElementById('PVLoop').getContext('2d'),CHART_CONFIGS.pvLoop);
  appState.charts.fvLoop = new Chart(document.getElementById('FVLoop').getContext('2d'),CHART_CONFIGS.fvLoop);
  console.log("All charts initialized");
}

function updateVisualizations(currentIndex) {
  if (!appState.dataset || appState.dataset.length === 0) return;
  const startIdx = Math.max(0, currentIndex - config.maxDataPoints + 1);
  const visibleData = appState.dataset.slice(startIdx, currentIndex + 1);
  config.valueColumns.forEach(metric => {
    const datasetIndex = appState.charts.overview.data.datasets
      .findIndex(d => d.label === metric);
    if (datasetIndex >= 0) {appState.charts.overview.data.datasets[datasetIndex].data = 
        visibleData.map(d => ({x: d.timestamp,y: d[metric]}));}});
  appState.charts.flow.data.datasets[0].data = visibleData.map(d => ({x: d.timestamp,y: d.flow}));
  appState.charts.pressure.data.datasets[0].data = visibleData.map(d => ({x: d.timestamp,y: d.pressure}));
  appState.charts.volume.data.datasets[0].data = visibleData.map(d => ({x: d.timestamp,y: d.volume}));
  appState.charts.overview.update('none');
  appState.charts.flow.update('none');
  appState.charts.pressure.update('none');
  appState.charts.volume.update('none');
  if (config.debug) {console.log(`Updated charts to index ${currentIndex}`, {visiblePoints: visibleData.length,timeRange: {start: visibleData[0].timestamp,end: visibleData[visibleData.length-1].timestamp}});}
}

function updateTimeSeriesCharts() {
  config.valueColumns.forEach(metric => {const datasetIndex = CHART_CONFIGS.overview.data.datasets.findIndex(d => d.label === metric);
    if (datasetIndex >= 0) {appState.charts.overview.data.datasets[datasetIndex].data = appState.chartData.timeSeries.map(point => ({x: point.x,y: point[metric]}));
    }});
  appState.charts.overview.update();
  appState.charts.flow.data.datasets[0].data = appState.chartData.timeSeries.map(point => ({ x: point.x, y: point.flow }));
  appState.charts.flow.update();
  appState.charts.pressure.data.datasets[0].data = appState.chartData.timeSeries.map(point => ({ x: point.x, y: point.pressure }));
  appState.charts.pressure.update();
  appState.charts.volume.data.datasets[0].data = appState.chartData.timeSeries.map(point => ({ x: point.x, y: point.volume }));
  appState.charts.volume.update();
}

// ======================
// BREATH CYCLE TRACKING FOR BOTH LOOPS
// ======================
function updateLoops(currentIndex) {
  if (!appState.dataset || appState.dataset.length === 0) return;
  const currentData = appState.dataset[currentIndex];
  const currentPhase = currentData.phase;
  if (!appState.breathCycles) {appState.breathCycles = {currentPVCycle: [],completedPVCycles: [],currentFVCycle: [],completedFVCycles: [],zeroCount: 0,isInBreath: false};}
  const {currentPVCycle,completedPVCycles,currentFVCycle,completedFVCycles,zeroCount,isInBreath} = appState.breathCycles;
  if (currentPhase >= 1 && !isInBreath) {appState.breathCycles.isInBreath = true;appState.breathCycles.zeroCount = 0;currentPVCycle.length = 0;currentFVCycle.length = 0;} 
  else if (currentPhase <= 0 && isInBreath) {
    appState.breathCycles.zeroCount++;
    if (zeroCount >= 50) {
      appState.breathCycles.isInBreath = false;
      if (currentPVCycle.length > 10) {
        completedPVCycles.push([...currentPVCycle]);
        completedFVCycles.push([...currentFVCycle]);
        if (completedPVCycles.length > 3) {
          completedPVCycles.shift();
          completedFVCycles.shift();
        }}
      currentPVCycle.length = 0;currentFVCycle.length = 0;}}
  if (isInBreath) {currentPVCycle.push({x: currentData.volume,y: currentData.pressure});
    currentFVCycle.push({x: currentData.volume,y: currentData.flow});
  }
  const colors = ['#E15759', '#F28E2B', '#4E79A7']; 
  const prepareLoopData = (completedCycles, currentCycle) => {const datasets = [];    
    completedCycles.slice().reverse().forEach((cycle, index) => {
      if (index < 3) { // Only show last 3 cycles
        datasets.push({data: cycle,borderColor: colors[index],backgroundColor: 'transparent',borderWidth: 2,pointRadius: 0,fill: false,tension: 0});
      }});
    if (isInBreath && currentCycle.length > 0) {
      datasets.push({data: currentCycle,borderColor: colors[0],backgroundColor: 'transparent',borderWidth: 3,pointRadius: 0,fill: false,tension: 0});}
    return datasets;
  };
  appState.charts.pvLoop.data.datasets = prepareLoopData(completedPVCycles, currentPVCycle);
  appState.charts.pvLoop.update('none');
  appState.charts.fvLoop.data.datasets = prepareLoopData(completedFVCycles, currentFVCycle);
  appState.charts.fvLoop.update('none');
  if (config.debug && isInBreath) {console.log('Current Breath Cycle:', {PVPoints: currentPVCycle.length,FVPoints: currentFVCycle.length,Phase: currentPhase});}}

function blendColors(color1, color2, ratio) {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
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
    const virtualDelta = delta * appState.playback.speed * appState.playback.direction;
    const targetRows = Math.floor((virtualDelta * config.targetRowsPerSecond) / 1000);
    if (targetRows !== 0) {
      processRows(targetRows);
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
  appState.chartData.timeSeries = appState.chartData.timeSeries.filter(point => point.x !== dataPoint.timestamp);
  appState.chartData.pvPoints = appState.chartData.pvPoints.filter(point => point.x !== dataPoint.volume);
  appState.chartData.fvPoints = appState.chartData.fvPoints.filter(point => point.x !== dataPoint.volume);
  updateTimeSeriesCharts();
  updateLoopCharts();
}

function processRows(count) {
  let newIndex = appState.playback.currentIndex + (count * appState.playback.direction);
  
  if (appState.playback.direction > 0 && newIndex >= appState.dataset.length) {
    newIndex = 0;
  }
  else if (newIndex < 0) {
    newIndex = 0;
  }

  appState.playback.currentIndex = newIndex;
  updateDataTable(appState.dataset[appState.playback.currentIndex]);
  updateVisualizations(appState.playback.currentIndex);
  updateLoops(appState.playback.currentIndex);
}

function resetAllCharts() {
  appState.chartData = {timeSeries: [],pvPoints: [],fvPoints: []};
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
  tableHeader.innerHTML = '';
  tableBody.innerHTML = '';
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
  tableBody.innerHTML = '';
  const row = document.createElement('tr');
  const cells = [currentData.index,currentData.timestamp,...config.valueColumns.map(col => currentData[col])];
  cells.forEach(cellValue => {const td = document.createElement('td');
    td.textContent = typeof cellValue === 'number' ? cellValue.toFixed(2) : cellValue;
    row.appendChild(td);
  });
  tableBody.appendChild(row);
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
  function playbackLoop(currentTime) {if (!appState.playback.active) {
      console.log("Playback stopped - exiting animation frame loop");
      return;
    }
    const delta = currentTime - appState.playback.lastUpdateTime;
    if (delta > 0) {
      const virtualDelta = delta * appState.playback.speed;
      const targetRows = Math.floor((virtualDelta * config.targetRowsPerSecond) / 1000);
      if (targetRows > 0) {
        processRows(targetRows);
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
  const prevDirection = appState.playback.direction;
  appState.playback.direction *= -1;
  const now = performance.now();
  appState.playback.lastUpdateTime = now;
  
  const reverseBtn = document.getElementById('reverseBtn');
  reverseBtn.textContent = appState.playback.direction > 0 ? '⏪ Reverse' : '⏩ Forward';
  
  if (prevDirection > 0 && appState.playback.currentIndex === 0) {
    appState.playback.direction = 1;
    return;
  }
  
  processRows(1, true);
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
    initializeCharts();
    setupControls();
    setupFullscreenControls();
    updateDebugInfo();
    updateDataTable(appState.dataset[0]);
    updateVisualizations(appState.dataset[0]);
    console.log("System ready - all visualizations initialized");
  }
}

// ======================
// FULLSCREEN FUNCTIONALITY
// ======================
function setupFullscreenControls() {
  // Add click handlers to all chart containers
  document.querySelectorAll('.chart-container').forEach(container => {
    container.addEventListener('click', function(e) {
      // Don't trigger if clicking on the exit button or a child element that shouldn't trigger fullscreen
      if (e.target.closest('[data-no-fullscreen]')) return;
      
      toggleFullscreen(this);
    });
  });
  
  // Support ESC key to exit fullscreen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const fullscreenChart = document.querySelector('.chart-container.fullscreen');
      if (fullscreenChart) {
        toggleFullscreen(fullscreenChart);
      }
    }
  });
}

function toggleFullscreen(container) {
  if (!container) return;
  
  if (container.classList.contains('fullscreen')) {
    // Exit fullscreen
    container.classList.remove('fullscreen');
    document.body.style.overflow = 'auto';
    
    // Update charts after animation completes
    setTimeout(() => {
      Object.values(appState.charts).forEach(chart => {
        if (chart) chart.resize();
      });
    }, 300);
  } else {
    // Enter fullscreen
    document.querySelectorAll('.chart-container').forEach(c => {
      c.classList.remove('fullscreen');
    });
    container.classList.add('fullscreen');
    document.body.style.overflow = 'hidden';
    
    // Update charts after animation completes
    setTimeout(() => {
      Object.values(appState.charts).forEach(chart => {
        if (chart) chart.resize();
      });
    }, 300);
  }
}

// ======================
// CONTROL FUNCTIONS
// ======================
function setupControls() {
  const playBtn = document.getElementById('playBtn');
  const stopBtn = document.getElementById('stopBtn');
  const slowBtn = document.getElementById('slowBtn');
  const fastBtn = document.getElementById('fastBtn');
  const reverseBtn = document.getElementById('reverseBtn');
  const speedDisplay = document.getElementById('speedDisplay');
  playBtn.addEventListener('click', () => {if (appState.playback.active) {stopPlayback();
      playBtn.textContent = '▶ Play';
    } else {startPlayback();
      playBtn.textContent = '⏸ Pause';
    }});
  stopBtn.addEventListener('click', () => {stopPlayback();
    playBtn.textContent = '▶ Play';
  });
  slowBtn.addEventListener('click', () => {const newSpeed = Math.max(config.playbackRates.min, appState.playback.speed / 2);
    setPlaybackSpeed(newSpeed);
    updateSpeedDisplay();
  });
  fastBtn.addEventListener('click', () => {const newSpeed = Math.min(config.playbackRates.max, appState.playback.speed * 2);
    setPlaybackSpeed(newSpeed);
    updateSpeedDisplay();
  });
  reverseBtn.addEventListener('click', () => {
    toggleDirection();
    reverseBtn.textContent = appState.playback.direction > 0 ? '⏪ Reverse' : '⏩ Forward';
  });

  function updateSpeedDisplay() {speedDisplay.textContent = `${appState.playback.speed.toFixed(1)}x`;}
  updateSpeedDisplay();
}

document.addEventListener('DOMContentLoaded', initialize);
