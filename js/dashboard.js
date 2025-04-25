// Enhanced Dashboard Configuration
const config = {
  maxDataPoints: 100,
  timeColumn: "timestamp",
  valueColumns: ["flow", "pressure", "phase", "volume"],
  initialSpeed: 1000, // ms between updates
  testFiles: ["data.xlsx", "data1.xlsx"], // Files to try
  searchPaths: [
    "",              // Current directory
    "js/",         // Local data folder
    "../info/",      // One level up data folder
    "../"            // One level up
  ]
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

// Initialize Web Worker
function createWorker() {
  const workerCode = `
    const processData = (data, timeColumn) => {
      let startTime = null;
      return data.map((row, index) => {
        const [seconds, millis] = String(row[timeColumn]).split(':').map(Number);
        const currentTime = (seconds * 1000) + millis;
        startTime = startTime || currentTime;
        
        return {
          ...row,
          relTime: currentTime - startTime,
          indexer: index,
          displayTime: seconds + ":" + millis.toString().padStart(3, '0')
        };
      });
    };

    self.onmessage = async (e) => {
      if (e.data.command === "load") {
        try {
          const response = await fetch(e.data.url);
          if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
          
          const arrayBuffer = await response.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer);
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          self.postMessage({
            command: "data",
            data: processData(jsonData, e.data.timeColumn),
            valueColumns: e.data.valueColumns
          });
        } catch (error) {
          self.postMessage({ command: "error", error: error.message });
        }
      }
    };
  `;

  const blob = new Blob([workerCode], {type: 'application/javascript'});
  const worker = new Worker(URL.createObjectURL(blob));
  worker.objectURL = URL.createObjectURL(blob);
  return worker;
}

// Enhanced File Discovery
async function discoverDataFile() {
  const basePath = document.currentScript.src.replace(/[^/]*$/, '');
  const testUrls = [];
  
  // Generate all possible file URLs to test
  config.searchPaths.forEach(path => {
    config.testFiles.forEach(file => {
      testUrls.push(new URL(path + file, basePath).href);
    });
  });

  // Try each URL in parallel with timeout
  const tests = testUrls.map(url => 
    Promise.race([
      fetch(url).then(res => res.ok ? url : null),
      new Promise(resolve => setTimeout(() => resolve(null), 2000))
    ]).catch(() => null)
  );

  const results = await Promise.all(tests);
  return results.find(url => url !== null);
}

// Data Validation
function validateData(jsonData) {
  if (!Array.isArray(jsonData) return false;
  if (jsonData.length === 0) return false;
  
  const firstRow = jsonData[0];
  return config.valueColumns.every(col => 
    col in firstRow && !isNaN(parseFloat(firstRow[col]))
    && config.timeColumn in firstRow;
}

// Initialize Dashboard
async function initDashboard() {
  try {
    // Discover and load data file
    const dataFile = await discoverDataFile();
    if (!dataFile) throw new Error("No valid data files found");
    
    console.log("Loading data from:", dataFile);
    worker = createWorker();
    
    worker.onmessage = (e) => {
      if (e.data.command === "data") {
        if (validateData(e.data.data)) {
          data = e.data.data;
          initChart();
          initTable();
          updateDisplay(0);
        } else {
          throw new Error("Invalid data structure");
        }
      } else if (e.data.command === "error") {
        throw new Error(e.data.error);
      }
    };
    
    worker.onerror = (e) => {
      throw new Error("Worker error: " + e.message);
    };
    
    worker.postMessage({
      command: "load",
      url: dataFile,
      timeColumn: config.timeColumn,
      valueColumns: config.valueColumns
    });
    
  } catch (error) {
    console.error("Initialization failed:", error);
    alert("Error: " + error.message);
    if (worker) worker.terminate();
  }
}

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
  if (worker) {
    worker.terminate();
    URL.revokeObjectURL(worker.objectURL);
  }
});

// Rest of your existing functions remain exactly the same:
// initChart(), initTable(), updateDisplay(), 
// playback controls, event listeners, etc.

document.addEventListener("DOMContentLoaded", initDashboard);
