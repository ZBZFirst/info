// ABG Calculator - Arterial Blood Gas Simulator
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        paco2Slider: document.getElementById('paco2'),
        hco3Slider: document.getElementById('hco3'),
        paco2Value: document.getElementById('paco2-value'),
        hco3Value: document.getElementById('hco3-value'),
        phValue: document.getElementById('ph-value'),
        classification: document.getElementById('classification'),
        graph: document.getElementById('graph')
    };

    // Constants
    const CONSTANTS = {
        pK: 6.1,
        PCO2_CONVERSION: 0.03,
        CLASSIFICATION_COLORS: {
            'Normal': 'green',
            'Uncompensated Respiratory Acidosis': 'orange',
            'Partially Compensated Respiratory Acidosis': 'yellow',
            'Mixed Acidosis': 'red',
            'Uncompensated Metabolic Acidosis': 'orange',
            'Partially Compensated Metabolic Acidosis': 'yellow',
            'Uncompensated Respiratory Alkalosis': 'blue',
            'Partially Compensated Respiratory Alkalosis': 'cyan',
            'Mixed Alkalosis': 'purple',
            'Uncompensated Metabolic Alkalosis': 'blue',
            'Partially Compensated Metabolic Alkalosis': 'cyan',
            'Undefined': 'gray'
        }
    };

    // Initial Values
    const initialState = {
        PaCO2: 40,
        HCO3: 24,
        pH: 7.4,
        classification: 'Normal'
    };

    // Graph Data Structure
    let graphData = {
        pCO2Lines: [],
        colorMap: [],
        currentPoint: null,
        circlePoints: []
    };

    // Initialize the application
    function init() {
        setupEventListeners();
        initializeGraph();
        updateDisplay();
    }

    // Set up event listeners
    function setupEventListeners() {
        elements.paco2Slider.addEventListener('input', debounce(handleSliderChange, 50));
        elements.hco3Slider.addEventListener('input', debounce(handleSliderChange, 50));
    }

    // Handle slider changes
    function handleSliderChange() {
        updateValues();
        updateDisplay();
        updateGraph();
    }

    // Update current values from sliders
    function updateValues() {
        initialState.PaCO2 = parseFloat(elements.paco2Slider.value);
        initialState.HCO3 = parseFloat(elements.hco3Slider.value);
        initialState.pH = calculatePH(initialState.PaCO2, initialState.HCO3);
        initialState.classification = classifyABG(initialState.pH, initialState.PaCO2, initialState.HCO3);
    }

    // Update the UI display
    function updateDisplay() {
        elements.paco2Value.textContent = initialState.PaCO2;
        elements.hco3Value.textContent = initialState.HCO3;
        elements.phValue.textContent = initialState.pH.toFixed(2);
        elements.classification.textContent = initialState.classification[0];
        elements.classification.style.color = initialState.classification[1];
    }

    // Initialize the Plotly graph
    function initializeGraph() {
        graphData.pCO2Lines = createPCO2Lines();
        graphData.colorMap = createColorMap();
        graphData.currentPoint = createCurrentPoint();
        graphData.circlePoints = createCirclePoints();

        const layout = {
            title: 'ABG Simulator (pH vs HCO₃⁻ with PaCO₂ isolines)',
            xaxis: { title: 'pH', range: [6.2, 8.4] },
            yaxis: { title: 'HCO₃⁻ (mEq/L)', range: [5, 50] },
            margin: { t: 50, b: 50, l: 50, r: 50 },
            hovermode: 'closest'
        };

        Plotly.newPlot(elements.graph, [
            ...graphData.colorMap,
            ...graphData.pCO2Lines,
            ...graphData.circlePoints,
            graphData.currentPoint
        ], layout);
    }

    // Update the graph with new values
    function updateGraph() {
        const circlePoints = calculatePossiblePaCO2HCO3(
            initialState.pH, 
            initialState.PaCO2, 
            initialState.HCO3
        );

        Plotly.react(elements.graph, {
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
                    x: [initialState.pH],
                    y: [initialState.HCO3],
                    mode: 'markers',
                    marker: { size: 10, color: 'red' },
                    text: [`PaCO₂: ${initialState.PaCO2}`],
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

    // Core calculation functions
    function calculatePH(paco2, hco3) {
        return CONSTANTS.pK + Math.log10(hco3 / (CONSTANTS.PCO2_CONVERSION * paco2));
    }

    function classifyABG(pH, PaCO2, HCO3) {
        if (pH < 7.35) {
            if (PaCO2 > 45) {
                if (HCO3 > 26) return ["Partially Compensated Respiratory Acidosis", 'yellow'];
                if (HCO3 < 22) return ["Mixed Acidosis", 'red'];
                return ["Uncompensated Respiratory Acidosis", 'orange'];
            }
            if (HCO3 < 22) {
                if (PaCO2 < 35) return ["Partially Compensated Metabolic Acidosis", 'yellow'];
                if (PaCO2 > 45) return ["Mixed Acidosis", 'red'];
                return ["Uncompensated Metabolic Acidosis", 'orange'];
            }
            return ["Undefined", 'gray'];
        }
        if (pH > 7.45) {
            if (PaCO2 < 35) {
                if (HCO3 < 22) return ["Partially Compensated Respiratory Alkalosis", 'cyan'];
                if (HCO3 > 26) return ["Mixed Alkalosis", 'purple'];
                return ["Uncompensated Respiratory Alkalosis", 'blue'];
            }
            if (HCO3 > 26) {
                if (PaCO2 > 45) return ["Partially Compensated Metabolic Alkalosis", 'cyan'];
                if (PaCO2 < 35) return ["Mixed Alkalosis", 'purple'];
                return ["Uncompensated Metabolic Alkalosis", 'blue'];
            }
            return ["Undefined", 'gray'];
        }
        if (35 <= PaCO2 && PaCO2 <= 45 && 22 <= HCO3 && HCO3 <= 26) {
            return ["Normal", 'green'];
        }
        return ["Undefined", 'gray'];
    }

    function calculatePossiblePaCO2HCO3(pH, PaCO2, HCO3, radius = 2, num_points = 20) {
        const angles = Array.from({ length: num_points }, (_, i) => 2 * Math.PI * i / num_points);
        const dHCO3_values = angles.map(angle => HCO3 + radius * Math.sin(angle));
        const dPaCO2_values = angles.map(angle => PaCO2 + radius * Math.cos(angle));
        
        const pH_values = dHCO3_values.map((hco3, i) => 
            CONSTANTS.pK + Math.log10(hco3 / (CONSTANTS.PCO2_CONVERSION * dPaCO2_values[i]))
        );
        
        return { pH_values, hco3_values: dHCO3_values };
    }

    // Graph helper functions
    function createPCO2Lines() {
        const lines = [];
        
        for (let PaCO2 = 10; PaCO2 <= 100; PaCO2 += 10) {
            const hco3_values = Array.from({ length: 100 }, (_, i) => 5 + (45 * i / 99));
            const pH_values = hco3_values.map(hco3 => 
                CONSTANTS.pK + Math.log10(hco3 / (PaCO2 * CONSTANTS.PCO2_CONVERSION))
            );
            
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
        const gridSize = 50;
        const pHRange = { min: 6.2, max: 8.4 };
        const HCO3Range = { min: 5, max: 50 };
        
        const z = [];
        const pHValues = [];
        const HCO3Values = [];
        
        for (let i = 0; i < gridSize; i++) {
            const pH = pHRange.min + (pHRange.max - pHRange.min) * i / (gridSize - 1);
            pHValues.push(pH);
            const row = [];
            
            for (let j = 0; j < gridSize; j++) {
                const HCO3 = HCO3Range.min + (HCO3Range.max - HCO3Range.min) * j / (gridSize - 1);
                if (i === 0) HCO3Values.push(HCO3);
                
                const PaCO2 = HCO3 / (Math.pow(10, pH - CONSTANTS.pK) * CONSTANTS.PCO2_CONVERSION);
                const [classification] = classifyABG(pH, PaCO2, HCO3);
                row.push(CONSTANTS.CLASSIFICATION_COLORS[classification]);
            }
            z.push(row);
        }
        
        return [{
            x: pHValues,
            y: HCO3Values,
            z: z,
            type: 'heatmap',
            colorscale: [
                [0, 'green'], [0.1, 'orange'], [0.2, 'yellow'], 
                [0.3, 'red'], [0.4, 'blue'], [0.5, 'cyan'],
                [0.6, 'purple'], [0.7, 'gray']
            ],
            showscale: false,
            hoverinfo: 'none',
            opacity: 0.6
        }];
    }

    function createCurrentPoint() {
        return {
            x: [initialState.pH],
            y: [initialState.HCO3],
            mode: 'markers',
            marker: { size: 10, color: 'red' },
            text: [`PaCO₂: ${initialState.PaCO2}`],
            hoverinfo: 'text',
            showlegend: false
        };
    }

    function createCirclePoints() {
        const circlePoints = calculatePossiblePaCO2HCO3(initialState.pH, initialState.PaCO2, initialState.HCO3);
        return [{
            x: circlePoints.pH_values,
            y: circlePoints.hco3_values,
            mode: 'lines',
            line: { color: 'red', width: 2 },
            fill: 'toself',
            fillcolor: 'rgba(255, 0, 0, 0.2)',
            showlegend: false,
            hoverinfo: 'none'
        }];
    }

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Start the application
    init();
});
