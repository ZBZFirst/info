---
layout: default
title: "Minute Ventilation Calculator"
---

<link rel="stylesheet" href="/info/_css/bigdata.css">

<div class="visualization-container">
  <!-- Control Panel -->
  <div class="control-panel">
    <div class="control-group">
      <label for="coord-system">Coordinate System:</label>
      <select id="coord-system" class="form-control">
        <option value="cartesian">Cartesian</option>
        <option value="polar">Polar</option>
        <option value="spherical">Spherical</option>
      </select>
    </div>

    <div class="control-group axis-controls">
      <label for="x-col">X/Radius:</label>
      <select id="x-col" class="form-control axis-select"></select>
      
      <label for="y-col">Y/Theta:</label>
      <select id="y-col" class="form-control axis-select"></select>
      
      <label for="z-col">Z/Phi:</label>
      <select id="z-col" class="form-control axis-select"></select>
    </div>

    <div class="control-group">
      <label for="color-by">Color By:</label>
      <select id="color-by" class="form-control">
        <option value="none">None</option>
      </select>
    </div>

    <div class="control-group">
      <label for="cmap">Colormap:</label>
      <select id="cmap" class="form-control">
        <option value="viridis">Viridis</option>
        <option value="plasma">Plasma</option>
        <option value="inferno">Inferno</option>
        <option value="magma">Magma</option>
        <option value="cividis">Cividis</option>
      </select>
    </div>

    <div class="control-group">
      <label for="alpha">Opacity:</label>
      <input type="range" id="alpha" min="0.1" max="1" step="0.1" value="0.7" class="form-control">
    </div>

    <div class="control-group">
      <label for="label-style">Label Style:</label>
      <select id="label-style" class="form-control">
        <option value="simple">Simple</option>
        <option value="clinical">Clinical</option>
      </select>
    </div>
  </div>

  <!-- Visualization Area -->
  <div id="graph3d" class="graph-3d"></div>
</div>

<script type="module">
  console.log("Starting module import test...");
  
  try {
    // Test THREE.js import
    console.log("Attempting to import THREE...");
    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
    console.log("THREE imported successfully:", THREE);
    
    // Test OrbitControls import
    console.log("Attempting to import OrbitControls...");
    import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';
    console.log("OrbitControls imported successfully");
    
    // Test your visualizer import
    console.log("Attempting to import visualizer...");
    const visualizerModule = await import('/info/_includes/3d-visualizer.js');
    console.log("Visualizer imported successfully");
    
    document.addEventListener('DOMContentLoaded', () => {
      console.log("Initializing visualizer...");
      new visualizerModule.InteractiveVisualizer('graph3d');
    });
  } catch (error) {
    console.error("Import chain failed:", error);
    document.getElementById('graph3d').innerHTML = `
      <div class="error">
        <h3>Import Error</h3>
        <p>${error.message}</p>
        <p>Check console for details</p>
      </div>
    `;
  }
</script>
