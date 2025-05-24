
---
layout: default
title: Mechanical Power Calculator
---
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

<div class="container">
  <div class="intro">
    <h1>Mechanical Power Calculator</h1>
    <p>This calculator estimates the mechanical power delivered to the respiratory system using Becher's simplified equation for pressure-controlled ventilation (PCV). Mechanical power represents the energy transferred from the ventilator to the patient per minute and has implications for ventilator-induced lung injury (VILI).</p>
    <p class="clinical-note"><strong>Clinical Note:</strong> Higher mechanical power values (>17 J/min) may increase the risk of VILI in ARDS patients. Values should be normalized to predicted body weight (PBW) or lung-thorax compliance (LTC) for better interpretation.</p>
  </div>

  <div class="section">
    <h2>Ventilation Parameters</h2>
    
    <div class="card-group">
      <div class="card">
        <label for="respiratory-rate">Respiratory Rate (breaths/min):</label>
        <input type="range" id="respiratory-rate" min="4" max="40" value="12" step="0.1">
        <span id="respiratory-rate-value">12</span>
        <p class="range-note">Typical range: 12-20 breaths/min</p>
      </div>
      
      <div class="card">
        <label for="tidal-volume">Tidal Volume (L):</label>
        <input type="range" id="tidal-volume" min="0.2" max="1.0" value="0.5" step="0.01">
        <span id="tidal-volume-value">0.5</span>
        <p class="range-note">ARDS protocol: 4-8 ml/kg PBW</p>
      </div>
    </div>

    <div class="card-group">
      <div class="card">
        <label for="delta-p-insp">ΔPinsp (cmH₂O):</label>
        <input type="range" id="delta-p-insp" min="5" max="40" value="15" step="0.1">
        <span id="delta-p-insp-value">15</span>
        <p class="range-note">Change in airway pressure during inspiration</p>
      </div>
      
      <div class="card">
        <label for="peep">PEEP (cmH₂O):</label>
        <input type="range" id="peep" min="0" max="20" value="5" step="0.1">
        <span id="peep-value">5</span>
        <p class="range-note">Positive end-expiratory pressure</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Calculations</h2>
    
    <div class="card">
      <h3>Mechanical Power (Becher's Equation)</h3>
      <div class="formula-box">
        <p><strong>MP = 0.098 × RR × Vt × (ΔPinsp + PEEP)</strong></p>
        <p class="formula-note">Where 0.098 is the conversion factor to Joules/minute</p>
        <div id="mp-calculation">
          <p>Waiting for input...</p>
        </div>
      </div>
    </div>

    <div class="card-group">
      <div class="card">
        <h3>PBW-Normalized MP</h3>
        <div class="formula-box">
          <label for="pbw">Predicted Body Weight (kg):</label>
          <input type="number" id="pbw" min="30" max="120" value="70">
          <div id="pbw-mp-calculation">
            <p>Enter PBW to calculate</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>LTC-Normalized MP</h3>
        <div class="formula-box">
          <label for="ltc">Dynamic Lung-Thorax Compliance (mL/cmH₂O):</label>
          <input type="number" id="ltc" min="10" max="100" value="50">
          <div id="ltc-mp-calculation">
            <p>Enter LTC to calculate</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="{{ '/info/js/mechanical-power.js' | relative_url }}"></script>
