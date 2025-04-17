// OIInteractive.js
(function() {
  const size = 100000;
  const progressDiv = document.createElement('div');
  progressDiv.style.cssText = `
    position: fixed; top: 20px; left: 20px; padding: 10px;
    background: rgba(0,0,0,0.7); color: white; border-radius: 5px;
    z-index: 1000; font-family: Arial, sans-serif;
  `;
  document.body.appendChild(progressDiv);

  // Web Worker for parallel computation
  function createWorker() {
    const workerCode = `
      onmessage = function(e) {
        const size = e.data;
        const results = {};
        
        // Generate base data
        results.fio2 = new Float32Array(size);
        results.map = new Float32Array(size);
        results.pao2 = new Float32Array(size);
        for (let i = 0; i < size; i++) {
          results.fio2[i] = Math.round((0.21 + 0.79 * Math.random()) * 100) / 100;
          results.map[i] = Math.round(5 + 45 * Math.random());
          results.pao2[i] = Math.round(35 + 65 * Math.random());
          if (i % 10000 === 0) postMessage({progress: i/size, stage: 1});
        }

        // Calculate min/max
        let [min, max] = [Infinity, -Infinity];
        for (let i = 0; i < size; i++) {
          min = Math.min(min, results.pao2[i]);
          max = Math.max(max, results.pao2[i]);
          if (i % 10000 === 0) postMessage({progress: i/size, stage: 2});
        }

        // Compute derived values
        results.oi = new Float32Array(size);
        results.pao2Norm = new Float32Array(size);
        results.x = new Float32Array(size);
        results.y = new Float32Array(size);
        for (let i = 0; i < size; i++) {
          results.oi[i] = Math.round((results.fio2[i] * results.map[i] * 100) / results.pao2[i]);
          results.pao2Norm[i] = Math.round(((results.pao2[i] - min) / (max - min)) * 100) / 100;
          results.x[i] = Math.round(results.pao2Norm[i] * 2 * Math.cos(results.fio2[i] * 2 * Math.PI) * 100) / 100;
          results.y[i] = Math.round(results.pao2Norm[i] * 2 * Math.sin(results.fio2[i] * 2 * Math.PI) * 100) / 100;
          if (i % 10000 === 0) postMessage({progress: i/size, stage: 3});
        }
        postMessage({results});
      }`;
    const blob = new Blob([workerCode], {type: 'application/javascript'});
    return new Worker(URL.createObjectURL(blob));
  }

  const worker = createWorker();
  worker.onmessage = function(e) {
    if (e.data.progress !== undefined) {
      const stages = ["Generating Data", "Calculating Stats", "Computing Coordinates"];
      const percent = Math.round(e.data.progress * 100);
      progressDiv.textContent = `${stages[e.data.stage-1]}... ${percent}%`;
    } else if (e.data.results) {
      progressDiv.textContent = "Rendering...";
      
      // Progressive rendering
      const chunkSize = 10000;
      const totalChunks = Math.ceil(size / chunkSize);
      let currentChunk = 0;
      
      function renderNextChunk() {
        const start = currentChunk * chunkSize;
        const end = Math.min((currentChunk + 1) * chunkSize, size);
        
        const trace = {
          x: e.data.results.x.subarray(start, end),
          y: e.data.results.y.subarray(start, end),
          z: e.data.results.oi.subarray(start, end),
          mode: 'markers',
          marker: {
            color: e.data.results.pao2Norm.subarray(start, end),
            colorscale: 'RdYlGn',
            size: 3,
            opacity: 0.7,
            line: {width: 0}
          },
          type: 'scatter3d',
          hoverinfo: 'skip'
        };
        
        if (currentChunk === 0) {
          Plotly.newPlot('plot', [trace], {
            title: 'Oxygenation Index Dome Effect',
            scene: {
              xaxis: { title: 'x' },
              yaxis: { title: 'y' },
              zaxis: { title: 'OI' }
            },
            width: 800,
            height: 600,
            margin: {l: 0, r: 0, b: 0, t: 40}
          });
        } else {
          Plotly.extendTraces('plot', {
            x: [trace.x],
            y: [trace.y],
            z: [trace.z],
            'marker.color': [trace.marker.color]
          }, [0]);
        }
        
        currentChunk++;
        progressDiv.textContent = `Rendering... ${Math.round((currentChunk / totalChunks) * 100)}%`;
        
        if (currentChunk < totalChunks) {
          setTimeout(renderNextChunk, 50); // Yield to UI thread
        } else {
          // Finalize with hover events
          progressDiv.textContent = "Finalizing...";
          addHoverInteractivity(e.data.results);
          setTimeout(() => progressDiv.remove(), 1000);
        }
      }
      
      renderNextChunk();
    }
  };

  function addHoverInteractivity(data) {
    const plotDiv = document.getElementById('plot');
    plotDiv.on('plotly_hover', function(eventData) {
      const pts = eventData.points[0];
      const i = pts.pointNumber;
      
      // Create dynamic hover label
      Plotly.relayout('plot', {
        annotations: [{
          x: data.x[i],
          y: data.y[i],
          z: data.oi[i],
          text: `PaO2: ${data.pao2[i]}<br>FiO2: ${data.fio2[i]}<br>MAP: ${data.map[i]}<br>OI: ${data.oi[i]}`,
          showarrow: true,
          arrowhead: 1,
          ax: 0,
          ay: -40
        }]
      });
    });
  }

  worker.postMessage(size);
})();
