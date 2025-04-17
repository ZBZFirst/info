    // Generate random data
    const size = 100000;
    const fio2 = Array(size).fill().map(() => Math.round((0.21 + 0.79 * Math.random()) * 100) / 100);
    const map = Array(size).fill().map(() => Math.round(5 + 45 * Math.random()));
    const pao2 = Array(size).fill().map(() => Math.round(35 + 65 * Math.random()));
    
    // Calculate derived values
    const oi = fio2.map((f, i) => Math.round((f * map[i] * 100) / pao2[i]));
    const pao2Norm = pao2.map(p => {
      const min = Math.min(...pao2);
      const max = Math.max(...pao2);
      return Math.round(((p - min) / (max - min)) * 100) / 100;
    });
    
    // Convert to Cartesian coordinates
    const x = pao2Norm.map((r, i) => Math.round(r * 2 * Math.cos(fio2[i] * 2 * Math.PI) * 100) / 100);
    const y = pao2Norm.map((r, i) => Math.round(r * 2 * Math.sin(fio2[i] * 2 * Math.PI) * 100) / 100);
    
    // Create plot
    const trace = {
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
      text: pao2.map((p, i) => `PaO2: ${p}<br>FiO2: ${fio2[i]}<br>MAP: ${map[i]}<br>OI: ${oi[i]}`)
    };
    
    const layout = {
      title: 'Oxygenation Index Dome Effect',
      scene: {
        xaxis: { title: 'x' },
        yaxis: { title: 'y' },
        zaxis: { title: 'OI' }
      },
      width: 800,
      height: 600
    };
    
    Plotly.newPlot('plot', [trace], layout);
