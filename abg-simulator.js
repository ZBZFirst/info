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

const classificationMap = {
    0: { label: "Mixed Acidosis", color: 'rgba(255, 0, 0, 0.5)' },
    1: { label: "Partially Compensated Respiratory Acidosis", color: 'rgba(255, 165, 0, 0.5)' },
    2: { label: "Uncompensated Respiratory Acidosis", color: 'rgba(255, 140, 0, 0.5)' },
    3: { label: "Partially Compensated Metabolic Acidosis", color: 'rgba(255, 255, 0, 0.5)' },
    4: { label: "Uncompensated Metabolic Acidosis", color: 'rgba(255, 215, 0, 0.5)' },
    5: { label: "Partially Compensated Respiratory Alkalosis", color: 'rgba(173, 216, 230, 0.5)' },
    6: { label: "Mixed Alkalosis", color: 'rgba(128, 0, 128, 0.5)' },
    7: { label: "Uncompensated Respiratory Alkalosis", color: 'rgba(0, 0, 255, 0.5)' },
    8: { label: "Partially Compensated Metabolic Alkalosis", color: 'rgba(0, 255, 255, 0.5)' },
    9: { label: "Uncompensated Metabolic Alkalosis", color: 'rgba(0, 191, 255, 0.5)' },
    10: { label: "Fully Compensated Respiratory Acidosis", color: 'rgba(0, 100, 0, 0.5)' },
    11: { label: "Fully Compensated Metabolic Acidosis", color: 'rgba(50, 205, 50, 0.5)' },
    12: { label: "Fully Compensated Metabolic Alkalosis", color: 'rgba(60, 179, 113, 0.5)' },
    13: { label: "Fully Compensated Respiratory Alkalosis", color: 'rgba(0, 250, 154, 0.5)' },
    14: { label: "Normal", color: 'rgba(0, 128, 0, 0.5)' },
    15: { label: "Undefined", color: 'rgba(128, 128, 128, 0.5)' }
};

function classifyABG(pH, PaCO2, HCO3) {
    const normalPaCO2 = PaCO2 >= 35 && PaCO2 <= 45;
    const normalHCO3 = HCO3 >= 22 && HCO3 <= 26;
    if (pH < 7.35) {
        if (PaCO2 > 45) {if (HCO3 < 22) return 0;if (HCO3 > 26) return 1;return 2;}
        if (HCO3 < 22) {if (PaCO2 < 35) return 3;if (normalPaCO2) return 4;return 15;}
        return 15;
    }
    if (pH > 7.45) {
        if (PaCO2 < 35) {if (HCO3 < 22) return 5;if (HCO3 > 26) return 6;return 7;}
        if (HCO3 > 26) {if (PaCO2 > 45) return 8;if (normalPaCO2) return 9;return 15;}
        return 15;
    }
    if (pH >= 7.35 && pH <= 7.399) {if (PaCO2 > 45 && HCO3 > 26) return 10;if (PaCO2 < 35 && HCO3 < 22) return 11;}
    if (pH >= 7.401 && pH <= 7.45) {if (PaCO2 > 45 && HCO3 > 26) return 12;if (PaCO2 < 35 && HCO3 < 22) return 13;}
    if (normalPaCO2 && normalHCO3) return 14;
    return 15; // Undefined
}

function getClassificationInfo(id) {
    return classificationMap[id] || classificationMap[15]; // fallback to "Undefined"
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
        plot_bgcolor: 'rgba(0,0,0,0)',
        showlegend: true,
        legend: {
            orientation: 'h',
            y: -0.2
    };
    
    Plotly.newPlot('graph', traces, layout);
}

function renderGraph(pH, PaCO2, HCO3) {
    const classificationId = classifyABG(pH, PaCO2, HCO3);
    const circlePoints = calculatePossiblePaCO2HCO3(pH, PaCO2, HCO3);
    
    const traces = [
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
    ];

    const layout = {
        xaxis: { title: 'pH', range: [6.2, 8.4] },
        yaxis: { title: 'HCO₃⁻ (mEq/L)', range: [5, 50] },
        margin: { t: 50, b: 50, l: 50, r: 50 },
        hovermode: 'closest'
    };

    Plotly.react('graph', traces, layout);
}

function getClassificationColor(classificationId) {
    return getClassificationInfo(classificationId).color;
}

function update() {
    const PaCO2 = parseFloat(paco2Slider.value);
    const HCO3 = parseFloat(hco3Slider.value);
    const pH = calculatePH(PaCO2, HCO3);

    paco2Value.textContent = PaCO2;
    hco3Value.textContent = HCO3;
    phValue.textContent = pH.toFixed(2);

    const classificationId = classifyABG(pH, PaCO2, HCO3);
    const classificationInfo = getClassificationInfo(classificationId); // Get the full info object
    
    // Update to show the label instead of the ID
    classificationElement.textContent = classificationInfo.label;
    classificationElement.style.backgroundColor = classificationInfo.color.replace('0.5', '0.3');

    renderGraph(pH, PaCO2, HCO3);
}


// ======================
// UPDATED COLOR MAPPING FOR PLOT BACKGROUND
// ======================

function createClassificationBackground() {
    const { pHValues, HCO3Values, zColors } = generateClassificationGrid();
    return {
        x: pHValues,
        y: HCO3Values,
        z: zColors,
        type: 'heatmap',
        showscale: false,
        hoverinfo: 'none',
        opacity: 0.6,
        zsmooth: 'best'
    };
}

function generateClassificationGrid(gridSize = 150) {
    const pHRange = { min: 6.8, max: 7.8 };
    const HCO3Range = { min: 5, max: 50 };

    const pHValues = Array.from({ length: gridSize }, (_, i) =>
        pHRange.min + (pHRange.max - pHRange.min) * i / (gridSize - 1)
    );
    const HCO3Values = Array.from({ length: gridSize }, (_, j) =>
        HCO3Range.min + (HCO3Range.max - HCO3Range.min) * j / (gridSize - 1)
    );

    const zColors = [];
    for (let j = 0; j < gridSize; j++) {
        const row = [];
        for (let i = 0; i < gridSize; i++) {
            const pH = pHValues[i];
            const HCO3 = HCO3Values[j];
            const PaCO2 = HCO3 / (Math.pow(10, pH - 6.1) * 0.03);
            const classId = classifyABG(pH, PaCO2, HCO3);
            row.push(getClassificationColor(classId));
        }
        zColors.push(row);
    }

    return { pHValues, HCO3Values, zColors };
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
