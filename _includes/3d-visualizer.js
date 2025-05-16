---
---
// Use window.THREE instead of importing
const THREE = window.THREE;

// Label styles matching Python prototype
const LABEL_STYLES = {
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

// Colormap functions
const COLORMAPS = {
  viridis: (t) => {
    // Simplified viridis colormap
    const c = new THREE.Color();
    c.setHSL(0.3 + t * 0.5, 0.9, 0.5 - t * 0.2);
    return c;
  },
  plasma: (t) => {
    const c = new THREE.Color();
    c.setHSL(0.1 + t * 0.7, 0.9, 0.5);
    return c;
  },
};

export class InteractiveVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
    
    this.data = null;
    this.columns = [];
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
    
    // Initialize Three.js and controls
    this.initThreeJS();
    this.loadData().then(() => {
      this.setupUI();
      this.updateVisualization();
    });
  }

  async loadData() {
    try {
      const response = await fetch('/info/quiz1/x_y_z_data.csv');
      if (!response.ok) throw new Error('Network response was not ok');
      const csv = await response.text();
      this.processData(csv);
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Failed to load data: ' + error.message);
    }
  }

  processData(csv) {
    const lines = csv.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
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
      select.innerHTML = '';
      
      if (includeNone) {
        const option = document.createElement('option');
        option.value = 'none';
        option.textContent = 'None';
        select.appendChild(option);
      }
      
      this.columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        select.appendChild(option);
      });
      
      // Set default value based on expected columns
      if (id === 'x-col' && this.columns.includes('x')) {
        select.value = 'x';
      } else if (id === 'y-col' && this.columns.includes('y')) {
        select.value = 'y';
      } else if (id === 'z-col' && this.columns.includes('z')) {
        select.value = 'z';
      }
    };
    
    populateSelect('x-col');
    populateSelect('y-col');
    populateSelect('z-col');
    populateSelect('color-by', true);
    
    // Set up event listeners
    document.getElementById('coord-system').addEventListener('change', (e) => {
      this.currentParams.coordSystem = e.target.value;
      this.updateVisualization();
    });
    
    ['x-col', 'y-col', 'z-col', 'color-by', 'cmap', 'label-style'].forEach(id => {
      document.getElementById(id).addEventListener('change', (e) => {
        this.currentParams[id.replace('-', '')] = e.target.value;
        this.updateVisualization();
      });
    });
    
    document.getElementById('alpha').addEventListener('input', (e) => {
      this.currentParams.alpha = parseFloat(e.target.value);
      this.updateVisualization();
    });
  }

  initThreeJS() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75, 
      this.container.clientWidth / this.container.clientHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(30, 30, 30);
    
    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Axes helper
    this.axesHelper = new THREE.AxesHelper(20);
    this.scene.add(this.axesHelper);
    
    // Animation loop
    this.animate();
  }

  updateVisualization() {
    // Clear previous points if any
    if (this.pointCloud) {
      this.scene.remove(this.pointCloud);
    }
    
    // Get current parameters
    const { coordSystem, xCol, yCol, zCol, colorBy, cmap, alpha, labelStyle } = this.currentParams;
    
    // Validate selections
    if (!xCol || !yCol || !zCol) return;
    
    // Prepare data based on coordinate system
    let points = [];
    let colorValues = [];
    
    this.data.forEach(point => {
      let x, y, z;
      
      if (coordSystem === 'cartesian') {
        x = point[xCol];
        y = point[yCol];
        z = point[zCol];
      } else if (coordSystem === 'polar') {
        // Polar coordinates (r, θ) to Cartesian (x,y)
        const r = point[xCol];
        const θ = point[yCol];
        x = r * Math.cos(θ);
        y = r * Math.sin(θ);
        z = point[zCol];
      } else if (coordSystem === 'spherical') {
        // Spherical coordinates (ρ, θ, φ) to Cartesian (x,y,z)
        const ρ = point[xCol];
        const θ = point[yCol];
        const φ = point[zCol];
        x = ρ * Math.sin(φ) * Math.cos(θ);
        y = ρ * Math.sin(φ) * Math.sin(θ);
        z = ρ * Math.cos(φ);
      }
      
      points.push({ x, y, z });
      
      if (colorBy !== 'none') {
        colorValues.push(point[colorBy]);
      }
    });
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);
    
    // Normalize color values if coloring
    let colorMin = 0, colorMax = 1;
    if (colorBy !== 'none' && colorValues.length > 0) {
      colorMin = Math.min(...colorValues);
      colorMax = Math.max(...colorValues);
    }
    
    points.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      
      if (colorBy !== 'none') {
        const normalizedValue = (colorValues[i] - colorMin) / (colorMax - colorMin);
        const color = COLORMAPS[cmap](normalizedValue);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      } else {
        // Default color (blue)
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 0.8;
      }
    });
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Create point cloud
    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: alpha,
      sizeAttenuation: true
    });
    
    this.pointCloud = new THREE.Points(geometry, material);
    this.scene.add(this.pointCloud);
    
    // Update axes labels
    this.updateAxesLabels();
  }

  updateAxesLabels() {
    // This is a simplified version - in a real implementation you'd need
    // to create 3D text objects or use a CSS overlay
    const { coordSystem, labelStyle } = this.currentParams;
    const labels = LABEL_STYLES[labelStyle];
    
    // In a real implementation, you'd update actual 3D text objects here
    console.log('Updating labels to:', {
      x: coordSystem === 'cartesian' ? labels.x : labels.transformed_x,
      y: coordSystem === 'cartesian' ? labels.y : labels.transformed_y,
      z: labels.z
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
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

// Define constants outside the class for cleaner exports
export const LABEL_STYLES = {
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

export const COLORMAPS = {
  viridis: (t) => {
    const c = new THREE.Color();
    c.setHSL(0.3 + t * 0.5, 0.9, 0.5 - t * 0.2);
    return c;
  },
  plasma: (t) => {
    const c = new THREE.Color();
    c.setHSL(0.1 + t * 0.7, 0.9, 0.5);
    return c;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new InteractiveVisualizer('graph3d');
});
