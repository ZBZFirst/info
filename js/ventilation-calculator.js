document.addEventListener('DOMContentLoaded', function() {
    const graphDiv = document.getElementById('ventilation-graph');
    const polarDiv = document.getElementById('ventilation-graph-polar');

    // Only proceed if both elements exist
    if (!graphDiv || !polarDiv) {
        console.error('Required graph containers not found!');
        return;
    }
    
    let highlightedPoint = null;
    
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

    function getColor(mv) {
        if (mv <= 4) {
            const intensity = Math.floor(255 * (mv / 4));
            return `rgb(${intensity}, ${intensity}, 0)`;
        } else if (mv <= 8) {
            const ratio = (mv - 4) / 4;
            return `rgb(${Math.floor(255 * (1 - ratio))}, ${Math.floor(255 - (127 * ratio))}, 0)`;
        } else if (mv <= 12) {
            const ratio = (mv - 8) / 4;
            return `rgb(${Math.floor(255 * ratio)}, ${Math.floor(128 + (127 * ratio))}, 0)`;
        } else if (mv <= 20) {
            const ratio = (mv - 12) / 8;
            return `rgb(255, ${Math.floor(255 * (1 - ratio))}, 0)`;
        } else {
            return 'rgb(255, 0, 0)';
        }
    }

    function classifyRR(rr) {
        if (rr < 12) return { classification: 'Bradypnea', class: 'bradypnea' };
        if (rr > 20) return { classification: 'Tachypnea', class: 'tachypnea' };
        return { classification: 'Eupnea', class: 'eupnea' };
    }

    function classifyVT(vt) {
        if (vt < 0.2) return { classification: 'Hypopnea', class: 'bradypnea' };
        if (vt > 0.8) return { classification: 'Hyperpnea', class: 'tachypnea' };
        return { classification: 'Normal VT', class: 'normal vt' };
    }

    function classifyVentilation(rr, vt) {
        const rrClass = classifyRR(rr);
        const vtClass = classifyVT(vt);
        
        if (rrClass.classification === 'Eupnea' && vtClass.classification === 'normal vt') {
            return 'Normal RR and Normal VT';
        }
        return `Abnormal (${rrClass.classification} and ${vtClass.classification})`;
    }

    function createGraph() {
        const data = generateData();
        
        // Main heatmap trace
        const heatmapTrace = {
            x: data.map(d => d.x),
            y: data.map(d => d.y),
            mode: 'markers',
            type: 'scattergl',
            marker: {
                size: 8,
                color: data.map(d => d.color),
                opacity: 0.5, // Reduced opacity for background points
                line: {
                    width: 0
                }
            },
            customdata: data.map(d => d.mv),
            hoverinfo: 'none', // Disabled hover for main trace
            name: 'Possible Combinations'
        };

        const highlightTrace = {
            x: [],
            y: [],
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: 16,
                color: 'white',
                opacity: 1,
                line: {
                    color: 'black',
                    width: 3
                },
                symbol: 'diamond'
            },
            hoverinfo: 'none',
            name: 'Selected'
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
            paper_bgcolor: '#f8f9fa',
            showlegend: true
        };

        Plotly.newPlot(graphDiv, [heatmapTrace, highlightTrace], layout);

        // Create Polar graph
        createPolarGraph();

        // Set up interactions
        graphDiv.on('plotly_click', function(data) {
            if (data.points.length > 0) {
                const point = data.points[0];
                highlightPoint(point.x, point.y);
                updateSliders(point.x, point.y);
                updateInfoBox(point.x, point.y, point.customdata);
            }
        });

        // Also add click handler for polar graph
        polarDiv.on('plotly_click', function(data) {
            if (data.points.length > 0) {
                const rr = data.points[0].theta * (40/360); // Convert back from polar
                const vt = data.points[0].r;
                highlightPoint(rr, vt);
                updateSliders(rr, vt);
                updateInfoBox(rr, vt, rr * vt);
            }
        });

        const initialRR = 12;
        const initialVT = 0.5;
        highlightPoint(initialRR, initialVT);
        updateSliders(initialRR, initialVT);
        updateInfoBox(initialRR, initialVT, initialRR * initialVT);
    }

    // Modify highlightPoint to update both graphs
    function highlightPoint(rr, vt) {
        const cartesianUpdate = {
            'marker.color': ['white'],
            'marker.size': [20],
            'marker.line.color': ['black'],
            'marker.line.width': [3],
            'marker.symbol': ['diamond'],
            x: [[rr]],
            y: [[vt]]
        };
        Plotly.restyle('ventilation-graph', cartesianUpdate, 1);
        
        // Update Polar graph
        const polarUpdate = {
            'marker.color': ['white'],
            'marker.size': [20],
            'marker.line.color': ['black'],
            'marker.line.width': [3],
            'marker.symbol': ['diamond'],
            theta: [[rr * (360/40)]],
            r: [[vt]]
        };
        Plotly.restyle('ventilation-graph-polar', polarUpdate, 1);
        
        highlightedPoint = { rr, vt };
    }
    // Add this function to create polar data
    function generatePolarData() {
        const data = [];
        for (let rr = 0; rr <= 40; rr++) {
            for (let vt = 0; vt <= 1; vt += 0.01) {
                const mv = rr * vt;
                if (mv <= 25) {
                    data.push({
                        theta: rr * (360/40), // Convert RR to degrees (0-360)
                        r: vt,                // VT as radius
                        mv: mv,               // MV for coloring
                        color: getColor(mv)
                    });
                }
            }
        }
        return data;
    }
    
    // Add this function to create the polar graph
    function createPolarGraph() {
        const data = generatePolarData();
        const polarDiv = document.getElementById('ventilation-graph-polar');
        
        const polarTrace = {
            type: 'scatterpolar',
            mode: 'markers',
            theta: data.map(d => d.theta),
            r: data.map(d => d.r),
            marker: {
                color: data.map(d => d.color),
                size: 8,
                opacity: 0.5
            },
            name: 'Possible Combinations',
            hoverinfo: 'none'
        };
    
        const highlightTrace = {
            type: 'scatterpolar',
            mode: 'markers',
            theta: [],
            r: [],
            marker: {
                size: 16,
                color: 'white',
                opacity: 1,
                line: {
                    color: 'black',
                    width: 3
                },
                symbol: 'diamond'
            },
            hoverinfo: 'none',
            name: 'Selected'
        };
    
        const layout = {
            title: 'Polar Ventilation Heatmap',
            polar: {
                radialaxis: {
                    title: 'Tidal Volume (L)',
                    range: [0, 1]
                },
                angularaxis: {
                    rotation: 90,
                    direction: 'clockwise',
                    tickvals: [0, 90, 180, 270, 360],
                    ticktext: ['0', '10', '20', '30', '40']
                }
            },
            showlegend: true
        };
    
        Plotly.newPlot(polarDiv, [polarTrace, highlightTrace], layout);
    }
    
    function updateSliders(rr, vt) {
        document.getElementById('respiratory-rate').value = rr;
        document.getElementById('tidal-volume').value = vt * 1000; // Convert to mL for slider
    }
    
    function updateInfoBox(rr, vt, mv) {
        document.getElementById('rr-value').textContent = rr;
        document.getElementById('tv-value').textContent = (vt * 1000).toFixed(0); // Display in mL
        document.getElementById('minute-ventilation-value').textContent = mv.toFixed(1);
        
        const rrClassification = classifyRR(rr);
        const vtClassification = classifyVT(vt);
        
        const ventilationStatus = classifyVentilation(rr, vt);
        document.getElementById('ventilation-classification').textContent = ventilationStatus;
    }

    function setupSliderEvents() {
        const rrSlider = document.getElementById('respiratory-rate');
        const tvSlider = document.getElementById('tidal-volume');
        
        function updateFromSliders() {
            const rr = parseInt(rrSlider.value);
            const vt = parseInt(tvSlider.value) / 1000; // Convert to L
            
            highlightPoint(rr, vt);
            updateInfoBox(rr, vt, rr * vt);
        }
        
        rrSlider.addEventListener('input', updateFromSliders);
        tvSlider.addEventListener('input', updateFromSliders);
    }

    createGraph();
    setupSliderEvents();
});
