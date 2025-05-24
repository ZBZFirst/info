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
      title: 'Ventilatory Ratio Dynamics',
      xaxis: { title: 'Minute Ventilation (mL/min)' },
      yaxis: { title: 'PaCO₂ (mmHg)' },
      margin: { t: 50, b: 50, l: 50, r: 50 },
      hovermode: 'closest'
    };
    
    Plotly.newPlot('vr-graph', [], layout);
    plotInitialized = true;
  }

  function updatePlot() {
    if (!plotInitialized) return;
    
    const ve = parseFloat(veSlider.value);
    const paco2 = parseFloat(paco2Slider.value);
    const pbw = parseFloat(pbwInput.value) || 70;
    
    // Generate data for visualization
    const veRange = generateRange(parseInt(veSlider.min), parseInt(veSlider.max), 20);
    const paco2Range = generateRange(parseInt(paco2Slider.min), parseInt(paco2Slider.max), 20);
    
    const zData = [];
    for (let i = 0; i < paco2Range.length; i++) {
      const row = [];
      for (let j = 0; j < veRange.length; j++) {
        row.push(calculateVR(veRange[j], paco2Range[i], pbw));
      }
      zData.push(row);
    }
    
    const data = [{
      x: veRange,
      y: paco2Range,
      z: zData,
      type: 'contour',
      colorscale: 'Viridis',
      contours: {
        coloring: 'heatmap',
        showlabels: true,
        labelfont: {
          size: 12,
          color: 'white'
        }
      },
      colorbar: {
        title: 'Ventilatory Ratio',
        titleside: 'right'
      }
    }];
    
    const currentPoint = {
      x: [ve],
      y: [paco2],
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 12,
        color: 'red',
        line: {
          width: 2,
          color: 'white'
        }
      },
      name: 'Current Settings'
    };
    
    data.push(currentPoint);
    
    Plotly.react('vr-graph', data, {
      title: `Ventilatory Ratio Landscape (PBW: ${pbw} kg)`,
      xaxis: { title: 'Minute Ventilation (mL/min)' },
      yaxis: { title: 'PaCO₂ (mmHg)' }
    });
  }

  function calculateVR(ve, paco2, pbw) {
    return (ve * paco2) / (pbw * 100 * 37.5);
  }

  function generateRange(min, max, steps) {
    const range = [];
    const stepSize = (max - min) / steps;
    for (let i = 0; i <= steps; i++) {
      range.push(min + (i * stepSize));
    }
    return range;
  }

  function updateCalculations() {
    // Get current values
    const ve = parseFloat(veSlider.value);
    const paco2 = parseFloat(paco2Slider.value);
    const pbw = parseFloat(pbwInput.value) || 70; // Default to 70 kg if empty

    // Calculate Ventilatory Ratio
    const vr = calculateVR(ve, paco2, pbw);
    const vrFormatted = vr.toFixed(2);
    
    document.getElementById('vr-calculation').innerHTML = `
      <p>(${ve} × ${paco2}) / (${pbw} × 100 × 37.5)</p>
      <p>= ${ve * paco2} / ${pbw * 100 * 37.5}</p>
      <p>= <strong>${vrFormatted}</strong></p>
    `;

    // Provide interpretation
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
