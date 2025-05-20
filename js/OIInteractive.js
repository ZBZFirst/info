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

    // Process CSV data directly (without Web Worker)
    function loadData() {
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

        Papa.parse(config.csvUrl, {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            step: function(results, parser) {
                const row = results.data;
                if (row.FiO2 !== null && row.MAP !== null && 
                    row.PaO2 !== null && row.OI !== null &&
                    row.MAP >= currentRange[0] && row.MAP < currentRange[1]) {
                    
                    // Sample the data to reduce points
                    if (Math.random() < config.sampleRate) {
                        allData.push({
                            FiO2: parseFloat(row.FiO2),
                            MAP: parseFloat(row.MAP),
                            PaO2: parseFloat(row.PaO2),
                            OI: parseFloat(row.OI)
                        });
                    }

                    // Update plot periodically
                    if (allData.length % 500 === 0) {
                        updatePlot();
                    }
                }
            },
            complete: function() {
                loadedRanges++;
                const progress = (loadedRanges / config.mapRanges.length) * 100;
                loadingDiv.querySelector('.progress-bar').style.width = `${progress}%`;
                loadingDiv.querySelector('.progress-text').textContent = `${Math.round(progress)}%`;
                
                // Final update for this range
                updatePlot();
                
                // Small delay before next range
                setTimeout(loadData, 100);
            },
            error: function(error) {
                console.error('CSV parsing error:', error);
                loadingDiv.querySelector('.loading-details').textContent = 
                    `Error loading data: ${error.message}`;
            }
        });
    }

    // Update the plot with current data
    function updatePlot() {
        if (allData.length === 0) return;

        // Limit total points
        const displayData = allData.length > config.maxPoints 
            ? allData.slice(allData.length - config.maxPoints)
            : allData;

        const traces = [{
            x: displayData.map(row => row.FiO2),
            y: displayData.map(row => row.MAP),
            z: displayData.map(row => row.PaO2),
            mode: 'markers',
            type: 'scatter3d',
            marker: {
                size: 3,
                opacity: 0.6,
                color: displayData.map(row => row.OI),
                colorscale: 'Jet',
                cmin: 0,
                cmax: 40,
                colorbar: {
                    title: 'Oxygenation Index',
                    thickness: 20
                }
            },
            hoverinfo: 'text',
            text: displayData.map(row => 
                `FiO₂: ${row.FiO2.toFixed(2)}<br>
                 MAP: ${row.MAP.toFixed(1)} cmH₂O<br>
                 PaO₂: ${row.PaO2.toFixed(1)} mmHg<br>
                 OI: ${row.OI.toFixed(1)}`
            ),
            name: `Data (${displayData.length.toLocaleString()} points)`
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
    loadData();

    // Add CSS for loading animation
    const style = document.createElement('style');
    style.textContent = `
        .loading-content {
            max-width: 500px;
            padding: 2rem;
            text-align: center;
        }
        .progress-container {
            width: 100%;
            height: 20px;
            background: #333;
            border-radius: 10px;
            margin: 1rem 0;
            position: relative;
            overflow: hidden;
        }
        .progress-bar {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #4361ee, #3a0ca3);
            transition: width 0.3s ease;
        }
        .progress-text {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 0.8rem;
        }
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
