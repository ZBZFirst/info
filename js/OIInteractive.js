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
  
      // Calculate min/max more efficiently
      let min = Infinity, max = -Infinity;
      for (let i = 0; i < size; i++) {
        if (results.pao2[i] < min) min = results.pao2[i];
        if (results.pao2[i] > max) max = results.pao2[i];
      }
      self.postMessage({progress: 1, stage: 2});
  
      // Compute derived values and hover text
      const range = max - min;
      for (let i = 0; i < size; i++) {
        results.oi[i] = Math.round((results.fio2[i] * results.map[i] * 100) / results.pao2[i]);
        const norm = range ? Math.round(((results.pao2[i] - min) / range) * 100) / 100 : 0;
        results.x[i] = Math.round(norm * 2 * Math.cos(results.fio2[i] * 2 * Math.PI) * 100) / 100;
        results.y[i] = Math.round(norm * 2 * Math.sin(results.fio2[i] * 2 * Math.PI) * 100) / 100;
        results.text[i] = \`PaO2: \${results.pao2[i]}<br>FiO2: \${results.fio2[i]}<br>MAP: \${results.map[i]}<br>OI: \${results.oi[i]}\`;
        if (i % 5000 === 0) self.postMessage({progress: i/size, stage: 3});
      }
      return results;
    };
    self.onmessage = (e) => {
    console.log("[Worker] Starting calculation...");
      try {
        const results = calculate(e.data);
        console.log("[Worker] Calculation complete, sending results back.");
        self.postMessage({results});
      } catch (error) {
        console.error("[Worker] Error:", error);
        self.postMessage({error: error.message});
      }
    };
  `], {type: 'application/javascript'})));

  
  worker.onmessage = function(e) {
    if (e.data.progress) {
      console.log(`[Main] Progress: ${Math.round(e.data.progress * 100)}% (Stage ${e.data.stage})`);
      progressDiv.textContent = `Progress: ${Math.round(e.data.progress * 100)}%`;
    } 
    else if (e.data.results) {
      console.log("[Main] Worker finished! Rendering...");
      progressDiv.textContent = "Rendering visualization...";
      
      // Debug: Log the first 5 points to verify data
      console.log("[Main] Sample data:", {
        x: e.data.results.x.slice(0, 5),
        y: e.data.results.y.slice(0, 5),
        oi: e.data.results.oi.slice(0, 5),
        text: e.data.results.text.slice(0, 3)
      });
  
      Plotly.newPlot('plot', [{
        x: [], 
        y: [], 
        z: [],
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: 3,
          opacity: 0.7,
          color: [],
          colorscale: 'RdYlGn'
        },
        hoverinfo: 'text',
        text: [] // ← Initialize empty text array
      }]);
  
      let renderedPoints = 0;
      const renderChunk = () => {
        const end = Math.min(renderedPoints + chunkSize, size);
        console.log(`[Main] Rendering points ${renderedPoints} to ${end}`);
  
        Plotly.extendTraces('plot', {
          x: [Array.from(e.data.results.x.subarray(renderedPoints, end))],
          y: [Array.from(e.data.results.y.subarray(renderedPoints, end))],
          z: [Array.from(e.data.results.oi.subarray(renderedPoints, end))],
          'marker.color': [Array.from(e.data.results.oi.subarray(renderedPoints, end))],
          text: [e.data.results.text.slice(renderedPoints, end)]
        }, [0]);
  
        renderedPoints = end;
        progressDiv.textContent = `Rendering... ${Math.round((renderedPoints / size) * 100)}%`;
  
        if (renderedPoints < size) {
          setTimeout(renderChunk, 30);
        } else {
          console.log("[Main] Rendering complete!");
          progressDiv.textContent = "Ready!";
        }
      };
      renderChunk();
    }
    else if (e.data.error) {
      console.error("[Main] Worker error:", e.data.error);
      progressDiv.textContent = `Error: ${e.data.error}`;
    }
  };
  
  worker.onerror = function(error) {
    console.error("[Main] Worker crashed:", error);
    progressDiv.textContent = "Worker crashed! Check console.";
  };
  worker.postMessage(size);
})();

