// ======================
// INITIALIZATION
// ======================

const paco2Slider = document.getElementById('paco2');
const hco3Slider = document.getElementById('hco3');
const paco2Value = document.getElementById('paco2-value');
const hco3Value = document.getElementById('hco3-value');
const phValue = document.getElementById('ph-value');
const classificationElement = document.getElementById('classification');

const graphData = {
    pCO2Lines: [],
    colorMap: [],
    currentPoint: { x: 7.4, y: 24, text: "PaCO₂: 40" },
    circlePoints: []
};

// ======================
// CORE CALCULATION FUNCTIONS
// ======================

function calculatePH(paco2, hco3) {const pK = 6.1;const PCO2_conversion = 0.03;return pK + Math.log10(hco3 / (PCO2_conversion * paco2));}

function classifyABG(pH, PaCO2, HCO3) {
    const normalPaCO2 = PaCO2 >= 35 && PaCO2 <= 45;
    const normalHCO3 = HCO3 >= 22 && HCO3 <= 26;
    if (pH < 7.35) {
        if (PaCO2 > 45) {
            if (HCO3 < 22) return "Mixed Acidosis";
            if (HCO3 > 26) return "Partially Compensated Respiratory Acidosis";
            return "Uncompensated Respiratory Acidosis";
        }
        if (HCO3 < 22) {
            if (PaCO2 < 35) return "Partially Compensated Metabolic Acidosis";
            if (normalPaCO2) return "Uncompensated Metabolic Acidosis";
            return "Undefined Acidosis";
        }
        return "Undefined Acidosis";
    }
    if (pH > 7.45) {
        if (PaCO2 < 35) {
            if (HCO3 < 22) return "Partially Compensated Respiratory Alkalosis";
            if (HCO3 > 26) return "Mixed Alkalosis";
            return "Uncompensated Respiratory Alkalosis";
        }
        if (HCO3 > 26) {
            if (PaCO2 > 45) return "Partially Compensated Metabolic Alkalosis";
            if (normalPaCO2) return "Uncompensated Metabolic Alkalosis";
            return "Undefined Alkalosis";
        }
        return "Undefined Alkalosis";
    }
    if (pH >= 7.35 && pH <= 7.399) {
        if (PaCO2 > 45 && HCO3 > 26) return "Fully Compensated Respiratory Acidosis";
        if (PaCO2 < 35 && HCO3 < 22) return "Fully Compensated Metabolic Acidosis";
    }
    if (pH >= 7.401 && pH <= 7.45) {
        if (PaCO2 > 45 && HCO3 > 26) return "Fully Compensated Metabolic Alkalosis";
        if (PaCO2 < 35 && HCO3 < 22) return "Fully Compensated Respiratory Alkalosis";
    }
    if (normalPaCO2 && normalHCO3) return "Normal";
    return "Undefined";
}

function getClassificationColor(classification) {
    const colorMap = {
        "Mixed Acidosis": 'rgba(255, 0, 0, 0.5)',
        "Partially Compensated Respiratory Acidosis": 'rgba(255, 165, 0, 0.5)',
        "Uncompensated Respiratory Acidosis": 'rgba(255, 140, 0, 0.5)',
        "Partially Compensated Metabolic Acidosis": 'rgba(255, 255, 0, 0.5)',
        "Uncompensated Metabolic Acidosis": 'rgba(255, 215, 0, 0.5)',
        "Partially Compensated Respiratory Alkalosis": 'rgba(173, 216, 230, 0.5)',
        "Mixed Alkalosis": 'rgba(128, 0, 128, 0.5)',
        "Uncompensated Respiratory Alkalosis": 'rgba(0, 0, 255, 0.5)',
        "Partially Compensated Metabolic Alkalosis": 'rgba(0, 255, 255, 0.5)',
        "Uncompensated Metabolic Alkalosis": 'rgba(0, 191, 255, 0.5)',
        "Fully Compensated Respiratory Acidosis": 'rgba(0, 100, 0, 0.5)',
        "Fully Compensated Metabolic Acidosis": 'rgba(50, 205, 50, 0.5)',
        "Fully Compensated Metabolic Alkalosis": 'rgba(60, 179, 113, 0.5)',
        "Fully Compensated Respiratory Alkalosis": 'rgba(0, 250, 154, 0.5)',
        "Normal": 'rgba(0, 128, 0, 0.5)',
        "Undefined": 'rgba(128, 128, 128, 0.5)'
    };
    return colorMap[classification] || 'rgba(128, 128, 128, 0.5)';
}

// ======================
// GRAPHING FUNCTIONS
// ======================

function createPCO2Lines() {
    const pK = 6.1;
    const PCO2_conversion = 0.03;
    const lines = [];
    for (let PaCO2 = 10; PaCO2 <= 100; PaCO2 += 10) {const hco3_values = Array.from({length: 100}, (_, i) => 5 + (45 * i / 99));const pH_values = hco3_values.map(hco3 => pK + Math.log10(hco3 / (PaCO2 * PCO2_conversion)));
        lines.push({
            x: pH_values,
            y: hco3_values,
            mode: 'lines',
            line: { color: 'black', width: 1, dash: 'dot' },
            opacity: 0.5,
            showlegend: false,
            hoverinfo: 'none'
        });
        lines.push({
            x: [pH_values[pH_values.length - 1]],
            y: [hco3_values[hco3_values.length - 1]],
            mode: 'text',
            text: [PaCO2.toString()],
            textposition: 'top right',
            showlegend: false,
            hoverinfo: 'none'
        });
    }
    return lines;
}

// ======================
// UPDATED COLOR MAP FUNCTION
// ======================

function createColorMap() {
    const gridSize = 150;
    const pHRange = { min: 6.8, max: 7.8 };
    const HCO3Range = { min: 5, max: 50 };
    const pHValues = [];
    const HCO3Values = [];
    const colors = [];
    for (let i = 0; i < gridSize; i++) {
        const pH = pHRange.min + (pHRange.max - pHRange.min) * i / (gridSize - 1);
        pHValues.push(pH);
        for (let j = 0; j < gridSize; j++) {
            const HCO3 = HCO3Range.min + (HCO3Range.max - HCO3Range.min) * j / (gridSize - 1);
            if (i === 0) HCO3Values.push(HCO3);
            const PaCO2 = HCO3 / (Math.pow(10, pH - 6.1) * 0.03);
            const classification = classifyABG(pH, PaCO2, HCO3);
            const color = getClassificationColor(classification);
            colors.push(color);
        }
    }
    return {
        x: pHValues,
        y: HCO3Values,
        z: [colors],
        type: 'heatmap',
        autocolorscale: false,
        showscale: false,
        hoverinfo: 'none',
        opacity: 0.6,
        zsmooth: 'best'
    };
}

// ======================
// MODIFIED INITIALIZATION
// ======================

function initializeGraph() {
    graphData.pCO2Lines = createPCO2Lines();
    graphData.colorMap = createClassificationBackground(); // This creates the colored plot background
    
    const circlePoints = calculatePossiblePaCO2HCO3(7.4, 40, 24);
    graphData.circlePoints = [{
        x: circlePoints.pH_values,
        y: circlePoints.hco3_values,
        mode: 'lines',
        line: { color: 'red', width: 2 },
        fill: 'toself',
        fillcolor: 'rgba(255, 0, 0, 0.2)',
        showlegend: false,
        hoverinfo: 'none'
    }];
    
    graphData.currentPoint = {
        x: [7.4],
        y: [24],
        mode: 'markers',
        marker: { size: 10, color: 'red' },
        text: ["PaCO₂: 40"],
        hoverinfo: 'text',
        showlegend: false
    };
    
    // Ensure proper layering: background first, then lines, then points
    const traces = [
        graphData.colorMap,    // Colored background first
        ...graphData.pCO2Lines, // Then isolines
        ...graphData.circlePoints, // Then confidence circle
        graphData.currentPoint   // Finally the point marker
    ];
    
    const layout = {
        title: 'ABG Simulator (pH vs HCO₃⁻ with PaCO₂ isolines)',
        xaxis: { title: 'pH', range: [6.2, 8.4] },
        yaxis: { title: 'HCO₃⁻ (mEq/L)', range: [5, 50] },
        margin: { t: 50, b: 50, l: 50, r: 50 },
        hovermode: 'closest',
        plot_bgcolor: 'rgba(0,0,0,0)' // Make plot background transparent
    };
    
    Plotly.newPlot('graph', traces, layout);
}

function update() {
    const PaCO2 = parseFloat(paco2Slider.value);
    const HCO3 = parseFloat(hco3Slider.value);
    paco2Value.textContent = PaCO2;
    hco3Value.textContent = HCO3;
    const pH = calculatePH(PaCO2, HCO3);
    phValue.textContent = pH.toFixed(2);
    const classification = classifyABG(pH, PaCO2, HCO3);
    classificationElement.textContent = classification;
    classificationElement.style.color = 'black'
    classificationElement.style.backgroundColor = getClassificationColor(classification).replace('0.5', '0.3');
    const circlePoints = calculatePossiblePaCO2HCO3(pH, PaCO2, HCO3);
    Plotly.react('graph', {
        data: [
            graphData.colorMap,
            ...graphData.pCO2Lines,
            {
                x: circlePoints.pH_values,
                y: circlePoints.hco3_values,
                mode: 'lines',
                line: { color: 'red', width: 2 },
                fill: 'toself',
                fillcolor: 'rgba(255, 0, 0, 0.2)',
                showlegend: false,
                hoverinfo: 'none'
            },
            {
                x: [pH],
                y: [HCO3],
                mode: 'markers',
                marker: { size: 10, color: 'red' },
                text: [`PaCO₂: ${PaCO2}`],
                hoverinfo: 'text',
                showlegend: false
            }
        ],
        layout: {
            xaxis: { range: [6.2, 8.4] },
            yaxis: { range: [5, 50] }
        }
    });
}

// ======================
// UPDATED COLOR MAPPING FOR PLOT BACKGROUND
// ======================

function createClassificationBackground() {
    const gridSize = 150; // Higher resolution for smoother colors
    const pHRange = { min: 6.8, max: 7.8 };
    const HCO3Range = { min: 5, max: 50 };

    const pHValues = [];
    const HCO3Values = [];
    const colors = [];

    // Create a grid of points
    for (let i = 0; i < gridSize; i++) {
        const pH = pHRange.min + (pHRange.max - pHRange.min) * i / (gridSize - 1);
        pHValues.push(pH);
        
        for (let j = 0; j < gridSize; j++) {
            const HCO3 = HCO3Range.min + (HCO3Range.max - HCO3Range.min) * j / (gridSize - 1);
            if (i === 0) HCO3Values.push(HCO3);
            
            // Calculate corresponding PaCO2 for this pH and HCO3
            const PaCO2 = HCO3 / (Math.pow(10, pH - 6.1) * 0.03);
            
            // Get classification and its color
            const classification = classifyABG(pH, PaCO2, HCO3);
            const color = getClassificationColor(classification);
            colors.push(color);
        }
    }

    return {
        x: pHValues,
        y: HCO3Values,
        z: [colors], // Note: z must be a 2D array
        type: 'heatmap',
        colorscale: createCustomColorscale(),
        showscale: false,
        hoverinfo: 'none',
        opacity: 0.6, // Semi-transparent to see lines underneath
        zsmooth: 'best'
    };
}

function createCustomColorscale() {
    return [
        [0, 'rgba(255, 0, 0, 0.6)'],       // Mixed Acidosis
        [0.1, 'rgba(255, 165, 0, 0.6)'],    // Partially Compensated Respiratory Acidosis
        [0.2, 'rgba(255, 140, 0, 0.6)'],    // Uncompensated Respiratory Acidosis
        [0.3, 'rgba(255, 255, 0, 0.6)'],    // Partially Compensated Metabolic Acidosis
        [0.4, 'rgba(255, 215, 0, 0.6)'],    // Uncompensated Metabolic Acidosis
        [0.5, 'rgba(173, 216, 230, 0.6)'],  // Partially Compensated Respiratory Alkalosis
        [0.6, 'rgba(128, 0, 128, 0.6)'],    // Mixed Alkalosis
        [0.7, 'rgba(0, 0, 255, 0.6)'],      // Uncompensated Respiratory Alkalosis
        [0.8, 'rgba(0, 255, 255, 0.6)'],    // Partially Compensated Metabolic Alkalosis
        [0.9, 'rgba(0, 191, 255, 0.6)'],    // Uncompensated Metabolic Alkalosis
        [1.0, 'rgba(0, 128, 0, 0.6)']       // Normal
    ];
}


// ======================
// UTILITY FUNCTIONS
// ======================

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function calculatePossiblePaCO2HCO3(pH, PaCO2, HCO3, radius = 2, num_points = 20) {
    const pK = 6.1;
    const PCO2_conversion = 0.03;
    const angles = Array.from({length: num_points}, (_, i) => 2 * Math.PI * i / num_points);
    const dHCO3_values = angles.map(angle => HCO3 + radius * Math.sin(angle));
    const dPaCO2_values = angles.map(angle => PaCO2 + radius * Math.cos(angle));
    const pH_values = dHCO3_values.map((hco3, i) => pK + Math.log10(hco3 / (PCO2_conversion * dPaCO2_values[i])));
    return { pH_values, hco3_values: dHCO3_values };
}

// ======================
// INITIALIZATION
// ======================

paco2Slider.addEventListener('input', debounce(update, 50));
hco3Slider.addEventListener('input', debounce(update, 50));

initializeGraph();
update();
