---
layout: default
title: Paul's Desktop Reference
---

<link rel="stylesheet" href="/info/_css/dashboard.css">

<div class="dashboard-container">
  <header class="dashboard-header">
    <h1>Paul's Data Analytics Dashboard</h1>
    <h2>Real-time Time Series Visualization</h2>
  </header>

  <div class="dashboard-controls">
    <div class="control-panel">
      <button id="playBtn">▶ Play</button>
      <button id="stopBtn">⏹ Stop</button>
      <button id="slowBtn">⏪ Slow Down</button>
      <button id="fastBtn">⏩ Speed Up</button>
      <span class="speed-indicator">Speed: <span id="speedDisplay">1x</span></span>
    </div>
  </div>

  <div class="dashboard-content">
    <div class="chart-container">
      <canvas id="timeSeriesChart"></canvas>
    </div>
    <div class="data-table-container">
      <h3>Current Data Stream</h3>
      <table id="dataTable">
        <thead>
          <tr id="tableHeader"></tr>
        </thead>
        <tbody id="tableBody"></tbody>
      </table>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
<script src="/info//js/dashboard.js"></script>
