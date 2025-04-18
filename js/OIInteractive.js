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

  // Web Worker with optimized data processing
  const worker = new Worker(URL.createObjectURL(new Blob([`
    function calculate(size) {
      const results = {
        buffer: new Float32Array(size * 4), // Stores x, y, z, color
        text: new Array(size),
        oiGroups: {}
      };
      
      // Pre-calculate often-used values
      const TWO_PI = 2 * Math.PI;
      const RANDOM_POOL_SIZE = 10000;
      const randomPool = new Float32Array(RANDOM_POOL_SIZE);
      for (let i = 0; i < RANDOM_POOL_SIZE; i++) {
        randomPool[i] = Math.random();
      }
      
      // Phase 1: Generate base data
      let minPaO2 = Infinity, maxPaO2 = -Infinity;
      const paO2Values = new Float32Array(size);
      
      for (let i = 0; i < size; i++) {
        const fio2 = 0.21 + 0.79 * randomPool[i % RANDOM_POOL_SIZE];
        const map = 5 + 45 * randomPool[(i + 1000) % RANDOM_POOL_SIZE];
        const pao2 = 35 + 65 * randomPool[(i + 2000) % RANDOM_POOL_SIZE];
        
        paO2Values[i] = pao2;
        if (pao2 < minPaO2) minPaO2 = pao2;
        if (pao2 > maxPaO2) maxPaO2 = pao2;
        
        if (i % 5000 === 0) self.postMessage({progress: i/size, stage: 1});
      }
      
      self.postMessage({progress: 1, stage: 2});
      const paO2Range = maxPaO2 - minPaO2;
      
      // Phase 2: Compute coordinates and group by OI
      for (let i = 0; i < size; i++) {
        const fio2 = 0.21 + 0.79 * randomPool[i % RANDOM_POOL_SIZE];
        const map = 5 + 45 * randomPool[(i + 1000) % RANDOM_POOL_SIZE];
        const pao2 = paO2Values[i];
        
        const oi = (fio2 * map * 100) / pao2;
        const roundedOI = Math.round(oi);
        const norm = (pao2 - minPaO2) / paO2Range;
        const angle = fio2 * TWO_PI;
        
        const baseIdx = i * 4;
        results.buffer[baseIdx] = norm * 2 * Math.cos(angle);     // x
        results.buffer[baseIdx+1] = norm * 2 * Math.sin(angle);  // y
        results.buffer[baseIdx+2] = oi;                          // z
        results.buffer[baseIdx+3] = oi;                          // color
        
        results.text[i] = \`PaO2: \${pao2.toFixed(1)}<br>FiO2: \${fio2.toFixed(2)}<br>MAP: \${map.toFixed(1)}<br>OI: \${oi.toFixed(1)}\`;
        
        // Group by rounded OI
        if (!results.oiGroups[roundedOI]) {
          results.oiGroups[roundedOI] = [];
        }
        results.oiGroups[roundedOI].push(i);
        
        if (i % 5000 === 0) self.postMessage({progress: i/size, stage: 3});
      }
      
      return results;
    }
    
    self.onmessage = function(e) {
      console.time('Worker Calculation');
      try {
        const results = calculate(e.data);
        console.timeEnd('Worker Calculation');
        
        // Prepare data for transfer
        const transferData = {
          buffer: results.buffer.buffer,
          text: results.text,
          oiGroups: results.oiGroups
        };
        
        self.postMessage({
          results: transferData
        }, [transferData.buffer]);
        
      } catch (error) {
        console.error('Worker Error:', error);
        self.postMessage({error: error.message});
      }
    };
  `], {type: 'application/javascript'})));

  // Main thread rendering with optimizations
  worker.onmessage = function(e) {
    if (e.data.progress) {
      const progress = Math.round(e.data.progress * 100);
      const stages = ["Generating Data", "Calculating Range", "Computing Coordinates"];
      progressDiv.textContent = `${stages[e.data.stage-1]}: ${progress}%`;
      return;
    }
    
    if (e.data.error) {
      console.error("Worker Error:", e.data.error);
      progressDiv.textContent = `Error: ${e.data.error}`;
      return;
    }
    
    console.time('Main Rendering');
    progressDiv.textContent = "Preparing visualization...";
    
    // Unpack worker data
    const buffer = new Float32Array(e.data.results.buffer);
    const textData = e.data.results.text;
    const oiGroups = e.data.results.oiGroups;
    
    // Initialize plot with performance optimizations
    const plotDiv = document.getElementById('plot');
    Plotly.purge(plotDiv); // Clear previous plot if any
    
    Plotly.newPlot(plotDiv, [{
      x: [], y: [], z: [],
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 2.5, // Slightly smaller for better performance
        opacity: 0.8,
        color: [],
        colorscale: 'RdYlGn',
        line: {width: 0}
      },
      hoverinfo: 'text',
      text: []
    }], {
      title: 'Oxygenation Index Visualization',
      scene: {
        xaxis: {title: 'X Coord'},
        yaxis: {title: 'Y Coord'}, 
        zaxis: {title: 'OI Value'}
      },
      margin: {t: 40, l: 0, r: 0, b: 0}
    });
    
    // Prepare for layer-by-layer rendering
    const oiValues = Object.keys(oiGroups).map(Number).sort((a,b) => a - b);
    let currentLayer = 0;
    let totalRendered = 0;
    
    function renderLayer() {
      if (currentLayer >= oiValues.length) {
        console.timeEnd('Main Rendering');
        progressDiv.textContent = "Visualization Complete!";
        setTimeout(() => progressDiv.remove(), 2000);
        return;
      }
      
      const oi = oiValues[currentLayer];
      const indices = oiGroups[oi];
      const layerSize = indices.length;
      
      // Prepare data for this layer
      const x = new Array(layerSize);
      const y = new Array(layerSize);
      const z = new Array(layerSize);
      const colors = new Array(layerSize);
      const texts = new Array(layerSize);
      
      for (let i = 0; i < layerSize; i++) {
        const idx = indices[i];
        const baseIdx = idx * 4;
        x[i] = buffer[baseIdx];
        y[i] = buffer[baseIdx+1];
        z[i] = buffer[baseIdx+2];
        colors[i] = buffer[baseIdx+3];
        texts[i] = textData[idx];
      }
      
      // Add layer to plot
      Plotly.extendTraces(plotDiv, {
        x: [x],
        y: [y],
        z: [z],
        'marker.color': [colors],
        text: [texts]
      }, [0]);
      
      totalRendered += layerSize;
      currentLayer++;
      
      // Update progress
      progressDiv.textContent = `Rendering OI ${oi} (${Math.round((totalRendered/size)*100}%)`;
      
      // Schedule next layer with dynamic timing
      const delay = Math.max(10, Math.min(100, 5000/layerSize));
      setTimeout(renderLayer, delay);
    }
    
    // Start rendering
    renderLayer();
  };
  
  worker.onerror = function(error) {
    console.error("Worker Crash:", error);
    progressDiv.textContent = "Worker crashed! Check console.";
    progressDiv.style.background = 'rgba(200,0,0,0.7)';
  };
  
  console.log("Starting visualization with", size, "data points...");
  worker.postMessage(size);
})();
