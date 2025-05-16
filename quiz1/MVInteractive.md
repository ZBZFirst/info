---
layout: default
title: "Minute Ventilation Calculator"
---
<link rel="stylesheet" href="/info/_css/bigdata.css">

<div class="graph">
  {% include data-processor.html %}
  {% include 3d-visualizer.html %}

  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/"
    }
  }
  </script>

  <!-- Main visualization script -->
  <script type="module">
    // Import with proper specifiers
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    
    // Data processing function
    function processCSV(csv) {
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      const result = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const obj = {};
        const currentline = lines[i].split(',');
        
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j].trim()] = parseFloat(currentline[j]);
        }
        result.push(obj);
      }
      
      return result;
    }

    // Visualization class
    class DataVisualizer {
      constructor(containerId, data) {
        console.log("Initializing visualization...");
        this.container = document.getElementById(containerId);
        this.data = data;
        this.init();
      }

      init() {
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

        // Create visualization
        this.createVisualization();
        
        // Add controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start animation loop
        this.animate();
      }

      createVisualization() {
        // Find data ranges for normalization
        const yValues = this.data.map(d => d.y);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);

        // Create geometry
        const positions = new Float32Array(this.data.length * 3);
        const colors = new Float32Array(this.data.length * 3);
        
        this.data.forEach((point, i) => {
          // Positions
          positions[i*3] = point.x;
          positions[i*3+1] = point.y;
          positions[i*3+2] = point.z;
          
          // Color mapping (blue to red)
          const normalizedY = (point.y - yMin) / (yMax - yMin);
          const hue = 0.6 * (1 - normalizedY);
          const color = new THREE.Color().setHSL(hue, 0.9, 0.5);
          colors[i*3] = color.r;
          colors[i*3+1] = color.g;
          colors[i*3+2] = color.b;
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create point cloud
        const material = new THREE.PointsMaterial({
          size: 0.2,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          sizeAttenuation: true
        });

        this.pointCloud = new THREE.Points(geometry, material);
        this.scene.add(this.pointCloud);

        // Add coordinate axes
        const axesHelper = new THREE.AxesHelper(20);
        this.scene.add(axesHelper);
      }

      onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      }

      animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      }
    }

    // Load and visualize data
    try {
      console.log("Starting data load...");
      const response = await fetch('/info/quiz1/x_y_z_data.csv');
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`);
      }
      
      const csv = await response.text();
      const data = processCSV(csv);
      
      if (!data || data.length === 0) {
        throw new Error('No valid data processed');
      }
      
      console.log(`Successfully loaded ${data.length} data points`);
      new DataVisualizer('graph3d', data);
      
    } catch (error) {
      console.error("Visualization error:", error);
      const container = document.getElementById('graph3d');
      container.innerHTML = `
        <div style="color: red; padding: 20px;">
          <h3>Error Loading Visualization</h3>
          <p>${error.message}</p>
          <p>Check console for details</p>
        </div>
      `;
    }
  </script>
