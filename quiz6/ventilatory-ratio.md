---
layout: default
title: Ventilatory Ratio Calculator
---
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<div class="container">
  <div class="intro">
    <h1>Ventilatory Ratio Calculator</h1>
    <p>The ventilatory ratio (VR) is a dimensionless index that reflects the efficiency of CO₂ elimination. A value >1 indicates dead space ventilation or increased metabolic CO₂ production, while <1 suggests hyperventilation.</p>
    <p class="clinical-note"><strong>Clinical Note:</strong> In ARDS patients, VR >2 is associated with higher mortality and may indicate significant dead space ventilation.</p>
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
