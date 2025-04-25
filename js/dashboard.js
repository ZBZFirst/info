// Dashboard Configuration
const config = {
  dataFile: "/info/data.xlsx",
  maxDataPoints: 100,
  timeColumn: "timestamp",
  valueColumns: ["flow", "pressure", "phase", "volume"],
  initialSpeed: 1000 // ms between updates
};

// Global State
let data = [];
let currentIndex = 0;
let playbackDirection = 1; // 1 = forward, -1 = backward
let playbackSpeed = config.initialSpeed;
let chart = null;

// DOM Elements
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const slowBtn = document.getElementById("slowBtn");
const fastBtn = document.getElementById("fastBtn");
const reverseBtn = document.getElementById("reverseBtn");
const speedDisplay = document.getElementById("speedDisplay");
const tableHeader = document.getElementById("tableHeader");
const tableBody = document.getElementById("tableBody");

// Web Worker for data processing
const workerCode = `
  self.onmessage = async function(e) {
    if (e.data.command === "load") {
      try {
        const response = await fetch(e.data.url);
        if (!response.ok) throw new Error("HTTP error! status: " + response.status);
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        let data = XLSX.utils.sheet_to_json(firstSheet);
        
        // Process timestamps and create indexer
        let startTime = null;
        data.forEach((row, index) => {
          // Parse timestamp in sss:mmm format
          const [seconds, millis] = String(row[e.data.timeColumn]).split(':').map(Number);
          const currentTime = (seconds * 1000) + millis;
          
          // Set start time if not set
          if (startTime === null) startTime = currentTime;
          
          // Calculate relative time in ms
          row.relTime = currentTime - startTime;
          
          // Create indexer
          row.indexer = index;
          
          // Format for display
          row.displayTime = seconds + ":" + millis.toString().padStart(3, '0');
        });
        
        self.postMessage({ 
          command: "data", 
          data: data,
          valueColumns: e.data.valueColumns
        });
      } catch (error) {
        self.postMessage({ 
          command: "error", 
          error: error.message 
        });
      }
    }
  };
`;

const worker = new Worker(URL.createObjectURL(new Blob([workerCode], {type: 'application/javascript'}));

// Initialize Dashboard
async function initDashboard() {
  try {
    // Start loading data via worker
    worker.postMessage({
      command: "load",
      url: config.dataFile,
      timeColumn: config.timeColumn,
      valueColumns: config.valueColumns
    });
    
    // Initialize empty chart
    initChart();
    
  } catch (error) {
    console.error("Dashboard initialization failed:", error);
    alert("Error: " + error.message + "\nCheck console for details.");
  }
}

// Handle worker messages
worker.onmessage = function(e) {
  if (e.data.command === "data") {
    console.log("Data loaded from worker:", e.data.data.slice(0, 3));
    data = e.data.data;
    initTable();
    updateDisplay(0);
  } 
  else if (e.data.command === "error") {
    console.error("Worker error:", e.data.error);
    alert("Data loading failed: " + e.data.error);
  }
};

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
      animation: {
        duration: 0
      },
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "Time Progression (indexer)"
          },
          ticks: {
            callback: function(value) {
              const point = data[value];
              return point ? value + "\\n" + point.displayTime : value;
            }
          }
        },
        y: {
          title: {
            display: true,
            text: "Value"
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function(context) {
              const point = data[context[0].dataIndex];
              return "Indexer: " + point.indexer;
            },
            afterLabel: function(context) {
              const point = data[context.dataIndex];
              return "Time: " + point.displayTime + "\\nRel. Time: " + point.relTime + "ms";
            }
          }
        }
      }
    }
  });
}

function initTable() {
  tableHeader.innerHTML = "";
  
  // Create headers
  const headers = ["indexer", "time", ...config.valueColumns];
  headers.forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    tableHeader.appendChild(th);
  });
}

function updateDisplay(index) {
  if (!data.length || !chart || !chart.data || !chart.data.datasets) return;

  index = Math.max(0, Math.min(index, data.length - 1));
  currentIndex = index;
  
  const currentData = data[index];
  
  // Update Chart
  config.valueColumns.forEach((col, i) => {
    if (!chart.data.datasets[i]) return;
    
    if (chart.data.datasets[i].data.length >= config.maxDataPoints) {
      chart.data.datasets[i].data.shift();
    }
    
    chart.data.datasets[i].data.push({
      x: currentData.indexer,
      y: currentData[col]
    });
  });

  chart.update('none');
  
  // Update Table
  tableBody.innerHTML = "";
  const row = document.createElement("tr");
  
  // Add indexer cell
  const indexerCell = document.createElement("td");
  indexerCell.textContent = currentData.indexer;
  row.appendChild(indexerCell);
  
  // Add time cell
  const timeCell = document.createElement("td");
  timeCell.textContent = currentData.displayTime;
  row.appendChild(timeCell);
  
  // Add data cells
  config.valueColumns.forEach(col => {
    const td = document.createElement("td");
    td.textContent = currentData[col];
    row.appendChild(td);
  });
  
  tableBody.appendChild(row);
}

// Playback Control
let playbackInterval = null;

function startPlayback() {
  if (playbackInterval) clearInterval(playbackInterval);
  
  playbackInterval = setInterval(() => {
    currentIndex += playbackDirection;
    
    // Handle wrap-around
    if (currentIndex >= data.length) {
      currentIndex = 0;
    } else if (currentIndex < 0) {
      currentIndex = data.length - 1;
    }
    
    updateDisplay(currentIndex);
  }, playbackSpeed);
  
  playBtn.textContent = "⏸ Pause";
}

function stopPlayback() {
  if (playbackInterval) {
    clearInterval(playbackInterval);
    playbackInterval = null;
  }
  playBtn.textContent = "▶ Play";
}

function changeSpeed(factor) {
  playbackSpeed = Math.max(50, playbackSpeed * factor);
  speedDisplay.textContent = (1 / playbackSpeed * 1000).toFixed(1) + "x";
  
  if (playbackInterval) {
    startPlayback(); // Restart with new speed
  }
}

function toggleDirection() {
  playbackDirection *= -1;
  reverseBtn.textContent = playbackDirection === 1 ? "⏪ Reverse" : "⏩ Forward";
  
  if (playbackInterval) {
    startPlayback(); // Restart with new direction
  }
}

// Event Listeners
playBtn.addEventListener("click", () => {
  if (playbackInterval) {
    stopPlayback();
  } else {
    startPlayback();
  }
});

stopBtn.addEventListener("click", stopPlayback);
slowBtn.addEventListener("click", () => changeSpeed(1.5));
fastBtn.addEventListener("click", () => changeSpeed(0.67));
reverseBtn.addEventListener("click", toggleDirection);

// Helper Functions
function getColor(index) {
  const colors = [
    "#4e79a7", "#f28e2b", "#e15759", "#76b7b2",
    "#59a14f", "#edc948", "#b07aa1", "#ff9da7"
  ];
  return colors[index % colors.length];
}

// Initialize on Load
document.addEventListener("DOMContentLoaded", initDashboard);
