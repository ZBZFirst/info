// OIInteractive.js

// OIInteractive.js
document.addEventListener('DOMContentLoaded', function() {
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.textContent = "Loading data...";
    loadingDiv.style.cssText = `
        position: fixed; top: 20px; left: 20px; padding: 10px;
        background: rgba(0,0,0,0.7); color: white; border-radius: 5px;
        z-index: 1000; font-family: Arial, sans-serif;
    `;
    document.body.appendChild(loadingDiv);
    
    // Check if PapaParse is loaded
    if (typeof Papa === 'undefined') {
        loadingDiv.textContent = "Error: PapaParse not loaded";
        console.error("PapaParse library not loaded");
        return;
    }
    
    // Fetch and parse the CSV file
    Papa.parse('/info/quiz2/oxygenation_index_dataset.csv', {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            loadingDiv.textContent = "Processing data...";
            
            // Process the data
            const data = results.data;
            const traces = [];
            
            // Extract clinical parameters directly
            const fio2 = data.map(row => row.FiO2);
            const map = data.map(row => row.MAP);
            const pao2 = data.map(row => row.PaO2);
            const oi = data.map(row => row.OI);
            
            // Create hover text with all parameters
            const texts = data.map(row => 
                `FiO₂: ${row.FiO2.toFixed(2)}<br>
                 MAP: ${row.MAP} cmH₂O<br>
                 PaO₂: ${row.PaO2} mmHg<br>
                 OI: ${row.OI.toFixed(1)}`
            );
            
            // Create the trace with clinical parameters on axes
            traces.push({
                x: fio2,  // FiO2 on x-axis
                y: map,   // MAP on y-axis
                z: pao2,  // PaO2 on z-axis
                mode: 'markers',
                type: 'scatter3d',
                marker: {
                    size: 5,
                    opacity: 0.8,
                    color: oi,  // Color by OI value
                    colorscale: 'Jet',  // Better clinical color scale
                    reversescale: true,
                    cmin: 0,    // Minimum OI value
                    cmax: 40,   // Maximum OI value
                    colorbar: {
                        title: 'Oxygenation Index',
                        thickness: 20
                    }
                },
                hoverinfo: 'text',
                text: texts
            });
            
            // Clinical layout configuration
            const layout = {
                title: 'Clinical Oxygenation Parameters',
                scene: {
                    xaxis: { 
                        title: 'FiO₂',
                        range: [0.21, 1.0],
                        tickvals: [0.21, 0.4, 0.6, 0.8, 1.0]
                    },
                    yaxis: { 
                        title: 'MAP (cmH₂O)',
                        range: [5, 30]
                    },
                    zaxis: { 
                        title: 'PaO₂ (mmHg)',
                        range: [40, 100]
                    },
                    camera: {
                        eye: { x: 1.5, y: 1.5, z: 0.8 }
                    }
                },
                margin: { l: 0, r: 0, b: 0, t: 30 }
            };
            
            // Create the plot
            Plotly.newPlot('plot', traces, layout);
            
            loadingDiv.textContent = "Ready!";
            setTimeout(() => loadingDiv.remove(), 2000);
        },
        error: function(error) {
            loadingDiv.textContent = `Error loading data: ${error.message}`;
            console.error("Error loading CSV:", error);
        }
    });
});
