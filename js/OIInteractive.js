// OIInteractive.js

// Load and parse the CSV data
function loadAndVisualizeData() {
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.textContent = "Loading data...";
    loadingDiv.style.cssText = `
        position: fixed; top: 20px; left: 20px; padding: 10px;
        background: rgba(0,0,0,0.7); color: white; border-radius: 5px;
        z-index: 1000; font-family: Arial, sans-serif;
    `;
    document.body.appendChild(loadingDiv);
    
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
            
            // Extract columns from CSV
            const x = data.map(row => row.x);
            const y = data.map(row => row.y);
            const z = data.map(row => row.OI);
            const colors = data.map(row => row.OI);
            const texts = data.map(row => 
                `PaO₂: ${row.PaO2}<br>FiO₂: ${row.FiO2}<br>MAP: ${row.MAP}<br>OI: ${row.OI}`
            );
            
            // Create the trace
            traces.push({
                x: x,
                y: y,
                z: z,
                mode: 'markers',
                type: 'scatter3d',
                marker: {
                    size: 3,
                    opacity: 0.8,
                    color: colors,
                    colorscale: 'RdYlGn',
                    reversescale: true,
                    colorbar: {
                        title: 'Oxygenation Index',
                        thickness: 20
                    }
                },
                hoverinfo: 'text',
                text: texts
            });
            
            // Layout configuration
            const layout = {
                title: 'Oxygenation Index Visualization',
                scene: {
                    xaxis: { title: 'X (Normalized)' },
                    yaxis: { title: 'Y (Normalized)' },
                    zaxis: { title: 'Oxygenation Index' },
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
}

// Initialize the visualization when the page loads
document.addEventListener('DOMContentLoaded', loadAndVisualizeData);

