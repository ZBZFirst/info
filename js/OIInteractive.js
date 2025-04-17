// OIInteractive.js
(function() {
  const size = 100000;
  
  // --- Pre-allocate typed arrays ---
  const fio2 = new Float32Array(size);
  const map = new Float32Array(size);
  const pao2 = new Float32Array(size);
  const oi = new Float32Array(size);
  const pao2Norm = new Float32Array(size);
  const x = new Float32Array(size);
  const y = new Float32Array(size);

  // --- Generate data (optimized loops) ---
  for (let i = 0; i < size; i++) {
    fio2[i] = Math.round((0.21 + 0.79 * Math.random()) * 100) / 100;
    map[i] = Math.round(5 + 45 * Math.random());
    pao2[i] = Math.round(35 + 65 * Math.random());
  }

  // --- Precompute min/max (single pass) ---
  let pao2Min = Infinity, pao2Max = -Infinity;
  for (let i = 0; i < size; i++) {
    if (pao2[i] < pao2Min) pao2Min = pao2[i];
    if (pao2[i] > pao2Max) pao2Max = pao2[i];
  }

  // --- Calculate derived values ---
  for (let i = 0; i < size; i++) {
    oi[i] = Math.round((fio2[i] * map[i] * 100) / pao2[i]);
    pao2Norm[i] = Math.round(((pao2[i] - pao2Min) / (pao2Max - pao2Min)) * 100) / 100;
    x[i] = Math.round(pao2Norm[i] * 2 * Math.cos(fio2[i] * 2 * Math.PI) * 100) / 100;
    y[i] = Math.round(pao2Norm[i] * 2 * Math.sin(fio2[i] * 2 * Math.PI) * 100) / 100;
  }

  // --- Optimized hover text (lazy generation) ---
  const hoverText = new Array(size);
  for (let i = 0; i < size; i += 100) { // Generate every 100th point upfront
    hoverText[i] = `PaO2: ${pao2[i]}<br>FiO2: ${fio2[i]}<br>MAP: ${map[i]}<br>OI: ${oi[i]}`;
  }

  // --- Create plot ---
  Plotly.newPlot('plot', [{
    x, y, z: oi,
    mode: 'markers',
    marker: {
      color: pao2Norm,
      colorscale: 'RdYlGn',
      size: 2,
      opacity: 0.5
    },
    type: 'scatter3d',
    hoverinfo: 'text',
    text: hoverText,
    // Only generate hover text when needed
    hoveron: 'points',
    customdata: Array.from({length: size}, (_, i) => i)
  }], {
    title: 'Oxygenation Index Dome Effect',
    scene: { xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'OI' } },
    width: 800,
    height: 600
  });

  // Lazy-load hover text
  document.getElementById('plot').on('plotly_hover', function(data) {
    const points = data.points;
    for (const pt of points) {
      const i = pt.customdata;
      if (!hoverText[i]) {
        hoverText[i] = `PaO2: ${pao2[i]}<br>FiO2: ${fio2[i]}<br>MAP: ${map[i]}<br>OI: ${oi[i]}`;
        pt.fullData.text[i] = hoverText[i];
      }
    }
    Plotly.redraw('plot');
  });
})();
