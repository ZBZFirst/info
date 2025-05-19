---
layout: default
title: "Oxygenation Index"
mathjax: true
---
<script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>
<script src="/info/js/OIInteractive.js"></script>

<div class="container">
  <div class="intro">
    <h1>Oxygenation Index (OI) Visualization</h1>
    <p>Interactive 3D visualization of the relationship between FiO₂, MAP, PaO₂ and the calculated Oxygenation Index.</p>
  </div>

  <div class="section equation-section">
    <h2>Oxygenation Index Formula</h2>
    <div class="equation-container">
      <p>The Oxygenation Index (OI) is calculated using the following formula:</p>
      <div class="math-display">
        $$ OI = \frac{FiO_2 \times MAP \times 100}{PaO_2} $$
      </div>
      <p>Where:</p>
      <ul>
        <li><strong>FiO₂</strong>: Fraction of inspired oxygen (0.21 to 1.0)</li>
        <li><strong>MAP</strong>: Mean airway pressure in cmH₂O (5 to 50)</li>
        <li><strong>PaO₂</strong>: Partial pressure of arterial oxygen in mmHg (35 to 100)</li>
      </ul>
    </div>
  </div>

  <div class="section interpretation-section">
    <h2>Clinical Interpretation</h2>
    <div class="card">
      <p>The Oxygenation Index is a measure of how much oxygen support a patient needs relative to their blood oxygen level. Higher values indicate worse oxygenation:</p>
      <ul>
        <li><strong>OI &lt; 5</strong>: Normal oxygenation</li>
        <li><strong>OI 5-15</strong>: Mild to moderate respiratory failure</li>
        <li><strong>OI 15-25</strong>: Severe respiratory failure</li>
        <li><strong>OI 25-40</strong>: Very severe respiratory failure</li>
        <li><strong>OI &gt; 40</strong>: Extremely severe respiratory failure</li>
      </ul>
    </div>
  </div>

  <div class="section visualization-section">
    <h2>Interactive Visualization</h2>
    <div class="card">
      <div id="plot"></div>
      <p class="visualization-note">This 3D plot shows simulated patient data with:
        <br>- X/Y axes: Derived from normalized PaO₂ and FiO₂ values
        <br>- Z axis (height): Oxygenation Index (OI)
        <br>- Color: Corresponds to OI value (red = higher, green = lower)
      </p>
    </div>
  </div>
</div>
