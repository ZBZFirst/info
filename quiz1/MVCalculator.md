---
layout: default
title: "Minute Ventilation Calculator"
---

<h1 class="graph-title">Minute Ventilation Simulator</h1>

<div class="graph-controls">
    <div class="slider-container">
        <label for="respiratory-rate" class="slider-label">Respiratory Rate (breaths/min):</label>
        <input type="range" id="respiratory-rate" class="slider" min="6" max="40" value="12" step="1">
        <div class="value-display">Current: <span id="rr-value">12</span></div>
    </div>
    
    <div class="slider-container">
        <label for="tidal-volume" class="slider-label">Tidal Volume (mL):</label>
        <input type="range" id="tidal-volume" class="slider" min="200" max="1000" value="500" step="10">
        <div class="value-display">Current: <span id="tv-value">500</span></div>
    </div>
</div>

<div class="graph-results">
    <div class="graph-result-item">
        <strong>Minute Ventilation:</strong> 
        <span id="minute-ventilation-value" class="graph-result-value">6.0</span> L/min
    </div>
    <div class="graph-result-item">
        <strong>Classification:</strong> 
        <span id="ventilation-classification" class="graph-result-value">Normal</span>
    </div>
</div>

<div id="ventilation-graph" class="graph-container"></div>

<link rel="stylesheet" href="css/graph-components.css">
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="js/ventilation-calculator.js"></script>
