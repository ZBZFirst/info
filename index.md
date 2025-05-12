---
layout: default
title: Paul's Desktop Reference
---

<link rel="stylesheet" href="/info/_css/dashboard.css">

<div class="dashboard-container">
  <header class="dashboard-header">
    <h1>Pauls Waveform Recording</h1>
    <h2>I forgot where exactly I recorded this as I have a few recordings of Mechanical Ventilator Waveforms but this is what you would expect to see.</h2>
    <h3>The data was colleted by using a Arduino Uno to perform a Analog Read of the voltages from the RS-232 Data Pins by sticking a DuPont Pin into the RS-232 Pin Holes. This was then written to a CSV for every reading recorded. This was then parsed and loaded for working with at this page. This is the raw ventilator sensor data. This is what the ventilator manufacturers DONT want you to be able to collect.</h3>
    <h3>By exporting the data this way, you are essentially making a data table for each patient that is hooked up the ventilator for raw values. These raw values can then be processed by each individual facility according to their institutions metric for counting breaths. Currently, this is handled by the manufacturers but due to the rapid expansion of ventilator manufacturers has allowed for independent development of Ventilator Sensor Data Interpretation.</h3>
    <h3>Essentially, I do not agree with how breaths are counted and I think we may disagree on the math, so lets review the source code and argue how it SHOULD be done instead of how it is currently working. Especially since random people who have never been mentioned made these devices.</h3>
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
