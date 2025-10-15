---
layout: default
title: Respiratory Therapy Reference
---
 
<link rel="stylesheet" href="/info/_css/dashboard.css">

<div class="dashboard-container">
<header class="dashboard-header">
<h1>How to Hack a Mechanical Ventilator to Export the Waveforms Using an Arduino</h1>
<h2>Mechanical Ventilator Waveforms from an AVEA CareStation</h2>
<h3>I Did It For Free, How Much Did It Cost You?</h3>    
<div class="image-gallery">
  <figure class="image-container"><img src="pictures/ArduinoUnoHookup.jpg" alt="Arduino Uno Hookup Diagram"><figcaption>Figure 1: Arduino Uno setup used for data collection</figcaption></figure>
  <figure class="image-container"><img src="pictures/RS232-Pin-Config-Avea.jpg" alt="RS232 Pin Configuration for Avea Ventilator"><figcaption>Figure 2: RS-232 pin configuration for Avea ventilator</figcaption></figure>
  <figure class="image-container"><img src="pictures/Vent-Arduino-Hookup.jpg" alt="Ventilator to Arduino Connection"><figcaption>Figure 3: Complete ventilator to Arduino connection setup</figcaption></figure>
</div>

<h3>The data was collected by using a Arduino Uno to perform a Analog Read of the voltages from the RS-232 Data Pins by sticking a DuPont Pin into the RS-232 Pin Holes. This was then written to a CSV for every reading recorded. This was then parsed and loaded for working with at this page. This is the raw ventilator sensor data. This is what the ventilator manufacturers DONT want you to be able to collect. I did ask them and was severely rebuffed and dismissed by them when asking how to do this. The reason is simple, they charge over 10k for this technology and processes.</h3>
<h3>By exporting the data this way, you are essentially making a data table for each patient that is hooked up the ventilator for raw values. These raw values can then be processed by each individual facility according to their institutions for counting breaths. Currently, this is handled by the manufacturers but due to the rapid expansion of new ventilator manufacturers, has allowed for independent development of Ventilator Sensor Data Interpretation.</h3>
<h3>I have no idea who made Mechanical Ventilators. If I could find out who coded all of this beyond the service manual, I would gladly cite them, if you know who made these devices, let them know to contact me on GitHub so I can update this citation.</h3>
<h3>CareFusion. (n.d.). <cite>AVEA® ventilator system service manual</cite> (Rev. D) [Service manual]. Chapter 11: Appendices, pp. 244–246.</h3>

</header>

  <div class="dashboard-controls">
    <div class="control-panel">
      <button id="playBtn">▶ Play</button>
      <button id="stopBtn">⏹ Stop</button>
      <button id="slowBtn">⏪ Slow Down</button>
      <button id="fastBtn">⏩ Speed Up</button>
      <button id="reverseBtn">⏪ Reverse</button>
      <span class="speed-indicator">Speed: <span id="speedDisplay">1x</span></span>
    </div>
  </div>

  <div class="dashboard-content">
    <div class="chart-container"><h4 class="chart-title">All Charts</h4><div class="chart-wrapper"><canvas id="timeSeriesChart"></canvas></div></div>
    <div class="chart-container"><h4 class="chart-title">Flow Vs. Time</h4><div class="chart-wrapper"><canvas id="timeSeriesChartFlow"></canvas></div></div>
    <div class="chart-container"><h4 class="chart-title">Pressure Vs. Time</h4><div class="chart-wrapper"><canvas id="timeSeriesChartPressure"></canvas></div></div>
    <div class="chart-container"><h4 class="chart-title">Volume Vs. Time</h4><div class="chart-wrapper"><canvas id="timeSeriesChartVolume"></canvas></div></div>
    <div class="chart-container loop-chart-container"><h4 class="chart-title">PV Loop (Pressure vs Volume)</h4><div class="chart-wrapper"><canvas id="PVLoop"></canvas></div></div>
    <div class="chart-container loop-chart-container"><h4 class="chart-title">FV Loop (Flow vs Volume)</h4><div class="chart-wrapper"><canvas id="FVLoop"></canvas></div></div>
    <div class="data-table-container"><h3>Current Data Stream</h3><table id="dataTable">
        <thead><tr id="tableHeader"></tr></thead><tbody id="tableBody"></tbody></table>
    </div>
  </div>
  </div>

<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@2.0.0/dist/chartjs-adapter-date-fns.min.js"></script>
<script type="module" src="/info/js/dashboard.js"></script>
