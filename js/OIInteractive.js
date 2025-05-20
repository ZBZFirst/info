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
        skipEmptyLines: true,  // Add this to skip empty rows
        complete: function(results) {
            loadingDiv.textContent = "Processing data...";
            
            // Filter out rows with null values
            const cleanData = results.data.filter(row => 
                row.FiO2 !== null && 
                row.MAP !== null && 
                row.PaO2 !== null && 
                row.OI !== null
            );
            
            if (cleanData.length === 0) {
                loadingDiv.textContent = "Error: No valid data found";
                console.error("All rows contained null values");
                return;
            }
            
            // Extract clinical parameters from clean data
            const fio2 = cleanData.map(row => parseFloat(row.FiO2));
            const map = cleanData.map(row => parseFloat(row.MAP));
            const pao2 = cleanData.map(row => parseFloat(row.PaO2));
            const oi = cleanData.map(row => parseFloat(row.OI));
            
            // Create hover text with all parameters
            const texts = cleanData.map(row => 
                `FiO₂: ${parseFloat(row.FiO2).toFixed(2)}<br>
                 MAP: ${parseFloat(row.MAP).toFixed(1)} cmH₂O<br>
                 PaO₂: ${parseFloat(row.PaO2).toFixed(1)} mmHg<br>
                 OI: ${parseFloat(row.OI).toFixed(1)}`
            );
            
            // Create the trace
            const trace = {
                x: fio2,
                y: map,
                z: pao2,
                mode: 'markers',
                type: 'scatter3d',
                marker: {
                    size: 5,
                    opacity: 0.8,
                    color: oi,
                    colorscale: 'Jet',
                    reversescale: false,
                    cmin: 0,
                    cmax: 40,
                    colorbar: {
                        title: 'Oxygenation Index',
                        thickness: 20
                    }
                },
                hoverinfo: 'text',
                text: texts
            };
            
            // Layout configuration
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
            };
            
            // Create the plot
            Plotly.newPlot('plot', [trace], layout);
            
            loadingDiv.textContent = "Ready!";
            setTimeout(() => loadingDiv.remove(), 2000);
        },
        error: function(error) {
            loadingDiv.textContent = `Error loading data: ${error.message}`;
            console.error("Error loading CSV:", error);
        }
    });
});
