// Dashboard Configuration
const config = {
  maxDataPoints: 100,
  timeColumn: "timestamp",
  valueColumns: ["flow", "pressure", "phase", "volume"],
  initialSpeed: 1000,
  dataFiles: ["data.xlsx", "data1.xlsx"] // Files to try in /info/js/
};

// Global State
let data = [];
let currentIndex = 0;
let playbackDirection = 1;
let playbackSpeed = config.initialSpeed;
let chart = null;
let worker = null;

// DOM Elements
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const slowBtn = document.getElementById("slowBtn");
const fastBtn = document.getElementById("fastBtn");
const reverseBtn = document.getElementById("reverseBtn");
const speedDisplay = document.getElementById("speedDisplay");
const tableHeader = document.getElementById("tableHeader");
const tableBody = document.getElementById("tableBody");

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
  
  // Update Chart
  config.valueColumns.forEach((col, i) => {
    if (chart.data.datasets[i]) {
      if (chart.data.datasets[i].data.length >= config.maxDataPoints) {
        chart.data.datasets[i].data.shift();
      }
      chart.data.datasets[i].data.push({
        x: currentData.indexer,
        y: currentData[col]
      });
    }
  });
  chart.update('none');
  
  // Update Table
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
  playbackInterval = setInterval(() => {
    currentIndex = (currentIndex + playbackDirection + data.length) % data.length;
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
  if (playbackInterval) startPlayback();
}

function toggleDirection() {
  playbackDirection *= -1;
  reverseBtn.textContent = playbackDirection === 1 ? "⏪ Reverse" : "⏩ Forward";
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
slowBtn.addEventListener("click", () => changeSpeed(1.5));
fastBtn.addEventListener("click", () => changeSpeed(0.67));
reverseBtn.addEventListener("click", toggleDirection);

// Clean up
window.addEventListener('beforeunload', () => {
  if (worker) worker.terminate();
  if (playbackInterval) clearInterval(playbackInterval);
});

// Start the dashboard
document.addEventListener("DOMContentLoaded", initDashboard);
