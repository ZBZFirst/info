---
layout: default
title: Respiratory Calculator
---

<div class="calculator-container">
  <h1>Respiratory Calculator</h1>
  
  <div class="input-section">
    <h2>Patient Parameters</h2>
    
    <div class="slider-container">
      <label for="height">Height (inches):</label>
      <input type="range" id="height" min="48" max="84" value="70" step="0.1">
      <span id="height-value">70</span>
    </div>
    
    <div class="slider-container">
      <label for="weight">Weight (lbs):</label>
      <input type="range" id="weight" min="50" max="400" value="150" step="0.1">
      <span id="weight-value">150</span>
    </div>
    
    <div class="radio-container">
      <label>Gender:</label>
      <input type="radio" id="male" name="gender" value="M" checked>
      <label for="male">Male</label>
      <input type="radio" id="female" name="gender" value="F">
      <label for="female">Female</label>
    </div>
  </div>

  <div class="results-section">
    <!-- Weight Conversion -->
    <div class="calculation-container">
      <h3>Weight Conversion</h3>
      <div class="formula-box">
        <p>kg = lbs / 2.2</p>
        <p id="weight-conversion-steps">Calculating...</p>
      </div>
    </div>

    <!-- IBW Calculation -->
    <div class="calculation-container">
      <h3>Ideal Body Weight</h3>
      <div class="formula-box">
        <p id="ibw-formula">IBW = Base + (2.3 × (height - 60))</p>
        <div id="ibw-steps">
          <p>Waiting for input...</p>
        </div>
      </div>
    </div>

    <!-- Tidal Volume -->
    <div class="calculation-container">
      <h3>Tidal Volume Range</h3>
      <div class="formula-box">
        <p>6-8 ml/kg IBW</p>
        <div id="tidal-volume-steps">
          <p>Waiting for IBW calculation...</p>
        </div>
      </div>
    </div>

    <!-- Minute Ventilation -->
    <div class="calculation-container">
      <h3>Experimental Minute Ventilation</h3>
      <div class="formula-box">
        <p>VE = VT × RR</p>
        <div id="ventilation-steps">
          <p>Waiting for tidal volume calculation...</p>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="{{ '/assets/js/calculator.js' | relative_url }}"></script>
