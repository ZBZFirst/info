class DataVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.data = null;
    this.columns = [];
    this.addFullscreenButton();
    this.isFullscreen = false;
    this.currentParams = {
      coordSystem: 'cartesian',
      xCol: '',
      yCol: '',
      zCol: '',
      colorBy: 'none',
      cmap: 'viridis',
      alpha: 0.7,
      labelStyle: 'simple'
    };
    
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupUI();
    this.createVisualization();
  }

  async loadData() {
    try {
      const response = await fetch('/info/quiz1/x_y_z_data.csv');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const csv = await response.text();
      this.processData(csv);
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Failed to load data: ' + error.message);
    }
  }

  processData(csv) {
    const lines = csv.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');
    
    this.columns = lines[0].split(',').map(col => col.trim());
    this.data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const point = {};
      this.columns.forEach((col, j) => {
        point[col] = parseFloat(values[j]);
      });
      this.data.push(point);
    }
  }

  setupUI() {
    // Populate dropdowns
    const populateSelect = (id, includeNone = false) => {
      const select = document.getElementById(id);
      select.innerHTML = includeNone ? '<option value="none">None</option>' : '';
      
      this.columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        select.appendChild(option);
      });
      
      // Set defaults if available
      if (id === 'x-col' && this.columns.includes('x')) select.value = 'x';
      if (id === 'y-col' && this.columns.includes('y')) select.value = 'y';
      if (id === 'z-col' && this.columns.includes('z')) select.value = 'z';
    };
    
    populateSelect('x-col');
    populateSelect('y-col');
    populateSelect('z-col');
    populateSelect('color-by', true);
    
    // Event listeners
    document.getElementById('coord-system').addEventListener('change', () => this.updateVisualization());
    document.getElementById('color-by').addEventListener('change', () => this.updateVisualization());
    document.getElementById('cmap').addEventListener('change', () => this.updateVisualization());
    document.getElementById('alpha').addEventListener('input', () => this.updateVisualization());
    document.getElementById('label-style').addEventListener('change', () => this.updateVisualization());
  }

  createVisualization() {
    this.updateVisualization();
  }

  updateVisualization() {
    // Update current parameters
    this.currentParams = {
      coordSystem: document.getElementById('coord-system').value,
      xCol: document.getElementById('x-col').value,
      yCol: document.getElementById('y-col').value,
      zCol: document.getElementById('z-col').value,
      colorBy: document.getElementById('color-by').value,
      cmap: document.getElementById('cmap').value,
      alpha: parseFloat(document.getElementById('alpha').value),
      labelStyle: document.getElementById('label-style').value
    };
    
    const points = this.transformCoordinates();
    const labels = this.getLabels();
    
    const trace = {
      x: points.x,
      y: points.y,
      z: points.z,
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 5,
        color: points.color,
        colorscale: this.currentParams.cmap,
        opacity: this.currentParams.alpha,
        showscale: this.currentParams.colorBy !== 'none',
        colorbar: {
          title: this.currentParams.colorBy !== 'none' ? 
            this.columns.find(col => col === this.currentParams.colorBy) : ''
        }
      }
    };

    const layout = {
      scene: {
        xaxis: { title: labels.x },
        yaxis: { title: labels.y },
        zaxis: { title: labels.z }
      },
      margin: { l: 0, r: 0, b: 0, t: 30 }
    };

    if (!this.plot) {
      this.plot = Plotly.newPlot(this.container, [trace], layout);
    } else {
      Plotly.react(this.container, [trace], layout);
    }
  }

  transformCoordinates() {
    const { coordSystem, xCol, yCol, zCol, colorBy } = this.currentParams;
    const result = { x: [], y: [], z: [], color: [] };
    
    this.data.forEach(point => {
      let x, y, z;
      const xVal = point[xCol], yVal = point[yCol], zVal = point[zCol];
      
      if (coordSystem === 'cartesian') {
        x = xVal;
        y = yVal;
        z = zVal;
      } else if (coordSystem === 'polar') {
        x = xVal * Math.cos(yVal);
        y = xVal * Math.sin(yVal);
        z = zVal;
      } else { // spherical
        x = xVal * Math.sin(zVal) * Math.cos(yVal);
        y = xVal * Math.sin(zVal) * Math.sin(yVal);
        z = xVal * Math.cos(zVal);
      }
      
      result.x.push(x);
      result.y.push(y);
      result.z.push(z);
      result.color.push(colorBy !== 'none' ? point[colorBy] : 0);
    });
    
    return result;
  }

  addFullscreenButton() {
    const btn = document.createElement('button');
    btn.className = 'fullscreen-toggle';
    btn.innerHTML = '⛶ Fullscreen';
    btn.onclick = () => this.toggleFullscreen();
    
    // Style the button
    btn.style.position = 'absolute';
    btn.style.top = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = '100';
    btn.style.padding = '5px 10px';
    btn.style.background = 'rgba(255,255,255,0.7)';
    btn.style.border = '1px solid #ccc';
    btn.style.borderRadius = '3px';
    btn.style.cursor = 'pointer';
    
    this.container.style.position = 'relative';
    this.container.appendChild(btn);
  }

  toggleFullscreen() {
    if (this.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  enterFullscreen() {
    // Store original dimensions
    this.originalDimensions = {
      width: this.container.style.width,
      height: this.container.style.height,
      position: this.container.style.position,
      top: this.container.style.top,
      left: this.container.style.left,
      zIndex: this.container.style.zIndex,
      background: this.container.style.background
    };
    
    // Apply fullscreen styles
    Object.assign(this.container.style, {
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: '0',
      left: '0',
      zIndex: '1000',
      background: 'white'
    });
    
    // Update Plotly
    Plotly.relayout(this.container, {
      width: window.innerWidth,
      height: window.innerHeight,
      margin: { l: 0, r: 0, b: 0, t: 0 }
    });
    
    this.isFullscreen = true;
    document.querySelector('.fullscreen-toggle').innerHTML = '✕ Exit Fullscreen';
  }

  exitFullscreen() {
    // Restore original dimensions
    if (this.originalDimensions) {
      Object.assign(this.container.style, this.originalDimensions);
    } else {
      // Default fallback
      this.container.style.width = '100%';
      this.container.style.height = '600px';
      this.container.style.position = 'relative';
      this.container.style.zIndex = '';
      this.container.style.background = '';
    }
    
    // Update Plotly
    Plotly.relayout(this.container, {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      margin: { l: 0, r: 0, b: 0, t: 30 }
    });
    
    this.isFullscreen = false;
    document.querySelector('.fullscreen-toggle').innerHTML = '⛶ Fullscreen';
  }

  handleResize() {
    if (this.plot) {
      if (this.isFullscreen) {
        Plotly.relayout(this.container, {
          width: window.innerWidth,
          height: window.innerHeight
        });
      } else {
        Plotly.relayout(this.container, {
          width: this.container.clientWidth,
          height: this.container.clientHeight
        });
      }
    }
  }

  
  getLabels() {
    const { coordSystem, labelStyle } = this.currentParams;
    const styles = {
      simple: {
        x: 'X',
        y: 'Y', 
        z: 'Z',
        transformed_x: 'Transformed X',
        transformed_y: 'Transformed Y'
      },
      clinical: {
        x: 'Respiratory Rate (breaths/min)',
        y: 'Tidal Volume (mL)',
        z: 'Minute Ventilation (L/min)',
        transformed_x: 'Transformed Respiratory',
        transformed_y: 'Transformed Tidal'
      }
    };
    
    const labels = styles[labelStyle];
    return {
      x: coordSystem === 'cartesian' ? labels.x : labels.transformed_x,
      y: coordSystem === 'cartesian' ? labels.y : labels.transformed_y,
      z: labels.z
    };
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="error-message">
        <h3>Error</h3>
        <p>${message}</p>
      </div>
    `;
  }
}

  destroy() {
    window.removeEventListener('resize', this.resizeHandler);
    if (this.plot) {
      Plotly.purge(this.container);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new DataVisualizer('graph3d');
});
