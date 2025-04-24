document.addEventListener('DOMContentLoaded', function() {
    // Graph container
    const graphDiv = document.getElementById('ventilation-graph');
    
    // Generate all possible data points
    function generateData() {
        const data = [];
        for (let rr = 0; rr <= 40; rr++) { // Whole numbers for RR
            for (let vt = 0; vt <= 1; vt += 0.01) { // 0.01 increments for VT
                const mv = rr * vt;
                if (mv <= 25) { // Filter out MV > 25
                    data.push({
                        x: rr,
                        y: vt,
                        mv: mv,
                        color: getColor(mv)
                    });
                }
            }
        }
        return data;
    }

    // 5-zone color gradient
    function getColor(mv) {
        if (mv <= 4) {
            // Black (0,0,0) → Yellow (255,255,0)
            const intensity = Math.floor(255 * (mv / 4));
            return `rgb(${intensity}, ${intensity}, 0)`;
        } else if (mv <= 8) {
            // Yellow (255,255,0) → Green (0,128,0)
            const ratio = (mv - 4) / 4;
            return `rgb(${Math.floor(255 * (1 - ratio))}, ${Math.floor(255 - (127 * ratio))}, 0)`;
        } else if (mv <= 12) {
            // Green (0,128,0) → Yellow (255,255,0)
            const ratio = (mv - 8) / 4;
            return `rgb(${Math.floor(255 * ratio)}, ${Math.floor(128 + (127 * ratio))}, 0)`;
        } else if (mv <= 20) {
            // Yellow (255,255,0) → Red (255,0,0)
            const ratio = (mv - 12) / 8;
            return `rgb(255, ${Math.floor(255 * (1 - ratio))}, 0)`;
        } else {
            // Solid red for 20-25
            return 'rgb(255, 0, 0)';
        }
    }

    // Create the graph
    function createGraph() {
        const data = generateData();
        
        const trace = {
            x: data.map(d => d.x),
            y: data.map(d => d.y),
            mode: 'markers',
            type: 'scattergl', // Using WebGL for better performance
            marker: {
                size: 8,
                color: data.map(d => d.color),
                opacity: 0.7,
                line: {
                    width: 0
                }
            },
            customdata: data.map(d => d.mv),
            hoverinfo: 'x+y+z',
            hoverlabel: {
                bgcolor: '#fff',
                bordercolor: '#000'
            }
        };

        const layout = {
            title: 'Ventilation Heatmap (RR vs VT)',
            xaxis: {
                title: 'Respiratory Rate (breaths/min)',
                range: [0, 40]
            },
            yaxis: {
                title: 'Tidal Volume (L)',
                range: [0, 1]
            },
            hovermode: 'closest',
            margin: { t: 40, b: 60, l: 60, r: 20 },
            plot_bgcolor: '#f8f9fa',
            paper_bgcolor: '#f8f9fa'
        };

        Plotly.newPlot(graphDiv, [trace], layout);

        // Add click interaction
        graphDiv.on('plotly_click', function(data) {
            const point = data.points[0];
            updateSliders(point.x, point.y);
            updateInfoBox(point.x, point.y, point.customdata);
        });
    }

    // Update sliders and display
    function updateSliders(rr, vt) {
        document.getElementById('rr-slider').value = rr;
        document.getElementById('vt-slider').value = vt;
    }

    function updateInfoBox(rr, vt, mv) {
        document.getElementById('rr-value').textContent = rr;
        document.getElementById('vt-value').textContent = vt.toFixed(2);
        document.getElementById('mv-value').textContent = mv.toFixed(2);
    }

    // Initialize everything
    createGraph();
});
