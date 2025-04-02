---
layout: default
title: "ABG pH Calculator"
---

# ABG Simulator

[ABG Table to All Possible Value Pairs](abg_table.md)

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

<style>
    body {
        font-family: Arial, sans-serif;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        line-height: 1.6;
    }
    .controls {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    .slider-container {
        width: 45%;
    }
    .slider {
        width: 100%;
    }
    .results {
        background-color: #f5f5f5;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
    }
    #graph {
        width: 100%;
        height: 600px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }
    label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }
    .value-display {
        text-align: right;
        font-size: 0.9em;
        color: #555;
    }
</style>

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="/js/abg-calculator.js"></script>
