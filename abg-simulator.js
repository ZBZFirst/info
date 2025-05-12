// ======================
// INITIALIZATION
// ======================

const paco2Slider = document.getElementById('paco2');
const hco3Slider = document.getElementById('hco3');
const paco2Value = document.getElementById('paco2-value');
const hco3Value = document.getElementById('hco3-value');
const phValue = document.getElementById('ph-value');
const classificationElement = document.getElementById('classification');
const dynamicEquationElement = document.getElementById('dynamic-equation');

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
// LAYOUT CONFIGURATION (defined once, used everywhere)
// ======================
const initialLayout = {
    title: 'ABG Simulator (pH vs HCO₃⁻ with PaCO₂ isolines)',
    xaxis: { title: 'pH', range: [6.8, 7.8] },
    yaxis: { title: 'HCO₃⁻ (mEq/L)', range: [5, 50] },
    margin: { t: 50, b: 50, l: 50, r: 50 },
    hovermode: 'closest',
    plot_bgcolor: 'rgba(0,0,0,0)',
    showlegend: true,
    legend: {
        orientation: 'h',
        y: -0.2
    }
};

function initializeGraph() {
    // Initialize graph data structures
    graphData.pCO2Lines = createPCO2Lines();
    graphData.colorMap = createClassificationBackground();
    
    // Create initial circle points
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
    
    // Create initial point marker
    graphData.currentPoint = {
        x: [7.4],
        y: [24],
        mode: 'markers',
        marker: { size: 10, color: 'red' },
        text: ["PaCO₂: 40"],
        hoverinfo: 'text',
        showlegend: false
    };
    
    // Create traces array (order matters for layering)
    const traces = [
        graphData.colorMap,        // Background first
        ...graphData.pCO2Lines,    // Then isolines
        ...graphData.circlePoints, // Then confidence circle
        graphData.currentPoint     // Finally the point marker
    ];
    
    // Use the predefined layout
    Plotly.newPlot('graph', traces, initialLayout);
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

    // Get current zoom state before updating
    const graphDiv = document.getElementById('graph');
    const currentLayout = graphDiv._fullLayout || {};
    
    // Update while preserving zoom
    Plotly.react('graph', traces, {
        ...initialLayout,  // Start with base layout
        xaxis: {
            ...initialLayout.xaxis,
            range: currentLayout.xaxis?.range || initialLayout.xaxis.range
        },
        yaxis: {
            ...initialLayout.yaxis,
            range: currentLayout.yaxis?.range || initialLayout.yaxis.range
        }
    });
}

function getClassificationColor(classificationId) {
    return getClassificationInfo(classificationId).color;
}

function update() {
    const PaCO2 = parseFloat(paco2Slider.value);
    const HCO3 = parseFloat(hco3Slider.value);
    const pH = calculatePH(PaCO2, HCO3);

    // Update slider value displays
    paco2Value.textContent = PaCO2;
    hco3Value.textContent = HCO3;
    phValue.textContent = pH.toFixed(2);

    // Update dynamic equation
    updateDynamicEquation(HCO3, PaCO2, pH);

    // Update classification
    const classificationId = classifyABG(pH, PaCO2, HCO3);
    const classificationInfo = getClassificationInfo(classificationId);
    classificationElement.textContent = classificationInfo.label;
    classificationElement.style.backgroundColor = classificationInfo.color.replace('0.5', '0.3');

    // Update graph
    renderGraph(pH, PaCO2, HCO3);
    
    // Explain the classification logic
    explainClassification(pH, PaCO2, HCO3);
}

function updateDynamicEquation(HCO3, PaCO2, pH) {
    dynamicEquationElement.innerHTML = `
        \\[ \\text{pH} = 6.1 + \\log\\left(\\frac{${HCO3}}{0.03 \\times ${PaCO2}}\\right) = ${pH.toFixed(2)} \\]
    `;
    
    // Reprocess MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([dynamicEquationElement]).catch(err => {
            console.error('MathJax typesetting error:', err);
        });
    }
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
        colorscale: generateColorScale(), // Add this colorscale
        showscale: false,
        hoverinfo: 'none',
        opacity: 0.6,
        zsmooth: 'best'
    };
}

function generateColorScale() {
    const scale = [];
    for (const [id, info] of Object.entries(classificationMap)) {
        scale.push([id/15, info.color]); // Normalize IDs to 0-1 range
    }
    return scale;
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
            row.push(classId); // Push the ID instead of color
        }
        zColors.push(row);
    }

    return { pHValues, HCO3Values, zColors };
}

// ======================
// CLASSIFICATION EXPLANATION
// ======================

function explainClassification(pH, PaCO2, HCO3) {
    const stepsElement = document.getElementById('classification-steps');
    stepsElement.innerHTML = ''; // Clear previous steps
    
    const normalPaCO2 = PaCO2 >= 35 && PaCO2 <= 45;
    const normalHCO3 = HCO3 >= 22 && HCO3 <= 26;
    const normalpH = pH >= 7.35 && pH <= 7.45;
    
    // Create step elements
    const step1 = document.createElement('div');
    step1.className = 'logic-step';
    step1.innerHTML = `<strong>Step 1: Check pH</strong><br>Current pH: ${pH.toFixed(2)} (${pH < 7.35 ? 'Acidemia' : pH > 7.45 ? 'Alkalemia' : 'Normal pH'})`;
    
    const step2 = document.createElement('div');
    step2.className = 'logic-step';
    step2.innerHTML = `<strong>Step 2: Check primary disorder</strong><br>PaCO₂: ${PaCO2} (${normalPaCO2 ? 'Normal' : PaCO2 > 45 ? 'High → Respiratory Acidosis' : 'Low → Respiratory Alkalosis'})<br>
                       HCO₃⁻: ${HCO3} (${normalHCO3 ? 'Normal' : HCO3 < 22 ? 'Low → Metabolic Acidosis' : 'High → Metabolic Alkalosis'})`;
    
    const step3 = document.createElement('div');
    step3.className = 'logic-step';
    
    const classificationId = classifyABG(pH, PaCO2, HCO3);
    const classificationInfo = getClassificationInfo(classificationId);
    
    step3.innerHTML = `<strong>Step 3: Determine compensation</strong><br>${getCompensationExplanation(pH, PaCO2, HCO3, classificationId)}`;
    
    const conclusion = document.createElement('div');
    conclusion.className = 'logic-step active';
    conclusion.innerHTML = `<strong>Conclusion:</strong> ${classificationInfo.label}`;
    
    // Append all steps
    stepsElement.appendChild(step1);
    stepsElement.appendChild(step2);
    stepsElement.appendChild(step3);
    stepsElement.appendChild(conclusion);
    
    // Highlight active steps based on pH
    if (pH < 7.35) {
        step1.classList.add('active');
        step2.classList.add('active');
        if (PaCO2 > 45 || HCO3 < 22) step3.classList.add('active');
    } else if (pH > 7.45) {
        step1.classList.add('active');
        step2.classList.add('active');
        if (PaCO2 < 35 || HCO3 > 26) step3.classList.add('active');
    } else {
        step1.classList.add('active');
        if (!normalPaCO2 || !normalHCO3) {
            step2.classList.add('active');
            step3.classList.add('active');
        }
    }
}

function getCompensationExplanation(pH, PaCO2, HCO3, classificationId) {
    const normalPaCO2 = PaCO2 >= 35 && PaCO2 <= 45;
    const normalHCO3 = HCO3 >= 22 && HCO3 <= 26;
    
    switch(classificationId) {
        case 0: return "Mixed Acidosis: Both respiratory (high PaCO₂) and metabolic (low HCO₃⁻) acidosis present";
        case 1: return "Partially Compensated Respiratory Acidosis: High PaCO₂ with elevated HCO₃⁻ but pH still acidic";
        case 2: return "Uncompensated Respiratory Acidosis: High PaCO₂ without metabolic compensation";
        case 3: return "Partially Compensated Metabolic Acidosis: Low HCO₃⁻ with respiratory compensation but pH still acidic";
        case 4: return "Uncompensated Metabolic Acidosis: Low HCO₃⁻ without respiratory compensation";
        case 5: return "Partially Compensated Respiratory Alkalosis: Low PaCO₂ with decreased HCO₃⁻ but pH still alkaline";
        case 6: return "Mixed Alkalosis: Both respiratory (low PaCO₂) and metabolic (high HCO₃⁻) alkalosis present";
        case 7: return "Uncompensated Respiratory Alkalosis: Low PaCO₂ without metabolic compensation";
        case 8: return "Partially Compensated Metabolic Alkalosis: High HCO₃⁻ with respiratory compensation but pH still alkaline";
        case 9: return "Uncompensated Metabolic Alkalosis: High HCO₃⁻ without respiratory compensation";
        case 10: return "Fully Compensated Respiratory Acidosis: Chronic respiratory acidosis with metabolic compensation bringing pH to low-normal range";
        case 11: return "Fully Compensated Metabolic Acidosis: Metabolic acidosis with respiratory compensation bringing pH to low-normal range";
        case 12: return "Fully Compensated Metabolic Alkalosis: Metabolic alkalosis with respiratory compensation bringing pH to high-normal range";
        case 13: return "Fully Compensated Respiratory Alkalosis: Chronic respiratory alkalosis with metabolic compensation bringing pH to high-normal range";
        case 14: return "Normal: Both PaCO₂ and HCO₃⁻ are within normal ranges";
        default: return "Undefined pattern: Doesn't fit typical compensation patterns";
    }
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

paco2Slider.addEventListener('input', debounce(() => {update();}, 50));
hco3Slider.addEventListener('input', debounce(() => {update();}, 50));

initializeGraph();
update();
