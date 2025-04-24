document.addEventListener('DOMContentLoaded', function() {
    // Graph styling
    document.documentElement.style.setProperty('--graph-accent-color', '#3498db');
    document.documentElement.style.setProperty('--graph-secondary-color', '#2ecc71');
    
    // DOM elements
    const rrSlider = document.getElementById('respiratory-rate');
    const tvSlider = document.getElementById('tidal-volume');
    const rrValue = document.getElementById('rr-value');
    const tvValue = document.getElementById('tv-value');
    const mvValue = document.getElementById('minute-ventilation-value');
    const graphDiv = document.getElementById('ventilation-graph');
    
    // Constants
    const MAX_MV = 25;
    const RR_STEP = 1;
    const VT_STEP = 0.001;
    
    // Generate all possible data points
    function generateData() {
        const data = [];
        for (let rr = 0; rr <= 40; rr += RR_STEP) {
            for (let vt = 0; vt <= 1; vt += VT_STEP) {
                const mv = rr * vt;
                if (mv <= MAX_MV) {
                    data.push({
                        rr: rr,
                        vt: vt,
                        mv: mv
                    });
                }
            }
        }
        return data;
    }
    
    // Create color scale
    function getColor(mv) {
        // 5-zone gradient:
        // 0-4: Black (0,0,0) → Yellow (255,255,0)
        // 4-8: Yellow (255,255,0) → Green (0,128,0)
        // 8-12: Green (0,128,0) → Yellow (255,255,0)
        // 12-20: Yellow (255,255,0) → Red (255,0,0)
        // 20-25: Solid Red (255,0,0)
        
        if (mv <= 4) {
            // Black to Yellow (R and G increase)
            const intensity = Math.floor(255 * (mv / 4));
            return `rgb(${intensity}, ${intensity}, 0)`;
        } else if (mv <= 8) {
            // Yellow to Green (R decreases, G transitions to darker green)
            const progress = (mv - 4) / 4;
            return `rgb(${Math.floor(255 * (1 - progress))}, ${Math.floor(128 + (127 * progress))}, 0)`;
        } else if (mv <= 12) {
            // Green back to Yellow
            const progress = (mv - 8) / 4;
            return `rgb(${Math.floor(255 * progress)}, ${Math.floor(128 + (127 * (1 - progress)))}, 0)`;
        } else if (mv <= 20) {
            // Yellow to Red (G decreases)
            const progress = (mv - 12) / 8;
            return `rgb(255, ${Math.floor(255 * (1 - progress)))}, 0)`;
        } else {
            // Solid red for highest values
            return 'rgb(255, 0, 0)';
        }
    }
    
    // Initialize graph
    function initializeGraph() {
        const data = generateData();
        
        const trace = {
            x: data.map(d => d.rr),
            y: data.map(d => d.vt),
            mode: 'markers',
            marker: {
                size: 8,
                color: data.map(d => getColor(d.mv)),
                opacity: 0.7
            },
            type: 'scatter',
            customdata: data.map(d => d.mv)
        };
        
        const layout = {
            title: 'Ventilation Heatmap',
            xaxis: { title: 'Respiratory Rate (breaths/min)' },
            yaxis: { title: 'Tidal Volume (L)' },
            hovermode: 'closest',
            margin: { t: 40 }
        };
        
        Plotly.newPlot(graphDiv, [trace], layout);
        
        // Add click handler to update sliders
        graphDiv.on('plotly_click', function(data) {
            const point = data.points[0];
            rrSlider.value = point.x;
            tvSlider.value = point.y;
            updateUI(point.x, point.y);
        });
    }
    
    // Update UI based on slider values
    function updateUI(rr, vt) {
        const mv = rr * vt;
        
        rrValue.textContent = rr;
        tvValue.textContent = vt.toFixed(3);
        mvValue.textContent = mv.toFixed(2);
        
        // Update graph highlight
        Plotly.restyle(graphDiv, {
            'selectedpoints': [[getNearestPointIndex(rr, vt)]]
        });
    }
    
    // Find nearest data point index
    function getNearestPointIndex(rr, vt) {
        // In a real implementation, you'd search your data array
        // This is simplified for the example
        return Math.round(rr) * 1000 + Math.round(vt * 1000);
    }
    
    // Refactored slider event handlers
    rrSlider.addEventListener('input', () => {
        const rr = parseFloat(rrSlider.value);
        const vt = parseFloat(tvSlider.value);
        updateUI(rr, vt);
    });
    
    tvSlider.addEventListener('input', () => {
        const rr = parseFloat(rrSlider.value);
        const vt = parseFloat(tvSlider.value);
        updateUI(rr, vt);
    });
    
    // HTML changes needed:
    // - Change sliders to type="range" with appropriate min/max/step
    // - Add <div id="ventilation-graph"></div>
    
    // Initialize everything
    initializeGraph();
    updateUI(
        parseFloat(rrSlider.value),
        parseFloat(tvSlider.value)
    );
});
