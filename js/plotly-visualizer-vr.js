document.addEventListener('DOMContentLoaded', function() {
  // Initialize Plotly visualization container
  const graphDiv = document.createElement('div');
  graphDiv.id = 'vr-graph';
  graphDiv.className = 'graph-container';
  document.querySelector('.container').appendChild(graphDiv);
  
  // Get all input elements
  const veSlider = document.getElementById('minute-ventilation');
  const veValue = document.getElementById('minute-ventilation-value');
  const paco2Slider = document.getElementById('paco2');
  const paco2Value = document.getElementById('paco2-value');
  const pbwInput = document.getElementById('pbw');

  // Store VR data points for visualization
  const vrDataPoints = [];
  let plotInitialized = false;

  // Initialize display
  updateDisplayValues();
  updateCalculations();
  initializePlot();

  // Event listeners for real-time updates
  veSlider.addEventListener('input', function() {
    veValue.textContent = this.value;
    updateCalculations();
    updatePlot();
  });

  paco2Slider.addEventListener('input', function() {
    paco2Value.textContent = this.value;
    updateCalculations();
    updatePlot();
  });

  pbwInput.addEventListener('input', function() {
    updateCalculations();
    updatePlot();
  });

  function updateDisplayValues() {
    veValue.textContent = veSlider.value;
    paco2Value.textContent = paco2Slider.value;
  }

function initializePlot() {
    const layout = {
        title: 'Ventilatory Ratio 3D Visualization',
        margin: { l: 0, r: 0, b: 0, t: 50 },
        scene: {
            xaxis: { title: 'Minute Ventilation (mL/min)' },
            yaxis: { title: 'PaCO₂ (mmHg)' },
            zaxis: { title: 'Ventilatory Ratio' },
            camera: {
                eye: { x: 1.5, y: 1.5, z: 0.5 }
            }
        }
    };
    
    Plotly.newPlot('vr-3d-plot', [], layout);
    plotInitialized = true;
}

function updatePlot() {
    if (!plotInitialized) return;
    
    const ve = parseFloat(veSlider.value);
    const paco2 = parseFloat(paco2Slider.value);
    const pbw = parseFloat(pbwInput.value) || 70;
    const coordSystem = document.getElementById('coord-system').value;
    const xCol = document.getElementById('x-col').value;
    const yCol = document.getElementById('y-col').value;
    const zCol = document.getElementById('z-col').value;
    const colorBy = document.getElementById('color-by').value;
    const colorMap = document.getElementById('cmap').value;
    const opacity = parseFloat(document.getElementById('alpha').value);
    
    // Generate data grid
    const xRange = generateRange(parseInt(veSlider.min), parseInt(veSlider.max), 20);
    const yRange = generateRange(parseInt(paco2Slider.min), parseInt(paco2Slider.max), 20);
    
    // Prepare data for 3D surface
    const xData = [];
    const yData = [];
    const zData = [];
    const colorData = [];
    
    for (let i = 0; i < yRange.length; i++) {
        const rowX = [];
        const rowY = [];
        const rowZ = [];
        const rowColor = [];
        
        for (let j = 0; j < xRange.length; j++) {
            const veVal = xRange[j];
            const paco2Val = yRange[i];
            const vrVal = calculateVR(veVal, paco2Val, pbw);
            
            // Map values based on axis selections
            const xVal = getMappedValue(xCol, veVal, paco2Val, vrVal);
            const yVal = getMappedValue(yCol, veVal, paco2Val, vrVal);
            const zVal = getMappedValue(zCol, veVal, paco2Val, vrVal);
            
            rowX.push(xVal);
            rowY.push(yVal);
            rowZ.push(zVal);
            rowColor.push(getMappedValue(colorBy, veVal, paco2Val, vrVal));
        }
        
        xData.push(rowX);
        yData.push(rowY);
        zData.push(rowZ);
        colorData.push(rowColor);
    }
    
    // Create surface plot
    const surface = {
        x: xData,
        y: yData,
        z: zData,
        type: 'surface',
        colorscale: colorMap,
        opacity: opacity,
        surfacecolor: colorBy !== 'none' ? colorData : undefined,
        hoverinfo: 'x+y+z',
        name: 'VR Surface'
    };
    
    // Add current point marker
    const currentPoint = {
        x: [getMappedValue(xCol, ve, paco2, calculateVR(ve, paco2, pbw))],
        y: [getMappedValue(yCol, ve, paco2, calculateVR(ve, paco2, pbw))],
        z: [getMappedValue(zCol, ve, paco2, calculateVR(ve, paco2, pbw))],
        mode: 'markers',
        type: 'scatter3d',
        marker: {
            size: 8,
            color: 'red',
            line: {
                width: 2,
                color: 'white'
            }
        },
        name: 'Current Settings'
    };
    
    // Apply coordinate system transformation if needed
    const data = coordSystem === 'cartesian' 
        ? [surface, currentPoint]
        : [transformToCoordinateSystem(surface, coordSystem), currentPoint];
    
    // Update plot
    Plotly.react('vr-3d-plot', data, {
        title: `Ventilatory Ratio (PBW: ${pbw} kg)`,
        scene: {
            xaxis: { title: getAxisLabel(xCol) },
            yaxis: { title: getAxisLabel(yCol) },
            zaxis: { title: getAxisLabel(zCol) }
        }
    });
}

// Helper functions
function getMappedValue(column, ve, paco2, vr) {
    switch(column) {
        case 'minute_ventilation': return ve;
        case 'paco2': return paco2;
        case 'vr': return vr;
        default: return 0;
    }
}

function getAxisLabel(column) {
    switch(column) {
        case 'minute_ventilation': return 'Minute Ventilation (mL/min)';
        case 'paco2': return 'PaCO₂ (mmHg)';
        case 'vr': return 'Ventilatory Ratio';
        default: return '';
    }
}

function transformToCoordinateSystem(data, system) {
    if (system === 'cartesian') return data;
    
    const transformed = {...data};
    transformed.x = [];
    transformed.y = [];
    transformed.z = [];
    
    for (let i = 0; i < data.x.length; i++) {
        const rowX = [];
        const rowY = [];
        const rowZ = [];
        
        for (let j = 0; j < data.x[i].length; j++) {
            const x = data.x[i][j];
            const y = data.y[i][j];
            const z = data.z[i][j];
            
            if (system === 'polar') {
                // Polar coordinates (r, θ, z)
                rowX.push(x * Math.cos(y));
                rowY.push(x * Math.sin(y));
                rowZ.push(z);
            } else if (system === 'spherical') {
                // Spherical coordinates (r, θ, φ)
                rowX.push(x * Math.sin(z) * Math.cos(y));
                rowY.push(x * Math.sin(z) * Math.sin(y));
                rowZ.push(x * Math.cos(z));
            }
        }
        
        transformed.x.push(rowX);
        transformed.y.push(rowY);
        transformed.z.push(rowZ);
    }
    
    return transformed;
}

function updateCalculations() {
    // Get current values
    const ve = parseFloat(veSlider.value);
    const paco2 = parseFloat(paco2Slider.value);
    const pbw = parseFloat(pbwInput.value) || 70;

    // Calculate Ventilatory Ratio
    const vr = calculateVR(ve, paco2, pbw);
    const vrFormatted = vr.toFixed(2);
    
    // Create MathJax-compatible equation
    const calculationSteps = `
      \\[
      \\text{VR} = \\frac{\\text{Minute Ventilation} \\times \\text{PaCO}_2}{\\text{PBW} \\times 100 \\times 37.5}
      \\]
      \\[
      = \\frac{${ve} \\times ${paco2}}{${pbw} \\times 100 \\times 37.5}
      \\]
      \\[
      = \\frac{${ve * paco2}}{${pbw * 100 * 37.5}}
      \\]
      \\[
      = \\mathbf{${vrFormatted}}
      \\]
    `;
    
    // Update the calculation div
    const calculationDiv = document.getElementById('vr-calculation');
    calculationDiv.innerHTML = calculationSteps;
    
    // Tell MathJax to typeset the new content
    if (window.MathJax) {
      MathJax.typesetPromise([calculationDiv]).catch(err => {
        console.error('MathJax typesetting error:', err);
      });
    }

    // Rest of your interpretation code remains the same...
    let interpretation = '';
    if (vr < 0.8) {
      interpretation = 'Suggests hyperventilation (VR < 0.8)';
    } else if (vr > 1.2) {
      interpretation = 'Suggests increased dead space or CO₂ production (VR > 1.2)';
    } else {
      interpretation = 'Within normal range (VR 0.8-1.2)';
    }
    
    document.getElementById('vr-interpretation').innerHTML = `
      <div class="interpretation-box ${vr < 0.8 ? 'low' : vr > 1.2 ? 'high' : 'normal'}">
        <p><strong>Interpretation:</strong> ${interpretation}</p>
        ${vr > 2 ? '<p class="warning">Warning: VR > 2 associated with higher mortality in ARDS</p>' : ''}
      </div>
    `;
    
    // Store current data point
    vrDataPoints.push({
      ve: ve,
      paco2: paco2,
      pbw: pbw,
      vr: vr,
      timestamp: new Date().toISOString()
    });
}
});
