---
layout: default
title: Ventilatory Ratio Calculator
---
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<!-- Load Plotly library -->
<script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>
<link rel="stylesheet" href="/info/_css/bigdata.css">

<div class="container">
  <div class="intro">
    <h1>Ventilatory Ratio Calculator</h1>
    <p>The ventilatory ratio (VR) is a dimensionless index that reflects the efficiency of CO₂ elimination. A value >1 indicates dead space ventilation or increased metabolic CO₂ production, while <1 suggests hyperventilation.</p>
    <p class="clinical-note"><strong>Clinical Note:</strong> In ARDS patients, VR >2 is associated with higher mortality and may indicate significant dead space ventilation.</p>
  </div>

  <div class="visualization-wrapper">
    <!-- Control Panel -->
    <div class="control-panel">
      <h3>Visualization Controls</h3>
      
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
        <select id="x-col" class="form-control axis-select">
          <option value="minute_ventilation">Minute Ventilation</option>
          <option value="paco2">PaCO₂</option>
          <option value="vr">Ventilatory Ratio</option>
        </select>
        
        <label for="y-col">Y/Theta:</label>
        <select id="y-col" class="form-control axis-select">
          <option value="paco2">PaCO₂</option>
          <option value="minute_ventilation">Minute Ventilation</option>
          <option value="vr">Ventilatory Ratio</option>
        </select>
        
        <label for="z-col">Z/Phi:</label>
        <select id="z-col" class="form-control axis-select">
          <option value="vr">Ventilatory Ratio</option>
          <option value="minute_ventilation">Minute Ventilation</option>
          <option value="paco2">PaCO₂</option>
        </select>
      </div>

      <div class="control-group">
        <label for="color-by">Color By:</label>
        <select id="color-by" class="form-control">
          <option value="none">None</option>
          <option value="vr">Ventilatory Ratio</option>
          <option value="paco2">PaCO₂</option>
          <option value="minute_ventilation">Minute Ventilation</option>
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
    <div id="vr-3d-plot" class="graph-3d"></div>
  </div>

  <div class="section">
    <h2>Required Parameters</h2>
    
    <div class="card-group">
      <div class="card">
        <label for="minute-ventilation">Minute Ventilation (mL/min):</label>
        <input type="range" id="minute-ventilation" min="3000" max="20000" value="6000" step="100">
        <span id="minute-ventilation-value">6000</span>
      </div>
      
      <div class="card">
        <label for="paco2">PaCO₂ (mmHg):</label>
        <input type="range" id="paco2" min="20" max="100" value="40" step="0.1">
        <span id="paco2-value">40</span>
      </div>
    </div>

    <div class="card">
      <label for="pbw">Predicted Body Weight (kg):</label>
      <input type="number" id="pbw" min="30" max="120" value="70">
    </div>
  </div>
 
  <div class="section">
    <h2>Ventilatory Ratio Calculation</h2>
    
    <div class="card">
      <div class="formula-box">
        <p><strong>VR = [Minute Ventilation × PaCO₂] / [PBW × 100 × 37.5]</strong></p>
        <div id="vr-calculation">
          <p>Waiting for input...</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Interpretation</h3>
      <div id="vr-interpretation">
        <p>Results will appear here</p>
      </div>
    </div>
  </div>
</div>

<script src="{{ '/info/js/plotly-visualizer-vr.js' | relative_url }}"></script>
