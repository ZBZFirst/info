// Dashboard Configuration
const config = {
  dataFile: "/info/data.xlsx", // Path to your XLSX file
  animationSpeed: 1000,
  maxDataPoints: 100,
  timeColumn: "timestamp", // Must match your column name
  valueColumns: ["flow", "pressure", "volume"] // Update with your actual column names
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
    // Load XLSX file
    const response = await fetch(config.dataFile);
    if (!response.ok) throw new Error("Failed to load data file");
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    
    // Get first sheet data
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    data = XLSX.utils.sheet_to_json(firstSheet);
    
    // Validate data
    if (!data.length) throw new Error("No data found in spreadsheet");
    
    // Format timestamps
    data.forEach(row => {
      if (row[config.timeColumn]) {
        // Handle both string and Excel serial dates
        if (typeof row[config.timeColumn] === "number") {
          row[config.timeColumn] = XLSX.SSF.parse_date_code(row[config.timeColumn]);
        } else {
          row[config.timeColumn] = new Date(row[config.timeColumn]);
        }
      }
    });
    
    // Initialize Chart and Table
    initChart();
    initTable();
    updateDisplay(0);
    
  } catch (error) {
    console.error("Dashboard initialization failed:", error);
    alert("Error loading data. Check console for details.");
  }
}

function initChart() {
  const ctx = document.getElementById("timeSeriesChart").getContext("2d");
  
  // Destroy previous chart if exists
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
        tension: 0.1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
            unit: 'minute'
          },
          title: {
            display: true,
            text: "Time"
          }
        },
        y: {
          title: {
            display: true,
            text: "Value"
          }
        }
      }
    }
  });
}

// Initialize Table
function initTable() {
  // Clear existing headers
  tableHeader.innerHTML = "";
  
  // Add headers
  if (data.length > 0) {
    Object.keys(data[0]).forEach(key => {
      const th = document.createElement("th");
      th.textContent = key;
      tableHeader.appendChild(th);
    });
  }
}

// Update Display with Current Data
function updateDisplay(index) {
  if (index >= data.length) {
    stopAnimation();
    return;
  }
  
  const currentData = data[index];
  currentIndex = index;
  
  // Update Chart
  config.valueColumns.forEach((col, i) => {
    if (chart.data.datasets[i].data.length >= config.maxDataPoints) {
      chart.data.datasets[i].data.shift();
    }
    chart.data.datasets[i].data.push({
      x: currentData[config.timeColumn],
      y: currentData[col]
    });
  });
  chart.update();
  
  // Update Table
  tableBody.innerHTML = "";
  const row = document.createElement("tr");
  Object.values(currentData).forEach(val => {
    const td = document.createElement("td");
    td.textContent = (val instanceof Date) ? val.toLocaleString() : val;
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
    startAnimation(); // Restart with new speed
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
