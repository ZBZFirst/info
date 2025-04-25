// Dashboard Configuration
const config = {
  maxDataPoints: 4000,
  timeColumn: "timestamp",
  valueColumns: ["flow", "pressure", "phase", "volume"],
  initialSpeed: 50,  // Much faster starting speed (lower number = faster)
  minSpeed: 1,      // New minimum speed limit
  maxSpeed: 1000,    // New maximum speed limit
  dataFiles: ["data.xlsx", "data1.xlsx"]
};

// Global State
let data = [];
let currentIndex = 0;
let playbackDirection = 1;
let playbackSpeed = config.initialSpeed;
let chart = null;
let worker = null;
let lastUpdateTime = 0;
let rowsToSkip = 0;

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
    
    // Initialize Web Worker with XLSX included
  const workerCode = `
    importScripts('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
    
    self.onmessage = async (e) => {
      if (e.data.command === "load") {
        try {
          const response = await fetch(e.data.url);
          if (!response.ok) throw new Error("HTTP " + response.status);
          
          const arrayBuffer = await response.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer);
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          // Simply add index to each row and pass timestamp through unchanged
          const processedData = jsonData.map((row, index) => ({
            ...row,
            indexer: index,
            displayTime: row[e.data.timeColumn] // Just use the raw timestamp value
          }));
          
          self.postMessage({ command: "data", data: processedData });
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
        initChart();
        initTable();
        updateDisplay(0);
        startPlayback();
      } else if (e.data.command === "error") {
        throw new Error(e.data.error);
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
  }
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

function updateDisplay(index) {
  if (!data.length || !chart?.data?.datasets) return;
  
  index = Math.max(0, Math.min(index, data.length - 1));
  currentIndex = index;
  const currentData = data[index];
  
  // Clear all data if we looped around (index went back to 0 going forward)
  if (currentIndex === 0 && playbackDirection === 1) {
    config.valueColumns.forEach((col, i) => {
      if (chart.data.datasets[i]) {
        chart.data.datasets[i].data = [];
      }
    });
  }
  
  // Handle backwards movement - remove any points beyond current index
  if (playbackDirection === -1) {
    config.valueColumns.forEach((col, i) => {
      if (chart.data.datasets[i]) {
        // Remove any points where x > currentIndex
        chart.data.datasets[i].data = chart.data.datasets[i].data.filter(
          point => point.x <= currentIndex
        );
      }
    });
  }
  
  // Add new data point (only if we don't already have this index)
  config.valueColumns.forEach((col, i) => {
    if (chart.data.datasets[i]) {
      // Check if this index already exists in the data
      const exists = chart.data.datasets[i].data.some(
        point => point.x === currentData.indexer
      );
      
      if (!exists) {
        // Maintain max data points by removing oldest if needed
        if (chart.data.datasets[i].data.length >= config.maxDataPoints) {
          chart.data.datasets[i].data.shift();
        }
        
        // Add new point
        chart.data.datasets[i].data.push({
          x: currentData.indexer,
          y: currentData[col]
        });
        
        // Sort data by x value to maintain proper line drawing
        chart.data.datasets[i].data.sort((a, b) => a.x - b.x);
      }
    }
  });
  
  chart.update('none');
  
  // Update Table (unchanged)
  tableBody.innerHTML = "";
  const row = document.createElement("tr");
  ["indexer", "displayTime", ...config.valueColumns].forEach(key => {
    const td = document.createElement("td");
    td.textContent = currentData[key];
    row.appendChild(td);
  });
  tableBody.appendChild(row);
}

// Playback Control
let playbackInterval = null;

function startPlayback() {
  if (playbackInterval) clearInterval(playbackInterval);
  
  lastUpdateTime = performance.now();
  let lastIndex = currentIndex;
  
  playbackInterval = setInterval(() => {
    const now = performance.now();
    const elapsed = now - lastUpdateTime;
    lastUpdateTime = now;
    
    // Calculate how many rows to advance based on speed
    rowsToSkip += (playbackSpeed * elapsed) / 1000;
    const rowsToAdvance = Math.floor(rowsToSkip);
    rowsToSkip -= rowsToAdvance;
    
    if (rowsToAdvance > 0) {
      const newIndex = (currentIndex + (playbackDirection * rowsToAdvance) + data.length) % data.length;
      
      // Detect if we looped around
      if ((playbackDirection === 1 && newIndex < currentIndex) || 
          (playbackDirection === -1 && newIndex > currentIndex)) {
        // Clear all data when we loop
        config.valueColumns.forEach((col, i) => {
          if (chart.data.datasets[i]) {
            chart.data.datasets[i].data = [];
          }
        });
      }
      
      currentIndex = newIndex;
      updateDisplay(currentIndex);
      lastIndex = currentIndex;
    }
  }, 16); // ~60fps
  playBtn.textContent = "⏸ Pause";
}

function stopPlayback() {
  if (playbackInterval) {
    clearInterval(playbackInterval);
    playbackInterval = null;
  }
  playBtn.textContent = "▶ Play";
}

// Updated speed control
function changeSpeed(factor) {
  playbackSpeed = Math.max(config.minSpeed, 
                         Math.min(config.maxSpeed, 
                         playbackSpeed * factor));
  
  // Display as rows per second with remaining time
  const remaining = (data.length - currentIndex) / playbackSpeed;
  speedDisplay.textContent = `${playbackSpeed} rows/s (~${remaining.toFixed(1)}s left)`;
}

function toggleDirection() {
  playbackDirection *= -1;
  reverseBtn.textContent = playbackDirection === 1 ? "⏪ Reverse" : "⏩ Forward";
  
  // Visual feedback on chart
  chart.options.scales.x.title.text = playbackDirection === 1 ? 
    "Time Progression (indexer)" : "Time Reversed (indexer)";
  chart.update();
  
  if (playbackInterval) startPlayback();
}
// Helper Functions
function getColor(index) {
  const colors = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc948", "#b07aa1", "#ff9da7"];
  return colors[index % colors.length];
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
