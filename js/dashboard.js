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
        let lastPhase = null;
        let breathCount = 0;
        
        data.forEach(row => {
          if (row.phase === 2) return; // Skip invalid data
          
          // Detect breath start (phase 1 after non-1)
          if (row.phase === 1 && lastPhase !== 1) {
            // Only store if we have a complete breath (min 10 points)
            if (currentBreath.length > 10) {
              segments.pv.push({
                id: breathCount++,
                points: currentBreath.map(d => ({x: d.volume, y: d.pressure}))
              });
              segments.fv.push({
                id: breathCount++,
                points: currentBreath.map(d => ({x: d.flow, y: d.volume}))
              });
              
              // Keep only last 3 breaths
              if (segments.pv.length > 3) segments.pv.shift();
              if (segments.fv.length > 3) segments.fv.shift();
            }
            currentBreath = [];
          }
          
          currentBreath.push(row);
          lastPhase = row.phase;
        });
        
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
      datasets: [{
        label: label,
        data: [],
        borderColor: '#4e79a7',
        backgroundColor: 'rgba(78, 121, 167, 0.1)',
        borderWidth: 2,
        showLine: true,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: canvasId === 'PVLoop' ? 'Volume' : 'Flow' } },
        y: { title: { display: true, text: canvasId === 'PVLoop' ? 'Pressure' : 'Volume' } }
      }
    }
  });
}

function updateDisplay(index) {
  if (!data.length) return;

  index = Math.max(0, Math.min(index, data.length - 1));
  currentIndex = index;
  const currentData = data[index];

  // Update all time-series charts
  updateTimeSeriesCharts(currentData);

  // Update loop charts if we have breath segments
  if (breathSegments.pv.length > 0) {
    updateLoopCharts();
  }

  // Update the data table
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
  // Update PV Loop with last 3 breaths (different colors)
  charts.pvLoop.data.datasets = breathSegments.pv.map((segment, i) => ({
    label: `Breath ${breathSegments.pv.length - i}`,
    data: segment.points,
    borderColor: getColor(i),
    backgroundColor: 'transparent',
    borderWidth: 2,
    tension: 0.1,
    pointRadius: 0,
    showLine: true
  }));

  // Update FV Loop similarly
  charts.fvLoop.data.datasets = breathSegments.fv.map((segment, i) => ({
    label: `Breath ${breathSegments.fv.length - i}`,
    data: segment.points,
    borderColor: getColor(i),
    backgroundColor: 'transparent',
    borderWidth: 2,
    tension: 0.1,
    pointRadius: 0,
    showLine: true
  }));

  charts.pvLoop.update();
  charts.fvLoop.update();
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
