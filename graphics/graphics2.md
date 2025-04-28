---
layout: default
title: Label a Vent
---

<style>
    .shape-container {
        margin: 0;
        overflow: hidden;
        height: 60vh;
        position: relative;
        background: url('ventscreen1.jpg') no-repeat center center;
        background-size: contain;
        background-color: #f0f0f0;
        cursor: grab;
    }

    .shape {
        position: absolute;
        cursor: grab;
        user-select: none;
    }

    .shape-label {
        position: absolute;
        background-color: white;
        color: black;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: Arial, sans-serif;
        font-weight: bold;
        white-space: nowrap;
        transform: translateX(-50%);
        left: 50%;
        top: -25px;
        pointer-events: none;
        z-index: 10;
        border: 1px solid #ddd;
    }

    .circle {
        border: 4px solid #FF6B6B;
        border-radius: 50%;
        background-color: transparent;
    }

    .square {
        border: 4px solid #4ECDC4;
        background-color: transparent;
    }

    .controls-panel {
        padding: 20px;
        background: white;
        border-top: 1px solid #ddd;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }

    .shape-control-group {
        background: #f8f8f8;
        padding: 15px;
        border-radius: 5px;
    }

    .control-row {
        margin: 10px 0;
        display: flex;
        align-items: center;
    }

    label {
        min-width: 100px;
        display: inline-block;
    }

    input[type="text"], input[type="range"] {
        margin-right: 10px;
    }

    input[type="range"] {
        flex-grow: 1;
    }

    button {
        padding: 6px 12px;
        background: #4ECDC4;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 5px;
    }

    .save-load-panel {
        grid-column: span 2;
        padding: 15px;
        background: #e8f4f8;
        border-radius: 5px;
    }

    textarea {
        width: 100%;
        height: 100px;
        margin-top: 10px;
        font-family: monospace;
    }
    
    .shape-actions {
        grid-column: span 2;
        padding: 15px;
        background: #f0f0f0;
        border-radius: 5px;
        margin-bottom: 15px;
    }
    
    .shape-actions h3 {
        margin-top: 0;
    }
    
    .delete-btn {
        background: #FF6B6B;
        color: white;
        margin-left: 10px;
    }
    
    .image-controls {
        grid-column: span 2;
        padding: 15px;
        background: #e0e0e0;
        border-radius: 5px;
        margin-bottom: 15px;
    }
</style>
<h1>Label a Ventilator</h1>
<p>The problem with mechanical ventilators is that they all show the same thing in different ways. The following is for educators to utilize in the classroom to create transparent shapes to label values on the different ventilator screens.</p>
<p>A good example of how to use this is to use the Squares the highlight areas in the image and then use the Circles to contain and label certain items in an area.</p>

<p>Statement on Artifical Intelligence in Respiratory Therapy: The usage of AI in respiratory therapy will not occur from the visualization and parsing of ventilator screens, too much granularity in the data is lost to be used for analysis. Connection to the sensor pins in the RS-232 Port will be how A.I. inherits control of the Mechancail Ventilator.</p>

<div class="shape-container" id="shapeContainer">
    <!-- Initial shapes will be added here dynamically -->
</div>

<div class="controls-panel">
    <!-- Image Controls -->
    <div class="image-controls">
        <h3>Image Controls</h3>
        <button onclick="changeImage(-1)">Previous Image</button>
        <button onclick="changeImage(1)">Next Image</button>
        <span id="currentImageDisplay">Current: ventscreen1.jpg</span>
    </div>

    <!-- Shape Actions -->
    <div class="shape-actions">
        <h3>Add New Shapes</h3>
        <button onclick="addShape('circle')">Add Circle</button>
        <button onclick="addShape('square')">Add Square</button>
        <button onclick="deleteSelectedShape()" class="delete-btn">Delete Selected</button>
    </div>

    <!-- Shape Controls (will be populated dynamically) -->
    <div class="shape-control-group" id="circleControls">
        <h3>Circle Controls</h3>
        <div id="circleControlsContainer">
            <!-- Circle controls will be added here dynamically -->
        </div>
    </div>

    <div class="shape-control-group" id="squareControls">
        <h3>Square Controls</h3>
        <div id="squareControlsContainer">
            <!-- Square controls will be added here dynamically -->
        </div>
    </div>

    <!-- Save/Load Panel -->
    <div class="save-load-panel">
        <h3>Save/Load Configuration</h3>
        <button onclick="saveConfiguration()">Save Current Layout</button>
        <button onclick="loadConfiguration()">Load Saved Layout</button>
        <button onclick="exportConfiguration()">Export as JSON</button>
        <textarea id="configuration-data" placeholder="Configuration JSON will appear here..."></textarea>
    </div>
</div>

<script src="/info/js/imagelabeler.js" defer></script>
