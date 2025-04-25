---
layout: default
title: Paul's Desktop Reference
---

<link rel="stylesheet" href="/info/_css/dashboard.css">

<div class="dashboard-container">
  <header class="dashboard-header">
    <h1>Paul's Data Analytics Dashboard</h1>
    <h2>Breathing Simulator for Healthcare Workers</h2>
    <h3>The data below was collected from a Professor who connected himself to a Mechanical Ventilator and then extracted the sensor data via an Arduino Uno.</h3>
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
    <div class="chart-container"><h4 class="chart-title">All Charts</h4><div class="chart-wrapper"><canvas id="timeSeriesChart"></canvas></div>
    <div class="chart-container"><h4 class="chart-title">Flow Vs. Time</h4><div class="chart-wrapper"><canvas id="timeSeriesChartFlow"></canvas></div>
    <div class="chart-container"><h4 class="chart-title">Pressure Vs. Time</h4><div class="chart-wrapper"><canvas id="timeSeriesChartPressure"></canvas></div>
    <div class="chart-container"><h4 class="chart-title">Volume Vs. Time</h4><div class="chart-wrapper"><canvas id="timeSeriesChartVolume"></canvas></div>
    <div class="chart-container loop-chart-container"><h4 class="chart-title">PV Loop (Pressure vs Volume)</h4><div class="chart-wrapper"><canvas id="PVLoop"></canvas></div>
    <div class="chart-container loop-chart-container"><h4 class="chart-title">FV Loop (Flow vs Volume)</h4><div class="chart-wrapper"><canvas id="FVLoop"></canvas></div>
    <div class="data-table-container"><h3>Current Data Stream</h3><table id="dataTable">
        <thead><tr id="tableHeader"></tr></thead><tbody id="tableBody"></tbody></table>
    </div>
  </div>
  </div>

<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@2.0.0/dist/chartjs-adapter-date-fns.min.js"></script>
<script src="/info/js/dashboard.js"></script>
