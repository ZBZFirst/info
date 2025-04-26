// Dashboard Configuration
const config = {
  maxDataPoints: 4000,
  timeColumn: "timestamp",
  valueColumns: ["flow", "pressure", "phase", "volume"],
  initialSpeed: 1.0,    // 1.0 = real-time (1ms per row)
  minSpeed: 0.1,        // 10x slower (10ms per row)
  maxSpeed: 100.0,      // 100x faster (0.01ms per row)
  dataFiles: ["data.xlsx", "data1.xlsx"]
};

// Global State
const charts = {
  main: null,
  flow: null,
  pressure: null,
  volume: null,
  pvLoop: null,
  fvLoop: null
};

// Global States
let data = [];
let breathSegments = { pv: [], fv: [] };
let currentIndex = 0;
let playbackDirection = 1;
let playbackSpeed = config.initialSpeed;
let worker = null;
let lastUpdateTime = 0;
let rowsToSkip = 0;
let animationFrameId = null;
let lastProcessedIndex = 0;
let playbackStartTimestamp = 0;

// DOM Elements
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const slowBtn = document.getElementById("slowBtn");
const fastBtn = document.getElementById("fastBtn");
const reverseBtn = document.getElementById("reverseBtn");
const speedDisplay = document.getElementById("speedDisplay");
const tableHeader = document.getElementById("tableHeader");
const tableBody = document.getElementById("tableBody");
const chartContainer = document.querySelector('.chart-container');
const fullscreenBtn = document.createElement('button');
fullscreenBtn.className = 'fullscreen-toggle';
fullscreenBtn.innerHTML = '⛶ Fullscreen';
chartContainer.appendChild(fullscreenBtn);

// Simplified File Discovery - Only checks /info/js/
async function findDataFile() {
  const basePath = window.location.origin + '/info/js/';

  for (const file of config.dataFiles) {
    const fileUrl = basePath + file;
    try {
      const response = await fetch(fileUrl);
      if (response.ok) {
        console.log("Found data file:", fileUrl);
        return fileUrl;
      }
    } catch (e) {
      console.log("Failed to load:", fileUrl, e);
    }
  }

  throw new Error(`None of these files were found in /info/js/: ${config.dataFiles.join(', ')}`);
}

// Initialize Dashboard
async function initDashboard() {
  try {
    console.log("Initializing dashboard...");
    const dataFile = await findDataFile();

    // Initialize all charts before worker starts
    charts.main = initTimeSeriesChart('timeSeriesChart', config.valueColumns);
    charts.flow = initTimeSeriesChart('timeSeriesChartFlow', ['flow']);
    charts.pressure = initTimeSeriesChart('timeSeriesChartPressure', ['pressure']);
    charts.volume = initTimeSeriesChart('timeSeriesChartVolume', ['volume']);
    charts.pvLoop = initLoopChart('PVLoop', 'PV Loop');
    charts.fvLoop = initLoopChart('FVLoop', 'FV Loop');

    // Initialize Web Worker with enhanced processing
    const workerCode = `
      importScripts('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
      
      function processBreathSegments(data) {
        const segments = { pv: [], fv: [] };
        let currentBreath = [];
        let inBreath = false;
        let breathCount = 0;
      
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          
          // Detect breath start (phase changes from 0 to 1)
          if (row.phase === 1 && !inBreath) {
            inBreath = true;
            currentBreath = []; // Start new breath
          }
          
          // If we're in a breath, collect data
          if (inBreath) {
            currentBreath.push(row);
            
            // Detect breath end (phase changes from 1 to 0)
            if (row.phase === 0 && inBreath) {
              inBreath = false;
              
              // Only store if we have a complete breath (minimum points)
              if (currentBreath.length >= 10) {
                // PV Loop data (Pressure vs Volume)
                segments.pv.push({
                  id: breathCount,
                  points: currentBreath.map(d => ({
                    x: d.volume,
                    y: d.pressure,
                    timestamp: d.timestamp
                  }))
                });
                
                // FV Loop data (Flow vs Volume)
                segments.fv.push({
                  id: breathCount,
                  points: currentBreath.map(d => ({
                    x: d.flow,
                    y: d.volume,
                    timestamp: d.timestamp
                  }))
                });
                
                breathCount++;
                
                // Keep only last 3 breaths
                if (segments.pv.length > 3) segments.pv.shift();
                if (segments.fv.length > 3) segments.fv.shift();
              }
            }
          }
        }
        
        return segments;
      }

      self.onmessage = async (e) => {
        if (e.data.command === "load") {
          try {
            const response = await fetch(e.data.url);
            if (!response.ok) throw new Error("HTTP " + response.status);
            
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            const processedData = jsonData.map((row, index) => ({
              ...row,
              indexer: index,
              displayTime: row[e.data.timeColumn]
            }));
            
            const breathSegments = processBreathSegments(jsonData);
            
            self.postMessage({ 
              command: "data", 
              data: processedData,
              breathSegments
            });
          } catch (error) {
            self.postMessage({ command: "error", error: error.message });
          }
        }
      };
    `;

    worker = new Worker(URL.createObjectURL(new Blob([workerCode], {type: 'application/javascript'})));

    worker.onmessage = (e) => {
      if (e.data.command === "data") {
        data = e.data.data;
        breathSegments = e.data.breathSegments;
        initTable();
        updateDisplay(0);
        startPlayback();
      } else if (e.data.command === "error") {
        console.error("Worker error:", e.data.error);
        alert("Data processing error: " + e.data.error);
      }
    };

    worker.postMessage({
      command: "load",
      url: dataFile,
      timeColumn: config.timeColumn
    });

  } catch (error) {
    console.error("Initialization failed:", error);
    alert("Error: " + error.message);
    if (worker) worker.terminate();

    // Fallback UI state
    document.querySelectorAll('.chart-container').forEach(container => {
      container.innerHTML += '<div class="error-message">Failed to load data</div>';
    });
  }
}

// Helper Functions
function getColor(index) {
  const colors = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc948", "#b07aa1", "#ff9da7"];
  return colors[index % colors.length];
}

function toggleFullscreen() {
  const isFullscreen = chartContainer.dataset.fullscreen === "true";
  chartContainer.dataset.fullscreen = !isFullscreen;

  // Update button icon
  fullscreenBtn.innerHTML = isFullscreen ? '⛶ Fullscreen' : '✕ Exit';

  // Handle chart resize
  if (window.chart) {
    window.chart.resize();
  }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);

// Handle ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chartContainer.dataset.fullscreen === "true") {
    toggleFullscreen();
  }
});

// Handle mobile device orientation changes
window.addEventListener('orientationchange', () => {
  if (chartContainer.dataset.fullscreen === "true" && window.chart) {
    setTimeout(() => window.chart.resize(), 200);
  }
});

// Rest of your existing functions remain exactly the same:
function initChart() {
  const ctx = document.getElementById("timeSeriesChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: config.valueColumns.map((col, i) => ({
        label: col,
        data: [],
        borderColor: getColor(i),
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 0
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      scales: {
        x: {
          type: "linear",
          title: { display: true, text: "Time Progression (indexer)" },
          ticks: {
            callback: function(value) {
              const point = data[value];
              return point ? value + "\n" + point.displayTime : value;
            }
          }
        },
        y: { title: { display: true, text: "Value" } }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: (ctx) => "Indexer: " + data[ctx[0].dataIndex].indexer,
            afterLabel: (ctx) => {
              const point = data[ctx.dataIndex];
              return `Time: ${point.displayTime}\nRel. Time: ${point.relTime}ms`;
            }
          }
        }
      }
    }
  });
}

function initTable() {
  tableHeader.innerHTML = "";
  ["indexer", "time", ...config.valueColumns].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    tableHeader.appendChild(th);
  });
}

function initTimeSeriesChart(canvasId, columns) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      datasets: columns.map((col, i) => ({
        label: col,
        data: [],
        borderColor: getColor(i),
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 0
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Time Progression (indexer)' }
        },
        y: { title: { display: true, text: 'Value' } }
      }
    }
  });
}

function initLoopChart(canvasId, label) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [] // Start with empty datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { 
          title: { display: true, text: canvasId === 'PVLoop' ? 'Volume' : 'Flow' },
          min: 0,
          max: 1000 // Set appropriate initial bounds
        },
        y: { 
          title: { display: true, text: canvasId === 'PVLoop' ? 'Pressure' : 'Volume' },
          min: 0,
          max: 100 // Set appropriate initial bounds
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const point = context.raw;
              return [
                `Breath: ${context.dataset.label}`,
                canvasId === 'PVLoop' 
                  ? `Pressure: ${point.y.toFixed(2)}` 
                  : `Volume: ${point.y.toFixed(2)}`,
                canvasId === 'PVLoop' 
                  ? `Volume: ${point.x.toFixed(2)}` 
                  : `Flow: ${point.x.toFixed(2)}`,
                `Time: ${point.timestamp || ''}`
              ];
            }
          }
        }
      }
    }
  });
}

let currentBreathPhase = 0;
let currentBreathData = [];

function updateDisplay(index) {
  if (!data.length) return;

  const currentData = data[index];
  
  // Track breath phase changes
  if (currentData.phase !== currentBreathPhase) {
    // Phase changed from 0 to 1 (new breath starting)
    if (currentData.phase === 1 && currentBreathPhase === 0) {
      currentBreathData = [];
    }
    // Phase changed from 1 to 0 (breath ending)
    else if (currentData.phase === 0 && currentBreathPhase === 1) {
      if (currentBreathData.length >= 10) {
        // Add to breath segments
        const breathId = breathSegments.pv.length;
        
        breathSegments.pv.push({
          id: breathId,
          points: currentBreathData.map(d => ({x: d.volume, y: d.pressure}))
        });
        
        breathSegments.fv.push({
          id: breathId,
          points: currentBreathData.map(d => ({x: d.flow, y: d.volume}))
        });
        
        // Keep only last 3 breaths
        if (breathSegments.pv.length > 3) breathSegments.pv.shift();
        if (breathSegments.fv.length > 3) breathSegments.fv.shift();
        
        updateLoopCharts();
      }
    }
    currentBreathPhase = currentData.phase;
  }

  // If we're in a breath (phase = 1), collect data
  if (currentBreathPhase === 1) {
    currentBreathData.push(currentData);
  }

  // Rest of your update logic...
  updateTimeSeriesCharts(currentData);
  updateTable(currentData);
}

function updateTimeSeriesCharts(currentData) {
  // Main chart (all values)
  config.valueColumns.forEach((col, i) => {
    updateChartDataset(
      charts.main, 
      i, 
      currentData.indexer, 
      currentData[col],
      config.maxDataPoints
    );
  });

  // Individual parameter charts
  updateChartDataset(charts.flow, 0, currentData.indexer, currentData.flow, config.maxDataPoints);
  updateChartDataset(charts.pressure, 0, currentData.indexer, currentData.pressure, config.maxDataPoints);
  updateChartDataset(charts.volume, 0, currentData.indexer, currentData.volume, config.maxDataPoints);
}

function updateLoopCharts() {
  if (!breathSegments.pv.length) return;

  // Update PV Loop with last 3 breaths
  charts.pvLoop.data.datasets = breathSegments.pv.slice(-3).map((segment, i) => ({
    label: `Breath ${segment.id}`,
    data: segment.points,
    borderColor: getColor(i),
    backgroundColor: 'transparent',
    borderWidth: 2,
    tension: 0.1,
    pointRadius: 0,
    showLine: true
  }));

  // Update FV Loop similarly
  charts.fvLoop.data.datasets = breathSegments.fv.slice(-3).map((segment, i) => ({
    label: `Breath ${segment.id}`,
    data: segment.points,
    borderColor: getColor(i + 3), // Different color range
    backgroundColor: 'transparent',
    borderWidth: 2,
    tension: 0.1,
    pointRadius: 0,
    showLine: true
  }));

  // Only update if we have new data
  if (charts.pvLoop.data.datasets.length > 0) {
    charts.pvLoop.update();
    charts.fvLoop.update();
  }
}

function updateChartDataset(chart, datasetIndex, x, y, maxPoints) {
  const dataset = chart.data.datasets[datasetIndex];

  // Check if point already exists
  const exists = dataset.data.some(point => point.x === x);
  if (exists) return;

  // Maintain data limits
  if (maxPoints && dataset.data.length >= maxPoints) {
    dataset.data.shift();
  }

  // Add new point
  dataset.data.push({ x, y });

  // Sort by x value (important for reverse playback)
  dataset.data.sort((a, b) => a.x - b.x);

  // Efficient update
  chart.update('none');
}

function updateTable(currentData) {
  tableBody.innerHTML = "";
  const row = document.createElement("tr");

  // Highlight current row
  row.classList.add('current-row');

  ["indexer", "displayTime", ...config.valueColumns].forEach(key => {
    const td = document.createElement("td");
    td.textContent = currentData[key];
    row.appendChild(td);
  });

  tableBody.appendChild(row);
}

// Playback Control
let playbackInterval = null;
let lastFrameTime = 0;
let accumulatedTime = 0;

function startPlayback() {
  if (animationFrameId) return; // Already playing
  
  playbackStartTimestamp = performance.now() - (currentIndex / playbackSpeed);
  lastProcessedIndex = currentIndex;
  playBtn.textContent = "⏸ Pause";
  
  function playbackFrame(timestamp) {
    // Calculate how much real time has elapsed
    const elapsedRealTime = timestamp - playbackStartTimestamp;
    
    // Calculate how much virtual time should have elapsed
    const elapsedVirtualTime = elapsedRealTime * playbackSpeed;
    
    // Determine target index (1 row = 1ms)
    let targetIndex = Math.floor(elapsedVirtualTime);
    
    // Handle direction
    if (playbackDirection === -1) {
      targetIndex = data.length - 1 - targetIndex;
    }
    
    // Handle looping
    if (targetIndex >= data.length) {
      targetIndex %= data.length;
      playbackStartTimestamp = timestamp;
      clearChartData();
    } else if (targetIndex < 0) {
      targetIndex = data.length - 1 - (Math.abs(targetIndex) % data.length);
      playbackStartTimestamp = timestamp;
      clearChartData();
    }
    
    // Process all rows between last processed and target
    const step = targetIndex > lastProcessedIndex ? 1 : -1;
    for (let i = lastProcessedIndex; i !== targetIndex; i += step) {
      currentIndex = i;
      updateDisplay(currentIndex);
    }
    
    lastProcessedIndex = targetIndex;
    animationFrameId = requestAnimationFrame(playbackFrame);
  }
  
  animationFrameId = requestAnimationFrame(playbackFrame);
}

function clearChartData() {
  // Clear all chart data when looping
  Object.values(charts).forEach(chart => {
    chart.data.datasets.forEach(dataset => {
      dataset.data = [];
    });
  });
}


function stopPlayback() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  playBtn.textContent = "▶ Play";
}

function changeSpeed(factor) {
  const wasPlaying = animationFrameId !== null;
  const currentTimestamp = performance.now();
  
  // Calculate current virtual time
  const currentVirtualTime = wasPlaying 
    ? (currentTimestamp - playbackStartTimestamp) * playbackSpeed
    : currentIndex;
  
  // Adjust speed
  playbackSpeed = Math.max(config.minSpeed,
                         Math.min(config.maxSpeed,
                         playbackSpeed * factor));
  
  // Adjust start timestamp to maintain position
  if (wasPlaying) {
    playbackStartTimestamp = currentTimestamp - (currentVirtualTime / playbackSpeed);
  }
  
  speedDisplay.textContent = `${playbackSpeed.toFixed(1)}x (${playbackDirection === 1 ? '▶' : '◀'})`;
}

function toggleDirection() {
  playbackDirection *= -1;
  reverseBtn.textContent = playbackDirection === 1 ? "⏪ Reverse" : "⏩ Forward";
  
  // Update chart titles to reflect direction
  Object.values(charts).forEach(chart => {
    if (chart.options.scales && chart.options.scales.x) {
      chart.options.scales.x.title.text = playbackDirection === 1 ? 
        "Time Progression (indexer)" : "Time Reversed (indexer)";
    }
    chart.update();
  });

  if (playbackInterval) startPlayback();
}

// Event Listeners
playBtn.addEventListener("click", () => playbackInterval ? stopPlayback() : startPlayback());
stopBtn.addEventListener("click", stopPlayback);
slowBtn.addEventListener("click", () => changeSpeed(1.3));  // ~30% slower
fastBtn.addEventListener("click", () => changeSpeed(0.7));  // ~30% faster
reverseBtn.addEventListener("click", toggleDirection);

// Clean up
window.addEventListener('beforeunload', () => {
  if (worker) worker.terminate();
  if (playbackInterval) clearInterval(playbackInterval);
});

// Start the dashboard
document.addEventListener("DOMContentLoaded", initDashboard);
