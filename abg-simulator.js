// abg-simulator.js file start
let graphData = {pCO2Lines: [],colorMap: [],currentPoint: { x: 7.4, y: 24, text: "PaCO₂: 40" },circlePoints: []};
const paco2Slider = document.getElementById('paco2');
const hco3Slider = document.getElementById('hco3');
const paco2Value = document.getElementById('paco2-value');
const hco3Value = document.getElementById('hco3-value');
const phValue = document.getElementById('ph-value');
const classificationElement = document.getElementById('classification');

function debounce(func, wait) {let timeout;return function() {const context = this, args = arguments;clearTimeout(timeout);timeout = setTimeout(() => func.apply(context, args), wait);};}

paco2Slider.addEventListener('input', debounce(update, 50));
hco3Slider.addEventListener('input', debounce(update, 50));

initializeGraph();
update();

function calculatePH(paco2, hco3) {const pK = 6.1;const PCO2_conversion = 0.03;return pK + Math.log10(hco3 / (PCO2_conversion * paco2));}

function classifyABG(pH, PaCO2, HCO3) {
    const normalPaCO2 = PaCO2 >= 35 && PaCO2 <= 45;
    const normalHCO3 = HCO3 >= 22 && HCO3 <= 26;
    const normalPH = pH >= 7.35 && pH <= 7.45;

    if (pH < 7.35) {
        if (PaCO2 > 45) {
            if (HCO3 < 22) {
                return ["Mixed Acidosis", 'red'];
            } else if (HCO3 > 26) {
                return ["Partially Compensated Respiratory Acidosis", 'orange'];
            } else {
                return ["Uncompensated Respiratory Acidosis", 'darkorange'];
            }
        } else if (HCO3 < 22) {
            if (PaCO2 < 35) {
                return ["Partially Compensated Metabolic Acidosis", 'yellow'];
            } else if (normalPaCO2) {
                return ["Uncompensated Metabolic Acidosis", 'gold'];
            } else {
                return ["Undefined Acidosis", 'gray'];
            }
        } else {
            return ["Undefined Acidosis", 'lightgray'];
        }
    }
    else if (pH > 7.45) {
        if (PaCO2 < 35) {
            if (HCO3 < 22) {
                return ["Partially Compensated Respiratory Alkalosis", 'lightblue'];
            } else if (HCO3 > 26) {
                return ["Mixed Alkalosis", 'purple'];
            } else {
                return ["Uncompensated Respiratory Alkalosis", 'blue'];
            }
        } else if (HCO3 > 26) {
            if (PaCO2 > 45) {
                return ["Partially Compensated Metabolic Alkalosis", 'cyan'];
            } else if (normalPaCO2) {
                return ["Uncompensated Metabolic Alkalosis", 'deepskyblue'];
            } else {
                return ["Undefined Alkalosis", 'gray'];
            }
        } else {
            return ["Undefined Alkalosis", 'lightgray'];
        }
    }
    else {
        if (pH >= 7.35 && pH <= 7.399) {
            if (PaCO2 > 45 && HCO3 > 26) {
                return ["Fully Compensated Respiratory Acidosis", 'darkgreen'];
            } else if (PaCO2 < 35 && HCO3 < 22) {
                return ["Fully Compensated Metabolic Acidosis", 'limegreen'];
            }
        } else if (pH >= 7.401 && pH <= 7.45) {
            if (PaCO2 > 45 && HCO3 > 26) {
                return ["Fully Compensated Metabolic Alkalosis", 'mediumseagreen'];
            } else if (PaCO2 < 35 && HCO3 < 22) {
                return ["Fully Compensated Respiratory Alkalosis", 'springgreen'];
            }
        }
        if (normalPaCO2 && normalHCO3) {
            return ["Normal", 'green'];
        }
        return ["Undefined", 'gray'];
    }
}

function calculatePossiblePaCO2HCO3(pH, PaCO2, HCO3, radius=2, num_points=20) {
    const pK = 6.1;
    const PCO2_conversion = 0.03;
    const angles = Array.from({length: num_points}, (_, i) => 2 * Math.PI * i / num_points);
    const dHCO3_values = angles.map(angle => HCO3 + radius * Math.sin(angle));
    const dPaCO2_values = angles.map(angle => PaCO2 + radius * Math.cos(angle));
    const pH_values = dHCO3_values.map((hco3, i) => {return pK + Math.log10(hco3 / (PCO2_conversion * dPaCO2_values[i]));});
    return { pH_values, hco3_values: dHCO3_values };}

function createPCO2Lines() {
    const pK = 6.1;
    const PCO2_conversion = 0.03;
    const lines = [];
    for (let PaCO2 = 10; PaCO2 <= 100; PaCO2 += 10) {
        const hco3_values = Array.from({length: 100}, (_, i) => 5 + (45 * i / 99));
        const pH_values = hco3_values.map(hco3 => pK + Math.log10(hco3 / (PaCO2 * PCO2_conversion)));
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

function createColorMap() {
    const gridSize = 100;
    const pHRange = { min: 6.8, max: 7.8 };
    const HCO3Range = { min: 5, max: 50 };
    
    // Create classification mapping to numeric values
    const classificationMap = {
        'Normal': 0,
        'Uncompensated Respiratory Acidosis': 1,
        'Partially Compensated Respiratory Acidosis': 2,
        'Mixed Acidosis': 3,
        'Uncompensated Metabolic Acidosis': 4,
        'Partially Compensated Metabolic Acidosis': 5,
        'Uncompensated Respiratory Alkalosis': 6,
        'Partially Compensated Respiratory Alkalosis': 7,
        'Mixed Alkalosis': 8,
        'Uncompensated Metabolic Alkalosis': 9,
        'Partially Compensated Metabolic Alkalosis': 10,
        'Fully Compensated Respiratory Acidosis': 11,
        'Fully Compensated Metabolic Acidosis': 12,
        'Fully Compensated Metabolic Alkalosis': 13,
        'Fully Compensated Respiratory Alkalosis': 14,
        'Undefined': 15
    };

    const pHValues = [];
    const HCO3Values = [];
    const z = [];
    
    for (let i = 0; i < gridSize; i++) {
        const pH = pHRange.min + (pHRange.max - pHRange.min) * i / (gridSize - 1);
        pHValues.push(pH);
        
        const row = [];
        for (let j = 0; j < gridSize; j++) {
            const HCO3 = HCO3Range.min + (HCO3Range.max - HCO3Range.min) * j / (gridSize - 1);
            if (i === 0) HCO3Values.push(HCO3);
            
            const PaCO2 = HCO3 / (Math.pow(10, pH - 6.1) * 0.03);
            const [classification] = classifyABG(pH, PaCO2, HCO3);
            row.push(classificationMap[classification] || 15); // Default to Undefined
        }
        z.push(row);
    }

    return [{
        x: pHValues,
        y: HCO3Values,
        z: z, // Proper 2D array
        type: 'heatmap',
        colorscale: [
            [0, 'green'],          // 0: Normal
            [0.066, 'darkorange'], // 1: Uncompensated Respiratory Acidosis
            [0.133, 'orange'],    // 2: Partially Compensated Respiratory Acidosis
            [0.2, 'red'],          // 3: Mixed Acidosis
            [0.266, 'gold'],       // 4: Uncompensated Metabolic Acidosis
            [0.333, 'yellow'],     // 5: Partially Compensated Metabolic Acidosis
            [0.4, 'blue'],        // 6: Uncompensated Respiratory Alkalosis
            [0.466, 'lightblue'],  // 7: Partially Compensated Respiratory Alkalosis
            [0.533, 'purple'],    // 8: Mixed Alkalosis
            [0.6, 'deepskyblue'], // 9: Uncompensated Metabolic Alkalosis
            [0.666, 'cyan'],      // 10: Partially Compensated Metabolic Alkalosis
            [0.733, 'darkgreen'], // 11: Fully Compensated Respiratory Acidosis
            [0.8, 'limegreen'],   // 12: Fully Compensated Metabolic Acidosis
            [0.866, 'mediumseagreen'], // 13: Fully Compensated Metabolic Alkalosis
            [0.933, 'springgreen'],    // 14: Fully Compensated Respiratory Alkalosis
            [1, 'gray']           // 15: Undefined
        ],
        showscale: false,
        hoverinfo: 'none',
        opacity: 0.6,
        zsmooth: 'best'
    }];
}

function initializeGraph() {
    graphData.pCO2Lines = createPCO2Lines();
    graphData.colorMap = createColorMap();
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
    const traces = [
        ...graphData.colorMap,
        ...graphData.pCO2Lines,
        ...graphData.circlePoints,
        graphData.currentPoint
    ];
    const layout = {
        title: 'ABG Simulator (pH vs HCO₃⁻ with PaCO₂ isolines)',
        xaxis: { title: 'pH', range: [6.2, 8.4] },
        yaxis: { title: 'HCO₃⁻ (mEq/L)', range: [5, 50] },
        margin: { t: 50, b: 50, l: 50, r: 50 },
        hovermode: 'closest'
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
    const [classification, color] = classifyABG(pH, PaCO2, HCO3);
    classificationElement.textContent = classification;
    classificationElement.style.color = color;
    const circlePoints = calculatePossiblePaCO2HCO3(pH, PaCO2, HCO3);
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
// abg-simulator.js file end
