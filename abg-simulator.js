// Configuration Constants
const CIRCLE_RADIUS = 2;
const NUM_CIRCLE_POINTS = 20;
const DEBOUNCE_TIME = 50;
const GRID_SIZE = 50;

// Initialize the graph with cached elements
let graphData = {
    pCO2Lines: [],
    colorMap: null, // Will be initialized once
    currentPoint: { x: [7.4], y: [24], text: ["PaCO₂: 40"] },
    circlePoints: []
};

// DOM elements
const paco2Slider = document.getElementById('paco2');
const hco3Slider = document.getElementById('hco3');
const paco2Value = document.getElementById('paco2-value');
const hco3Value = document.getElementById('hco3-value');
const phValue = document.getElementById('ph-value');
const classificationElement = document.getElementById('classification');

// Event listeners with debouncing
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

paco2Slider.addEventListener('input', debounce(update, DEBOUNCE_TIME));
hco3Slider.addEventListener('input', debounce(update, DEBOUNCE_TIME));

// Initialize
initializeGraph();
update();

// pH calculation (optimized to use constants)
const pK = 6.1;
const PCO2_CONVERSION = 0.03;

function calculatePH(paco2, hco3) {
    return pK + Math.log10(hco3 / (PCO2_CONVERSION * paco2));
}

// Classification logic with color map
const CLASSIFICATION_COLORS = {
    'Normal': 'green',
    'Uncompensated Respiratory Acidosis': 'darkorange',
    'Partially Compensated Respiratory Acidosis': 'orange',
    'Mixed Acidosis': 'red',
    'Uncompensated Metabolic Acidosis': 'gold',
    'Partially Compensated Metabolic Acidosis': 'yellow',
    'Uncompensated Respiratory Alkalosis': 'blue',
    'Partially Compensated Respiratory Alkalosis': 'lightblue',
    'Mixed Alkalosis': 'purple',
    'Uncompensated Metabolic Alkalosis': 'deepskyblue',
    'Partially Compensated Metabolic Alkalosis': 'cyan',
    'Fully Compensated Respiratory Acidosis': 'darkgreen',
    'Fully Compensated Metabolic Acidosis': 'limegreen',
    'Fully Compensated Metabolic Alkalosis': 'mediumseagreen',
    'Fully Compensated Respiratory Alkalosis': 'springgreen',
    'Undefined Acidosis': 'lightgray',
    'Undefined Alkalosis': 'lightgray',
    'Undefined': 'gray'
};

function classifyABG(pH, PaCO2, HCO3) {
    // Define the normal ranges
    const normalPaCO2 = PaCO2 >= 35 && PaCO2 <= 45;
    const normalHCO3 = HCO3 >= 22 && HCO3 <= 26;
    const normalPH = pH >= 7.35 && pH <= 7.45;

    // Acidosis conditions (pH < 7.35)
    if (pH < 7.35) {
        if (PaCO2 > 45) {
            if (HCO3 < 22) return ["Mixed Acidosis", CLASSIFICATION_COLORS['Mixed Acidosis']];
            if (HCO3 > 26) return ["Partially Compensated Respiratory Acidosis", CLASSIFICATION_COLORS['Partially Compensated Respiratory Acidosis']];
            return ["Uncompensated Respiratory Acidosis", CLASSIFICATION_COLORS['Uncompensated Respiratory Acidosis']];
        }
        if (HCO3 < 22) {
            if (PaCO2 < 35) return ["Partially Compensated Metabolic Acidosis", CLASSIFICATION_COLORS['Partially Compensated Metabolic Acidosis']];
            if (normalPaCO2) return ["Uncompensated Metabolic Acidosis", CLASSIFICATION_COLORS['Uncompensated Metabolic Acidosis']];
            return ["Undefined Acidosis", CLASSIFICATION_COLORS['Undefined Acidosis']];
        }
        return ["Undefined Acidosis", CLASSIFICATION_COLORS['Undefined Acidosis']];
    }
    
    // Alkalosis conditions (pH > 7.45)
    if (pH > 7.45) {
        if (PaCO2 < 35) {
            if (HCO3 < 22) return ["Partially Compensated Respiratory Alkalosis", CLASSIFICATION_COLORS['Partially Compensated Respiratory Alkalosis']];
            if (HCO3 > 26) return ["Mixed Alkalosis", CLASSIFICATION_COLORS['Mixed Alkalosis']];
            return ["Uncompensated Respiratory Alkalosis", CLASSIFICATION_COLORS['Uncompensated Respiratory Alkalosis']];
        }
        if (HCO3 > 26) {
            if (PaCO2 > 45) return ["Partially Compensated Metabolic Alkalosis", CLASSIFICATION_COLORS['Partially Compensated Metabolic Alkalosis']];
            if (normalPaCO2) return ["Uncompensated Metabolic Alkalosis", CLASSIFICATION_COLORS['Uncompensated Metabolic Alkalosis']];
            return ["Undefined Alkalosis", CLASSIFICATION_COLORS['Undefined Alkalosis']];
        }
        return ["Undefined Alkalosis", CLASSIFICATION_COLORS['Undefined Alkalosis']];
    }
    
    // Normal pH range (7.35-7.45)
    // Fully compensated conditions
    if (pH >= 7.35 && pH <= 7.399) {
        if (PaCO2 > 45 && HCO3 > 26) return ["Fully Compensated Respiratory Acidosis", CLASSIFICATION_COLORS['Fully Compensated Respiratory Acidosis']];
        if (PaCO2 < 35 && HCO3 < 22) return ["Fully Compensated Metabolic Acidosis", CLASSIFICATION_COLORS['Fully Compensated Metabolic Acidosis']];
    }
    if (pH >= 7.401 && pH <= 7.45) {
        if (PaCO2 > 45 && HCO3 > 26) return ["Fully Compensated Metabolic Alkalosis", CLASSIFICATION_COLORS['Fully Compensated Metabolic Alkalosis']];
        if (PaCO2 < 35 && HCO3 < 22) return ["Fully Compensated Respiratory Alkalosis", CLASSIFICATION_COLORS['Fully Compensated Respiratory Alkalosis']];
    }
    
    // Normal condition
    if (normalPaCO2 && normalHCO3) return ["Normal", CLASSIFICATION_COLORS['Normal']];
    
    return ["Undefined", CLASSIFICATION_COLORS['Undefined']];
}

function calculatePossiblePaCO2HCO3(pH, PaCO2, HCO3, radius = CIRCLE_RADIUS, num_points = NUM_CIRCLE_POINTS) {
    const angles = Array.from({length: num_points}, (_, i) => 2 * Math.PI * i / num_points);
    const dHCO3_values = angles.map(angle => HCO3 + radius * Math.sin(angle));
    const dPaCO2_values = angles.map(angle => PaCO2 + radius * Math.cos(angle));
    
    const pH_values = dHCO3_values.map((hco3, i) => {
        return pK + Math.log10(hco3 / (PCO2_CONVERSION * dPaCO2_values[i]));
    });
    
    return { pH_values, hco3_values: dHCO3_values };
}

function createPCO2Lines() {
    const lines = [];
    
    for (let PaCO2 = 10; PaCO2 <= 100; PaCO2 += 10) {
        const hco3_values = Array.from({length: 100}, (_, i) => 5 + (45 * i / 99));
        const pH_values = hco3_values.map(hco3 => pK + Math.log10(hco3 / (PaCO2 * PCO2_CONVERSION)));
        
        lines.push({
            x: pH_values,
            y: hco3_values,
            mode: 'lines',
            line: { color: 'black', width: 1, dash: 'dot' },
            opacity: 0.5,
            showlegend: false,
            hoverinfo: 'none'
        });
        
        // Add label
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

function createColorMap() {
    if (graphData.colorMap) return graphData.colorMap;
    
    const pHRange = { min: 6.2, max: 8.4 };
    const HCO3Range = { min: 5, max: 50 };
    
    const z = [];
    const pHValues = [];
    const HCO3Values = [];
    
    for (let i = 0; i < GRID_SIZE; i++) {
        const pH = pHRange.min + (pHRange.max - pHRange.min) * i / (GRID_SIZE - 1);
        pHValues.push(pH);
        const row = [];
        
        for (let j = 0; j < GRID_SIZE; j++) {
            const HCO3 = HCO3Range.min + (HCO3Range.max - HCO3Range.min) * j / (GRID_SIZE - 1);
            if (i === 0) HCO3Values.push(HCO3);
            
            const PaCO2 = HCO3 / (Math.pow(10, pH - pK) * PCO2_CONVERSION);
            const [classification] = classifyABG(pH, PaCO2, HCO3);
            row.push(CLASSIFICATION_COLORS[classification]);
        }
        z.push(row);
    }
    
    graphData.colorMap = [{
        x: pHValues,
        y: HCO3Values,
        z: z,
        type: 'heatmap',
        colorscale: Object.entries(CLASSIFICATION_COLORS).map(([name, color], i, arr) => [i/arr.length, color]),
        showscale: false,
        hoverinfo: 'none',
        opacity: 0.6
    }];
    
    return graphData.colorMap;
}

function initializeGraph() {
    graphData.pCO2Lines = createPCO2Lines();
    createColorMap(); // Initialize color map (cached)
    
    // Create circle points (will be updated)
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
    
    // Combine all traces
    const traces = [
        ...graphData.colorMap,
        ...graphData.pCO2Lines,
        ...graphData.circlePoints,
        graphData.currentPoint
    ];
    
    // Layout configuration
    const layout = {
        title: 'ABG Simulator (pH vs HCO₃⁻ with PaCO₂ isolines)',
        xaxis: { title: 'pH', range: [6.2, 8.4] },
        yaxis: { title: 'HCO₃⁻ (mEq/L)', range: [5, 50] },
        margin: { t: 50, b: 50, l: 50, r: 50 },
        hovermode: 'closest'
    };
    
    // Create the plot
    Plotly.newPlot('graph', traces, layout);
}

function update() {
    // Get current values
    const PaCO2 = parseFloat(paco2Slider.value);
    const HCO3 = parseFloat(hco3Slider.value);
    
    // Update displayed values
    paco2Value.textContent = PaCO2;
    hco3Value.textContent = HCO3;
    
    // Calculate pH
    const pH = calculatePH(PaCO2, HCO3);
    phValue.textContent = pH.toFixed(2);
    
    // Classify ABG with enhanced display
    const [classification, color] = classifyABG(pH, PaCO2, HCO3);
    classificationElement.innerHTML = `
        <strong style="color:${color}">${classification}</strong><br>
        <small>pH: ${pH.toFixed(2)} | PaCO₂: ${PaCO2} | HCO₃⁻: ${HCO3}</small>
    `;
    
    // Calculate circle points
    const circlePoints = calculatePossiblePaCO2HCO3(pH, PaCO2, HCO3);
    
    // Update only the dynamic elements of the graph
    Plotly.react('graph', {
        data: [
            ...graphData.colorMap,
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