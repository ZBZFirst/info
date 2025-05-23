---
layout: default
title: PaCO2 Adjustment Calculator
---

<div class="container">
  <div class="intro">
    <h1>PaCO2 Adjustment Calculator</h1>
    <p>This calculator helps respiratory care practitioners adjust ventilation parameters based on arterial carbon dioxide (PaCO2) levels. When a patient's PaCO2 is not at the desired level, you can use these calculations to determine new ventilator settings by adjusting either tidal volume, respiratory rate, or both.</p>
  </div>

  <div class="section">
    <h2>Current Ventilation Parameters</h2>
    
    <div class="card-group">
      <div class="card">
        <label for="current-paco2">Current PaCO2 (mmHg):</label>
        <input type="range" id="current-paco2" min="20" max="100" value="40" step="0.1">
        <span id="current-paco2-value">40</span>
      </div>
      
      <div class="card">
        <label for="desired-paco2">Desired PaCO2 (mmHg):</label>
        <input type="range" id="desired-paco2" min="20" max="100" value="35" step="0.1">
        <span id="desired-paco2-value">35</span>
      </div>
    </div>

    <div class="card-group">
      <div class="card">
        <label for="current-rr">Current Respiratory Rate (breaths/min):</label>
        <input type="range" id="current-rr" min="4" max="40" value="12" step="0.1">
        <span id="current-rr-value">12</span>
      </div>
      
      <div class="card">
        <label for="current-vt">Current Tidal Volume (ml):</label>
        <input type="range" id="current-vt" min="200" max="1000" value="500" step="1">
        <span id="current-vt-value">500</span>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Calculations</h2>
    
    <div class="card">
      <h3>Current Minute Ventilation</h3>
      <div class="formula-box">
        <p><strong>Minute Ventilation (VE) = Tidal Volume (VT) × Respiratory Rate (RR)</strong></p>
        <div id="current-ve-steps">
          <p>Waiting for input...</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>New Minute Ventilation Required</h3>
      <div class="formula-box">
        <p><strong>New VE = (Current PaCO2 × Current VE) / Desired PaCO2</strong></p>
        <div id="new-ve-steps">
          <p>Waiting for input...</p>
        </div>
      </div>
    </div>

    <div class="card-group">
      <div class="card">
        <h3>Option 1: Adjust Respiratory Rate</h3>
        <div class="formula-box">
          <p><strong>New RR = New VE / Current VT</strong></p>
          <div id="new-rr-steps">
            <p>Waiting for calculation...</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Option 2: Adjust Tidal Volume</h3>
        <div class="formula-box">
          <p><strong>New VT = New VE / Current RR</strong></p>
          <div id="new-vt-steps">
            <p>Waiting for calculation...</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Option 3: Adjust Both RR and VT Proportionally</h3>
      <p>This option maintains the same ratio between respiratory rate and tidal volume while achieving the desired minute ventilation.</p>
      <div class="formula-box">
        <p><strong>Adjustment Factor = New VE / Current VE</strong></p>
        <div id="adjustment-factor-steps">
          <p>Waiting for calculation...</p>
        </div>
        <p><strong>New RR = Current RR × √Adjustment Factor</strong></p>
        <p><strong>New VT = Current VT × √Adjustment Factor</strong></p>
        <div id="proportional-adjustment-steps">
          <p>Waiting for calculation...</p>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="{{ '/info/js/paCO2-calculator.js' | relative_url }}"></script>
