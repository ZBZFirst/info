// Dashboard Configuration
const config = {
  dataFile: "/info/data.xlsx",
  animationSpeed: 1000,
  maxDataPoints: 100,
  timeColumn: "timestamp",
  valueColumns: ["flow", "pressure", "phase", "volume"]
};

// Global State
let data = [];
let currentIndex = 0;
let animationInterval = null;
let chart = null;

// DOM Elements
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const slowBtn = document.getElementById("slowBtn");
const fastBtn = document.getElementById("fastBtn");
const speedDisplay = document.getElementById("speedDisplay");
const tableHeader = document.getElementById("tableHeader");
const tableBody = document.getElementById("tableBody");

// Initialize Dashboard
async function initDashboard() {
  try {
    // Load and parse data
    const response = await fetch(config.dataFile);
    if (!response.ok) throw new Error("Failed to load data file");
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    data = XLSX.utils.sheet_to_json(firstSheet);
    
    // Validate data
    if (!data.length) throw new Error("No data found in spreadsheet");
    console.log("Raw data sample:", data.slice(0, 3));

    // Process timestamps and create indexer
    let startTime = null;
    data.forEach((row, index) => {
      // Parse timestamp in sss:mmm format
      const [seconds, millis] = String(row[config.timeColumn]).split(':').map(Number);
      const currentTime = (seconds * 1000) + millis;
      
      // Set start time if not set
      if (startTime === null) startTime = currentTime;
      
      // Calculate relative time in ms
      row.relTime = currentTime - startTime;
      
      // Create indexer
      row.indexer = index;
      
      // Format for display
      row.displayTime = `${seconds}:${millis.toString().padStart(3, '0')}`;
    });

    console.log("Processed data sample:", data.slice(0, 3));
    
    // Initialize visualization
    initChart();
    initTable();
    updateDisplay(0);
    
  } catch (error) {
    console.error("Dashboard initialization failed:", error);
    alert(`Error: ${error.message}\nCheck console for details.`);
  }
}

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
              // Show both indexer and time on x-axis
              const point = data[value];
              return point ? `${value}\n${point.displayTime}` : value;
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
              return `Indexer: ${point.indexer}`;
            },
            afterLabel: function(context) {
              const point = data[context.dataIndex];
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
  
  // Create headers
  const headers = ["indexer", "time", ...config.valueColumns];
  headers.forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    tableHeader.appendChild(th);
  });
}

function updateDisplay(index) {
  if (!chart || !chart.data || !chart.data.datasets) {
    console.error("Chart not properly initialized");
    return;
  }

  if (index >= data.length || !data[index]) {
    stopAnimation();
    return;
  }

  const currentData = data[index];
  currentIndex = index;
  
  // Update Chart
  config.valueColumns.forEach((col, i) => {
    if (!chart.data.datasets[i]) return;
    
    if (chart.data.datasets[i].data.length >= config.maxDataPoints) {
      chart.data.datasets[i].data.shift();
    }
    
    chart.data.datasets[i].data.push({
      x: currentData.indexer, // Use indexer for x-axis
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

// Animation Control Functions
function startAnimation() {
  if (animationInterval) clearInterval(animationInterval);
  
  animationInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % data.length;
    updateDisplay(currentIndex);
  }, config.animationSpeed);
  
  playBtn.textContent = "⏸ Pause";
}

function stopAnimation() {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  playBtn.textContent = "▶ Play";
}

function changeSpeed(factor) {
  config.animationSpeed = Math.max(100, config.animationSpeed * factor);
  speedDisplay.textContent = `${(1 / config.animationSpeed * 1000).toFixed(1)}x`;
  
  if (animationInterval) {
    startAnimation();
  }
}

// Helper Functions
function getColor(index) {
  const colors = [
    "#4e79a7", "#f28e2b", "#e15759", "#76b7b2",
    "#59a14f", "#edc948", "#b07aa1", "#ff9da7"
  ];
  return colors[index % colors.length];
}

// Event Listeners
playBtn.addEventListener("click", () => {
  if (animationInterval) {
    stopAnimation();
  } else {
    startAnimation();
  }
});

stopBtn.addEventListener("click", stopAnimation);
slowBtn.addEventListener("click", () => changeSpeed(1.5));
fastBtn.addEventListener("click", () => changeSpeed(0.67));

// Initialize on Load
document.addEventListener("DOMContentLoaded", initDashboard);
