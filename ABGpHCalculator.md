---
layout: default
title: "ABG pH Calculator"
---

<article class="intro">
    <h1>Arterial Blood Gas (ABG) Calculator and Classifier</h1>
    <p>This interactive tool helps you understand and interpret arterial blood gas (ABG) results. Adjust the sliders for PaCO₂ and HCO₃⁻ values to see how they affect blood pH and the resulting classification.</p>
    <p>The calculator uses the Henderson-Hasselbalch equation to determine pH and classifies the acid-base status based on your inputs.</p>
</article>

<section class="calculator-section">
    <h2>ABG Calculator</h2>
    <p><a href="abg_table.html">ABG Table to All Possible Value Pairs</a></p>

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

<section class="results">
        <h3>Results</h3>
        <p><strong>Calculated pH:</strong> <span id="ph-value">7.40</span></p>
        <p><strong>Classification:</strong> <span id="classification" class="result-label">Normal</span></p>
</section>

<section class="equation-section">
    <h3>Henderson-Hasselbalch Equation</h3>
    <div class="equation-container">
        <p>The pH is calculated using:</p>
        \[ \text{pH} = 6.1 + \log\left(\frac{\text{HCO}_3^-}{0.03 \times \text{PaCO}_2}\right) \]
        <p>With your current values:</p>
        <div id="dynamic-equation">
            \[ \text{pH} = 6.1 + \log\left(\frac{\text{HCO}_3^-}{0.03 \times \text{PaCO}_2}\right) \]
        </div>
    </div>
</section>

<section class="classification-logic">
    <h3>Classification Logic</h3>
    <div id="classification-steps" class="logic-steps">
        <!-- This will be populated dynamically -->
    </div>
</section>

<section class="graph-section">
    <h2>pH Visualization</h2>
    <div id="graph"></div>
</section>


<section class="classification-logic">
    <h3>Classification Logic Reference</h3>
    <div class="table-responsive">
        <table id="classification-table" class="logic-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Condition</th>
                    <th>pH Range</th>
                    <th>PaCO₂ Range</th>
                    <th>HCO₃⁻ Range</th>
                    <th>Compensation</th>
                    <th>Color</th>
                </tr>
            </thead>
            <tbody>
                <!-- Will be populated dynamically -->
            </tbody>
        </table>
    </div>
</section>

<link rel="stylesheet" href="_css/graph-components.css">
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<script src="abg-simulator.js"></script>
<script src="js/abg-background.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const paco2Slider = document.getElementById('paco2');
    const hco3Slider = document.getElementById('hco3');
    function updateEquation() {
        document.getElementById('equation-paco2').textContent = paco2Slider.value;
        document.getElementById('equation-hco3').textContent = hco3Slider.value;
    }
    paco2Slider.addEventListener('input', updateEquation);
    hco3Slider.addEventListener('input', updateEquation);
});
</script>
