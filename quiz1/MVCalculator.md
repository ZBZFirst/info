---
layout: default
title: "Minute Ventilation Calculator"
---

<h1 class="graph-title">Minute Ventilation Simulator</h1>

<div class="graph-controls">
    <div class="slider-container">
        <label for="respiratory-rate" class="slider-label">Respiratory Rate (breaths/min):</label>
        <input type="range" id="respiratory-rate" class="slider" min="6" max="40" value="12" step="1">
        <div class="value-display">
            Current: <span id="rr-value">12</span>
            <span id="rr-classification" class="classification-tag eupnea">(Eupnea)</span>
        </div>
    </div>
    
    <div class="slider-container">
        <label for="tidal-volume" class="slider-label">Tidal Volume (mL):</label>
        <input type="range" id="tidal-volume" class="slider" min="0" max="1000" value="500" step="10">
        <div class="value-display">Current: <span id="tv-value">500</span></div>
    </div>
</div>

<div class="graph-results">
    <div class="graph-result-item">
        <strong>Minute Ventilation:</strong> 
        <span id="minute-ventilation-value" class="graph-result-value">6.0</span> L/min
    </div>
    <div class="graph-result-item">
        <strong>Ventilation Status:</strong> 
        <span id="ventilation-classification" class="graph-result-value">Normal Ventilation</span>
    </div>
</div>

<div id="ventilation-graph" class="graph-container"></div>

<link rel="stylesheet" href="/info/_css/graph-components.css">
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="/info/js/ventilation-calculator.js"></script>

<style>
    /* Add to your existing CSS */
    .classification-tag {
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
        font-weight: bold;
    }
    .bradypnea { background-color: #3498db; color: white; }
    .eupnea { background-color: #2ecc71; color: white; }
    .tachypnea { background-color: #e74c3c; color: white; }
</style>
