// Create worker.js content as a Blob URL to avoid separate file
const workerCode = `
  self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js');

  self.onmessage = function(e) {
    const { url, mapRange } = e.data;
    
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      chunk: function(results, parser) {
        const filtered = results.data.filter(row => 
          row.FiO2 !== null && 
          row.MAP !== null && 
          row.PaO2 !== null && 
          row.OI !== null &&
          row.MAP >= mapRange[0] && 
          row.MAP < mapRange[1]
        );
        
        if (filtered.length > 0) {
          self.postMessage({
            status: 'chunk',
            data: filtered,
            mapRange: mapRange
          });
        }
      },
      complete: function() {
        self.postMessage({
          status: 'complete',
          mapRange: mapRange
        });
      },
      error: function(error) {
        self.postMessage({
          status: 'error',
          error: error.message
        });
      }
    });
  };
`;

const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(workerBlob);

document.addEventListener('DOMContentLoaded', function() {
    // Enhanced loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <h3>Loading Oxygenation Data</h3>
            <div class="progress-container">
                <div class="progress-bar"></div>
                <div class="progress-text">0%</div>
            </div>
            <div class="loading-details">Preparing visualization...</div>
        </div>
    `;
    loadingDiv.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); color: white; 
        z-index: 1000; font-family: Arial, sans-serif;
        display: flex; justify-content: center; align-items: center;
    `;
    loadingDiv.querySelector('.loading-content').style.cssText = `
        max-width: 500px; padding: 2rem; text-align: center;
    `;
    loadingDiv.querySelector('.progress-container').style.cssText = `
        width: 100%; height: 20px; background: #333;
        border-radius: 10px; margin: 1rem 0; position: relative;
        overflow: hidden;
    `;
    loadingDiv.querySelector('.progress-bar').style.cssText = `
        height: 100%; width: 0%; background: linear-gradient(90deg, #4361ee, #3a0ca3);
        transition: width 0.3s ease;
    `;
    loadingDiv.querySelector('.progress-text').style.cssText = `
        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        display: flex; justify-content: center; align-items: center;
        font-size: 0.8rem;
    `;
    document.body.appendChild(loadingDiv);
    
    // Check for required libraries
    if (typeof Papa === 'undefined' || typeof Plotly === 'undefined') {
        loadingDiv.innerHTML = `<div class="error">Error: Required libraries not loaded. Please check your internet connection.</div>`;
        return;
    }
    
    // Configuration
    const config = {
        csvUrl: '/info/quiz2/oxygenation_index_dataset.csv',
        mapRanges: [
            [5, 10], [10, 15], [15, 20], [20, 25], 
            [25, 30], [30, 35], [35, 40], [40, 45],
            [45, 50], [50, 55], [55, 60], [60, 65], [65, 70]
        ],
        sampleRate: 0.2, // Sample 20% of points from each range
        maxPoints: 20000 // Maximum points to display at once
    };
    
    // Initialize plot
    const plotDiv = document.getElementById('plot');
    Plotly.newPlot(plotDiv, [], {
        title: 'Clinical Oxygenation Parameters (Loading...)',
        scene: {
            xaxis: { title: 'FiO₂', range: [0.21, 1.0] },
            yaxis: { title: 'MAP (cmH₂O)', range: [5, 70] },
            zaxis: { title: 'PaO₂ (mmHg)', range: [40, 1000] }
        }
    });
    
    // State management
    let allData = [];
    let loadedRanges = 0;
    let currentTrace = null;
    
    // Process each MAP range
    function loadNextRange() {
        if (loadedRanges >= config.mapRanges.length) {
            // All ranges loaded
            loadingDiv.querySelector('.loading-details').textContent = 'Finalizing visualization...';
            setTimeout(() => {
                loadingDiv.style.opacity = '0';
                setTimeout(() => loadingDiv.remove(), 500);
            }, 1000);
            return;
        }
        
        const currentRange = config.mapRanges[loadedRanges];
        loadingDiv.querySelector('.loading-details').textContent = 
            `Loading MAP range: ${currentRange[0]} to ${currentRange[1]} cmH₂O`;
        
        const worker = new Worker(workerUrl);
        worker.postMessage({
            url: config.csvUrl,
            mapRange: currentRange
        });
        
        worker.onmessage = function(e) {
            const { status, data, mapRange, error } = e.data;
            
            if (status === 'error') {
                console.error('Worker error:', error);
                worker.terminate();
                return;
            }
            
            if (status === 'chunk' && data && data.length > 0) {
                // Sample the data to reduce points
                const sampledData = data.length > 1000 ? 
                    data.filter(() => Math.random() < config.sampleRate) : 
                    data;
                
                allData = allData.concat(sampledData);
                
                // Limit total points
                if (allData.length > config.maxPoints) {
                    allData = allData.slice(allData.length - config.maxPoints);
                }
                
                // Update plot
                updatePlot();
            }
            
            if (status === 'complete') {
                loadedRanges++;
                const progress = (loadedRanges / config.mapRanges.length) * 100;
                loadingDiv.querySelector('.progress-bar').style.width = `${progress}%`;
                loadingDiv.querySelector('.progress-text').textContent = `${Math.round(progress)}%`;
                worker.terminate();
                setTimeout(loadNextRange, 100); // Small delay between ranges
            }
        };
    }
    
    // Update the plot with current data
    function updatePlot() {
        if (allData.length === 0) return;
        
        const traces = [{
            x: allData.map(row => row.FiO2),
            y: allData.map(row => row.MAP),
            z: allData.map(row => row.PaO2),
            mode: 'markers',
            type: 'scatter3d',
            marker: {
                size: 3,
                opacity: 0.6,
                color: allData.map(row => row.OI),
                colorscale: 'Jet',
                cmin: 0,
                cmax: 40,
                colorbar: {
                    title: 'Oxygenation Index',
                    thickness: 20
                }
            },
            hoverinfo: 'text',
            text: allData.map(row => 
                `FiO₂: ${row.FiO2.toFixed(2)}<br>
                 MAP: ${row.MAP.toFixed(1)} cmH₂O<br>
                 PaO₂: ${row.PaO2.toFixed(1)} mmHg<br>
                 OI: ${row.OI.toFixed(1)}`
            ),
            name: `Data (${allData.length.toLocaleString()} points)`
        }];
        
        Plotly.react(plotDiv, traces, {
            title: 'Clinical Oxygenation Parameters',
            scene: {
                xaxis: { 
                    title: 'FiO₂',
                    range: [0.21, 1.0],
                    tickvals: [0.21, 0.4, 0.6, 0.8, 1.0]
                },
                yaxis: { 
                    title: 'MAP (cmH₂O)',
                    range: [5, 70]
                },
                zaxis: { 
                    title: 'PaO₂ (mmHg)',
                    range: [40, 1000]
                },
                camera: {
                    eye: { x: 1.5, y: 1.5, z: 0.8 }
                }
            },
            margin: { l: 0, r: 0, b: 0, t: 30 }
        });
    }
    
    // Start loading process
    loadNextRange();
    
    // Add CSS for loading animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
        .loading-content h3 {
            animation: pulse 2s infinite;
            margin-bottom: 1.5rem;
        }
    `;
    document.head.appendChild(style);
});
