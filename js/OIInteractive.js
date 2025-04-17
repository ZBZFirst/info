// OIInteractive.js
(function() {
  const size = 100000;
  const chunkSize = 10000; // Points rendered per frame
  const progressDiv = document.createElement('div');
  progressDiv.style.cssText = `
    position: fixed; top: 20px; left: 20px; padding: 10px;
    background: rgba(0,0,0,0.7); color: white; border-radius: 5px;
    z-index: 1000; font-family: Arial, sans-serif;
  `;
  document.body.appendChild(progressDiv);

  // Web Worker for computation
  const worker = new Worker(URL.createObjectURL(new Blob([`
    const calculate = (size) => {
      const results = {
        fio2: new Float32Array(size),
        map: new Float32Array(size),
        pao2: new Float32Array(size),
        oi: new Float32Array(size),
        x: new Float32Array(size),
        y: new Float32Array(size),
        text: new Array(size)
      };

      // Generate base data
      for (let i = 0; i < size; i++) {
        results.fio2[i] = Math.round((0.21 + 0.79 * Math.random()) * 100) / 100;
        results.map[i] = Math.round(5 + 45 * Math.random());
        results.pao2[i] = Math.round(35 + 65 * Math.random());
        if (i % 5000 === 0) self.postMessage({progress: i/size, stage: 1});
      }

      // Calculate min/max
      const min = Math.min(...results.pao2);
      const max = Math.max(...results.pao2);
      self.postMessage({progress: 1, stage: 2});

      // Compute derived values and hover text
      for (let i = 0; i < size; i++) {
        results.oi[i] = Math.round((results.fio2[i] * results.map[i] * 100) / results.pao2[i]);
        const norm = Math.round(((results.pao2[i] - min) / (max - min)) * 100) / 100;
        results.x[i] = Math.round(norm * 2 * Math.cos(results.fio2[i] * 2 * Math.PI) * 100) / 100;
        results.y[i] = Math.round(norm * 2 * Math.sin(results.fio2[i] * 2 * Math.PI) * 100) / 100;
        results.text[i] = \`PaO2: \${results.pao2[i]}<br>FiO2: \${results.fio2[i]}<br>MAP: \${results.map[i]}<br>OI: \${results.oi[i]}\`;
        if (i % 5000 === 0) self.postMessage({progress: i/size, stage: 3});
      }
      return results;
    };
    self.onmessage = (e) => self.postMessage({results: calculate(e.data)});
  `], {type: 'application/javascript'})));

  worker.onmessage = function(e) {
    if (e.data.progress !== undefined) {
      const stages = ["Generating Data", "Calculating Stats", "Computing Coordinates"];
      progressDiv.textContent = `${stages[e.data.stage-1]}... ${Math.round(e.data.progress * 100)}%`;
    } else if (e.data.results) {
      progressDiv.textContent = "Rendering visualization...";
      
      // Create initial empty plot
      Plotly.newPlot('plot', [{
        x: [], y: [], z: [],
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: 3,
          opacity: 0.7,
          color: [],
          colorscale: 'RdYlGn',
          line: {width: 0}
        },
        hoverinfo: 'text',
        text: []
      }], {
        title: 'Oxygenation Index Dome Effect',
        scene: {xaxis: {title: 'x'}, yaxis: {title: 'y'}, zaxis: {title: 'OI'}},
        width: 800, height: 600
      });

      // Progressive rendering with hover text
      let renderedPoints = 0;
      const renderChunk = () => {
        const end = Math.min(renderedPoints + chunkSize, size);
        
        Plotly.extendTraces('plot', {
          x: [e.data.results.x.subarray(renderedPoints, end)],
          y: [e.data.results.y.subarray(renderedPoints, end)],
          z: [e.data.results.oi.subarray(renderedPoints, end)],
          text: [e.data.results.text.slice(renderedPoints, end)],
          'marker.color': [e.data.results.oi.subarray(renderedPoints, end)]
        }, [0]);
        
        renderedPoints = end;
        progressDiv.textContent = `Rendering... ${Math.round((renderedPoints / size) * 100)}%`;
        
        if (renderedPoints < size) {
          setTimeout(renderChunk, 30); // Yield to UI thread
        } else {
          progressDiv.textContent = "Ready!";
          setTimeout(() => progressDiv.remove(), 1000);
        }
      };
      
      setTimeout(renderChunk, 100); // Start rendering
    }
  };

  worker.postMessage(size);
})();
