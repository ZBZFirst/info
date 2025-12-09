---
layout: default
title: Open Source Ventilator Waveforms
---
 
<link rel="stylesheet" href="/info/_css/dashboard.css">

<div class="dashboard-container">
<header class="dashboard-header">
<h1>How to Hack a Mechanical Ventilator to Export the Waveforms Using an Arduino</h1>
<h2>Mechanical Ventilator Waveforms from an AVEA CareStation</h2>
<h3>Information never Needs to Cost Anything</h3>    
<div class="image-gallery">
  <figure class="image-container"><img src="pictures/ArduinoUnoHookup.jpg" alt="Arduino Uno Hookup Diagram"><figcaption>Figure 1: Arduino Uno setup used for data collection</figcaption></figure>
  <figure class="image-container"><img src="pictures/RS232-Pin-Config-Avea.jpg" alt="RS232 Pin Configuration for Avea Ventilator"><figcaption>Figure 2: RS-232 pin configuration for Avea ventilator</figcaption></figure>
  <figure class="image-container"><img src="pictures/Vent-Arduino-Hookup.jpg" alt="Ventilator to Arduino Connection"><figcaption>Figure 3: Complete ventilator to Arduino connection setup</figcaption></figure>
</div>

<header>
  <h3>Data Collection Overview</h3>
  <p>
    The data was collected using an Arduino Uno to perform analog readings of voltages from the RS-232 data pins by inserting a DuPont pin into the RS-232 connector. Each reading was recorded to a CSV file as a row, resulting in over 15,000 samples captured over 15 seconds. The parsed dataset shown on this page represents raw ventilator sensor outputs. There are 4 distinct sensor outputs from the AVEA Carestation in particular. These are the Pressure, Flow, Volume and Phase Waveforms. The sensor readings are converted to a numerical range to be easily exported. Please hit the play button below.
  </p>

  <p>
    Manufacturers typically restrict access to this kind of data, as ventilator systems often cost upwards of $50,000. Additional costs are added on for exporting data in this manner that can be quite expensive. In addition, the amount of people who can interpret these waveforms is limited to the Respiratory Therapy community which does not have a means to receive billing for analysis of these waveforms in a easily defined way.</p>

  <p>
    I do not know who originally developed the ventilator software and hardware beyond the publicly available service manuals. If you have information about the creators, please contact me on GitHub so I can add proper citations.
  </p>

  <p>
    <strong>Reference:</strong><br>
    CareFusion. (n.d.). <cite>AVEA® Ventilator System Service Manual</cite> (Rev. D), Chapter 11: Appendices, pp. 244–246.
  </p>
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
