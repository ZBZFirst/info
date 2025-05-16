class DataVisualizer3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element with ID '${containerId}' not found`);
    }
    
    this.data = [];
    this.columns = [];
    this.plot = null;
    this.isFullscreen = false;
    
    // Default configuration
    this.config = {
      coordSystem: 'cartesian',
      xColumn: '',
      yColumn: '',
      zColumn: '',
      colorColumn: null,
      colorMap: 'Viridis',
      pointSize: 5,
      opacity: 0.7,
      labelStyle: 'simple'
    };
    
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.setupControls();
      this.createVisualization();
      this.setupEventListeners();
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError(error.message);
    }
  }

  async loadData() {
    try {
      const response = await fetch('/info/quiz1/x_y_z_data.csv');
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
      }
      const csvData = await response.text();
      this.parseCSV(csvData);
    } catch (error) {
      console.error('Data loading error:', error);
      throw error;
    }
  }

  parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has insufficient data');
    }
    
    // Extract column headers
    this.columns = lines[0].split(',').map(col => col.trim());
    
    // Parse data rows
    this.data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const point = {};
      this.columns.forEach((col, index) => {
        point[col] = parseFloat(values[index]);
      });
      this.data.push(point);
    }
    
    // Set default columns if they exist
    if (this.columns.includes('x')) this.config.xColumn = 'x';
    if (this.columns.includes('y')) this.config.yColumn = 'y';
    if (this.columns.includes('z')) this.config.zColumn = 'z';
  }

  setupControls() {
    // Coordinate system selector
    const coordSystemSelect = document.getElementById('coord-system');
    if (coordSystemSelect) {
      coordSystemSelect.value = this.config.coordSystem;
    }
    
    // Column selectors
    this.setupColumnSelect('x-col', this.config.xColumn);
    this.setupColumnSelect('y-col', this.config.yColumn);
    this.setupColumnSelect('z-col', this.config.zColumn);
    this.setupColumnSelect('color-by', this.config.colorColumn, true);
    
    // Other controls
    const colorMapSelect = document.getElementById('cmap');
    if (colorMapSelect) colorMapSelect.value = this.config.colorMap;
    
    const opacityInput = document.getElementById('alpha');
    if (opacityInput) opacityInput.value = this.config.opacity;
    
    const labelStyleSelect = document.getElementById('label-style');
    if (labelStyleSelect) labelStyleSelect.value = this.config.labelStyle;
  }

  setupColumnSelect(selectId, defaultValue, includeNone = false) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = includeNone ? '<option value="none">None</option>' : '';
    
    this.columns.forEach(column => {
      const option = document.createElement('option');
      option.value = column;
      option.textContent = column;
      select.appendChild(option);
    });
    
    if (defaultValue && this.columns.includes(defaultValue)) {
      select.value = defaultValue;
    }
  }

  setupEventListeners() {
    // Control change listeners
    document.getElementById('coord-system')?.addEventListener('change', (e) => {
      this.config.coordSystem = e.target.value;
      this.updateVisualization();
    });
    
    document.getElementById('x-col')?.addEventListener('change', (e) => {
      this.config.xColumn = e.target.value;
      this.updateVisualization();
    });
    
    document.getElementById('y-col')?.addEventListener('change', (e) => {
      this.config.yColumn = e.target.value;
      this.updateVisualization();
    });
    
    document.getElementById('z-col')?.addEventListener('change', (e) => {
      this.config.zColumn = e.target.value;
      this.updateVisualization();
    });
    
    document.getElementById('color-by')?.addEventListener('change', (e) => {
      this.config.colorColumn = e.target.value === 'none' ? null : e.target.value;
      this.updateVisualization();
    });
    
    document.getElementById('cmap')?.addEventListener('change', (e) => {
      this.config.colorMap = e.target.value;
      this.updateVisualization();
    });
    
    document.getElementById('alpha')?.addEventListener('input', (e) => {
      this.config.opacity = parseFloat(e.target.value);
      this.updateVisualization();
    });
    
    document.getElementById('label-style')?.addEventListener('change', (e) => {
      this.config.labelStyle = e.target.value;
      this.updateVisualization();
    });
    
    // Window resize handler
    window.addEventListener('resize', () => {
      if (this.plot) {
        Plotly.Plots.resize(this.container);
      }
    });
  }

  createVisualization() {
    if (!this.data.length) {
      throw new Error('No data available for visualization');
    }
    
    this.updateVisualization();
  }

  updateVisualization() {
    const { x, y, z, color } = this.transformData();
    const labels = this.getAxisLabels();
    
    const trace = {
      x,
      y,
      z,
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: this.config.pointSize,
        color: color,
        colorscale: this.config.colorMap,
        opacity: this.config.opacity,
        showscale: this.config.colorColumn !== null,
        colorbar: {
          title: this.config.colorColumn || ''
        }
      }
    };
    
    const layout = {
      margin: { l: 0, r: 0, b: 0, t: 30 },
      scene: {
        xaxis: { title: labels.x },
        yaxis: { title: labels.y },
        zaxis: { title: labels.z }
      }
    };
    
    if (!this.plot) {
      this.plot = Plotly.newPlot(this.container, [trace], layout);
      this.addFullscreenButton();
    } else {
      Plotly.react(this.container, [trace], layout);
    }
  }

  transformData() {
    const { coordSystem, xColumn, yColumn, zColumn, colorColumn } = this.config;
    const result = { x: [], y: [], z: [], color: [] };
    
    this.data.forEach(point => {
      const xVal = point[xColumn];
      const yVal = point[yColumn];
      const zVal = point[zColumn];
      
      let x, y, z;
      
      switch (coordSystem) {
        case 'polar':
          // Convert polar to Cartesian
          x = xVal * Math.cos(yVal);
          y = xVal * Math.sin(yVal);
          z = zVal;
          break;
          
        case 'spherical':
          // Convert spherical to Cartesian
          x = xVal * Math.sin(zVal) * Math.cos(yVal);
          y = xVal * Math.sin(zVal) * Math.sin(yVal);
          z = xVal * Math.cos(zVal);
          break;
          
        case 'cartesian':
        default:
          x = xVal;
          y = yVal;
          z = zVal;
      }
      
      result.x.push(x);
      result.y.push(y);
      result.z.push(z);
      result.color.push(colorColumn ? point[colorColumn] : 0);
    });
    
    return result;
  }

  getAxisLabels() {
    const { coordSystem, labelStyle } = this.config;
    
    const labelSets = {
      simple: {
        cartesian: { x: 'X', y: 'Y', z: 'Z' },
        polar: { x: 'X (polar)', y: 'Y (polar)', z: 'Z' },
        spherical: { x: 'X (spherical)', y: 'Y (spherical)', z: 'Z (spherical)' }
      },
      clinical: {
        cartesian: { 
          x: 'Respiratory Rate (breaths/min)', 
          y: 'Tidal Volume (mL)', 
          z: 'Minute Ventilation (L/min)' 
        },
        polar: { 
          x: 'Transformed Respiratory', 
          y: 'Transformed Tidal', 
          z: 'Minute Ventilation (L/min)' 
        },
        spherical: { 
          x: 'Transformed Respiratory', 
          y: 'Transformed Tidal', 
          z: 'Transformed Ventilation' 
        }
      }
    };
    
    return labelSets[labelStyle][coordSystem] || labelSets.simple[coordSystem];
  }

  addFullscreenButton() {
    const button = document.createElement('button');
    button.className = 'fullscreen-toggle';
    button.innerHTML = '⛶ Fullscreen';
    button.onclick = () => this.toggleFullscreen();
    
    // Style the button
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '100';
    button.style.padding = '5px 10px';
    button.style.background = 'rgba(255, 255, 255, 0.7)';
    button.style.border = '1px solid #ccc';
    button.style.borderRadius = '3px';
    button.style.cursor = 'pointer';
    
    this.container.style.position = 'relative';
    this.container.appendChild(button);
  }

  toggleFullscreen() {
    if (this.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  enterFullscreen() {
    // Store original styles
    this.originalStyles = {
      width: this.container.style.width,
      height: this.container.style.height,
      position: this.container.style.position,
      top: this.container.style.top,
      left: this.container.style.left,
      zIndex: this.container.style.zIndex,
      backgroundColor: this.container.style.backgroundColor
    };
    
    // Apply fullscreen styles
    Object.assign(this.container.style, {
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: '0',
      left: '0',
      zIndex: '1000',
      backgroundColor: 'white'
    });
    
    // Update button
    const button = this.container.querySelector('.fullscreen-toggle');
    if (button) button.innerHTML = '✕ Exit Fullscreen';
    
    // Update plot
    Plotly.relayout(this.container, {
      width: window.innerWidth,
      height: window.innerHeight
    });
    
    this.isFullscreen = true;
  }

  exitFullscreen() {
    // Restore original styles
    if (this.originalStyles) {
      Object.assign(this.container.style, this.originalStyles);
    } else {
      // Default fallback
      this.container.style.width = '100%';
      this.container.style.height = '600px';
      this.container.style.position = 'relative';
      this.container.style.zIndex = '';
      this.container.style.backgroundColor = '';
    }
    
    // Update button
    const button = this.container.querySelector('.fullscreen-toggle');
    if (button) button.innerHTML = '⛶ Fullscreen';
    
    // Update plot
    Plotly.relayout(this.container, {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    });
    
    this.isFullscreen = false;
  }

  showError(message) {
    this.container.innerHTML = `
      <div style="
        padding: 20px;
        background: #ffebee;
        border: 1px solid #ef9a9a;
        border-radius: 4px;
        color: #c62828;
      ">
        <h3 style="margin-top: 0;">Error</h3>
        <p>${message}</p>
      </div>
    `;
  }

  cleanup() {
    if (this.plot) {
      Plotly.purge(this.container);
      this.plot = null;
    }
    
    // Remove any added elements
    const button = this.container.querySelector('.fullscreen-toggle');
    if (button) this.container.removeChild(button);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    new DataVisualizer3D('graph3d');
  } catch (error) {
    console.error('Failed to initialize visualization:', error);
  }
});
