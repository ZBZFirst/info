---
layout: default
title: "ABG pH Calculator"
---

# ABG Simulator

[ABG Table to All Possible Value Pairs](abg_table.html)

<div class="controls">
    <div class="slider-container">
        <label for="paco2">PaCO₂ (mmHg):</label>
        <input type="range" id="paco2" class="slider" min="10" max="100" value="40" step="1">
        <div class="value-display">Current: <span id="paco2-value">40</span></div>
    </div>
    
    <div class="slider-container">
        <label for="hco3">HCO₃⁻ (mEq/L):</label>
        <input type="range" id="hco3" class="slider" min="5" max="50" value="24" step="1">
        <div class="value-display">Current: <span id="hco3-value">24</span></div>
    </div>
</div>

<div class="results">
    <div><strong>Calculated pH:</strong> <span id="ph-value">7.40</span></div>
    <div><strong>Classification:</strong> <span id="classification" style="font-weight: bold;">Normal</span></div>
</div>

<div id="graph"></div>

<link rel="stylesheet" href="_css/abg.css">


<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

<script src="abg-simulator.js"></script>
