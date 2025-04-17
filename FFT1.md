---
layout: default
title: Fast Fourier Transform
---

<div class="audio-visualizer">
    <h1>{{ page.title }}</h1>
    
    <div class="control-group">
        <button id="startBtn">Start Visualizer</button>
        <div id="deviceList" class="hidden"></div>
    </div>
    
    <div class="control-group">
        <h3>Audio Processing</h3>
        <label for="sensitivity">Base Sensitivity: <span id="sensitivityValue">50</span>%</label>
        <input type="range" id="sensitivity" min="1" max="100" value="50">
        
        <label for="dynamicRange">Dynamic Range: <span id="dynamicRangeValue">70</span>%</label>
        <input type="range" id="dynamicRange" min="0" max="100" value="70">
        
        <label for="noiseFloor">Noise Reduction: <span id="noiseFloorValue">20</span>%</label>
        <input type="range" id="noiseFloor" min="0" max="100" value="20">
    </div>
    
    <canvas id="visualizer" width="800" height="400"></canvas>
</div>

<link rel="stylesheet" href="_css/fft.css">
<script src="fft.js" defer></script>
