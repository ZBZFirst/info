---
layout: default
title: "ABG pH Calculator"
---

<article class="intro">
    <h1>Arterial Blood Gas (<strong>ABG</strong>) Analysis and Classification</h1>
    <p>
        <strong>ABG</strong> analysis is a vital diagnostic process that evaluates a patient’s gas exchange and acid-base status. Typically performed after arterial puncture and specimen collection, <strong>ABG</strong> interpretation relies on comparing key values—such as partial pressure of oxygen (<strong>PaO₂</strong>), carbon dioxide (<strong>PaCO₂</strong>), and blood <strong>pH</strong>—against calibrated standards within the <strong>ABG</strong> analyzer. These values are measured using specialized electrodes: the <em>Clark electrode</em> for <strong>PaO₂</strong>, the <em>Severinghaus electrode</em> for <strong>PaCO₂</strong>, and the <em>Glass electrode</em> for <strong>pH</strong>.
    </p>
    <p>
        Using the <strong>Henderson-Hasselbalch</strong> equation, clinicians can determine the blood's <strong>pH</strong> and evaluate its alignment with normal physiological parameters. By analyzing the relationship between <strong>PaCO₂</strong> (respiratory component) and bicarbonate (<strong>HCO₃⁻</strong>, metabolic component), we can classify the patient’s condition into categories such as <span style="color:red;">respiratory acidosis</span>, <span style="color:blue;">respiratory alkalosis</span>, <span style="color:red;">metabolic acidosis</span>, or <span style="color:blue;">metabolic alkalosis</span>.
    </p>
    <p>
        <strong>ABG</strong> classification aids in identifying whether the body is compensating for an abnormality and if the condition is acute or chronic. Some results indicate a need for immediate medical intervention—such as severe <span style="color:red;">acidosis</span> or hypoxemia—while others may suggest a “wait and see” strategy, depending on severity and patient symptoms. However, any abnormal <strong>ABG</strong> finding warrants increased clinical observation, with overnight monitoring recommended before considering discharge.
    </p>
    <p>
        This interactive <strong>ABG</strong> calculator demonstrates how changes in <strong>PaCO₂</strong> and <strong>HCO₃⁻</strong> affect <strong>pH</strong>, providing insights into the body’s acid-base balance and helping guide decision-making based on real-time inputs.
    </p>
    <p><a href="abg_table.html">ABG Table to All Possible Value Pairs</a></p>
</article>

<section class="calculator-section">
    <h2 class="section-title">ABG Calculator</h2>
    <div class="calculator-wrapper">
        <!-- Upper Group (Sliders + Equation) -->
        <div class="calculator-group upper-group">
            <!-- Grid 1: Sliders -->
            <div class="grid-item controls-container">
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
            </div>

            <!-- Grid 2: Equation -->
            <div class="grid-item equation-container">
                <section class="equation-section">
                    <h3>Henderson-Hasselbalch Equation</h3>
                    <div class="equation-content">
                        <p>The pH is calculated using:</p>
                        \[ \text{pH} = 6.1 + \log\left(\frac{\text{HCO}_3^-}{0.03 \times \text{PaCO}_2}\right) \]
                        
                        <div class="current-values">
                            <p>With your current values:</p>
                            <div id="dynamic-equation">
                                \[ \text{pH} = 6.1 + \log\left(\frac{<span id="current-hco3">24</span>}{0.03 \times <span id="current-paco2">40</span>}\right) \]
                            </div>
                        </div>
                        
                        <div class="final-result">
                            <p><strong>Calculated pH:</strong> <span id="ph-value">7.40</span></p>
                            <p><strong>Classification:</strong> <span id="classification" class="result-label">Normal</span></p>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <!-- Lower Group (Classification + Graph) -->
        <div class="calculator-group lower-group">
            <!-- Grid 3: Classification Logic -->
            <div class="grid-item classification-container">
                <section class="classification-logic">
                    <h3>Classification Logic</h3>
                    <div id="classification-steps" class="logic-steps">
                        <!-- This will be populated dynamically -->
                    </div>
                </section>
            </div>

            <!-- Grid 4: Graph -->
            <div class="grid-item graph-container">
                <section class="graph-section">
                    <h2 class="graph-heading">pH Visualization</h2>
                    <div id="graph" class="graph-content"></div>
                </section>
            </div>
        </div>
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
        document.getElementById('current-paco2').textContent = paco2Slider.value;
        document.getElementById('current-hco3').textContent = hco3Slider.value;
    }
    
    paco2Slider.addEventListener('input', updateEquation);
    hco3Slider.addEventListener('input', updateEquation);
});
</script>
