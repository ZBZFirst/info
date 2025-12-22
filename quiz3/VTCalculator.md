---
layout: default
title: Respiratory Calculator
---

<div class="container">
  <div class="intro">
    <h1>Respiratory Calculator</h1>
    <p>This calculator is adapted from the National Board for Respiratory Care's (NBRC) "Setting Initial Tidal Volume" guidelines for Respiratory Care Practitioners in the United States. In order to become a Respiratory Therapist or a Respiratory Care Practitioner, you must demonstrate how to set the initial tidal volume. Below this is the Calculator in HTML form as described by the NBRC. The experimental section at the end is my own addition but the section prior to that are taken from here: <a href="https://www.nbrc.org/wp-content/uploads/2017/07/Setting-the-Tidal-Volume.pdf" class="btn btn-outline">NBRC Guidelines on Setting the Tidal Volume</a></p>
  </div>

  <div class="section">
    <h2>Patient Parameters</h2>
    
    <div class="card-group">
      <div class="card">
        <label for="height">Height (inches):</label>
        <input type="range" id="height" min="60" max="84" value="70" step="0.1">
        <span id="height-value">70</span>
      </div>
      
      <div class="card">
        <label for="weight">Weight (lbs):</label>
        <input type="range" id="weight" min="50" max="400" value="150" step="0.1">
        <span id="weight-value">150</span>
      </div>
      
      <div class="card">
        <label>Gender:</label>
        <div class="radio-group">
          <input type="radio" id="male" name="gender" value="M" checked>
          <label for="male">Male</label>
          <input type="radio" id="female" name="gender" value="F">
          <label for="female">Female</label>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Calculations</h2>
    
    <div class="card">
      <h3>Convert Actual Weight to Kilograms (kg)</h3>
      <div class="formula-box">
        <p><strong>Actual Weight in kg = Total Pounds / 2.2 pounds/kg</strong></p>
        <p id="weight-conversion-steps">Calculating...</p>
      </div>
    </div>

    <div class="card">
      <h3>Ideal Body Weight</h3>
      <div class="formula-box">
            <p id="ibw-formula"><strong>IBW = Base + (2.3 × (height - 60))</strong></p>
        <div id="ibw-steps">
          <p>Waiting for input...</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Tidal Volume Range</h3>
      <div class="formula-box">
        <p><strong>6-8 ml/kg IBW</strong></p>
        <div id="tidal-volume-steps">
          <p>Waiting for IBW calculation...</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Experimental Minute Ventilation</h3>
      <p>By establishing a respiratory rate constraint of 12 to 20 breaths per minute for adults, the absolute lower and          upper bounds for normal minute ventilation can be derived. This is calculated by applying the low-normal respiratory        rate to the low-normal tidal volume for the lower absolute, and the high-normal respiratory rate to the high-normal         tidal volume for the upper absolute.</p>
      <p><strong>An exmaple is provided...</strong></p>

      <div class="formula-box">
        <p><strong>VE = VT × RR</strong></p>
        <div id="ventilation-steps">
          <p>Waiting for tidal volume calculation...</p>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="{{ '/info/js/calculator.js' | relative_url }}"></script>
