---
layout: default
title: Interactive Draggable Graphics
---

<style>
    .shape-container {
        margin: 0;
        overflow: hidden;
        height: 60vh;
        position: relative;
        background: url('image.png') no-repeat center center;
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
</style>

<div class="shape-container">
    <!-- Circles -->
    <div id="circle1" class="shape circle" style="top: 100px; left: 50px; width: 80px; height: 80px;">
        <div class="shape-label">Peak Pressure</div>
    </div>
    <div id="circle2" class="shape circle" style="top: 100px; left: 200px; width: 80px; height: 80px;">
        <div class="shape-label">PEEP</div>
    </div>
    <div id="circle3" class="shape circle" style="top: 100px; left: 350px; width: 80px; height: 80px;">
        <div class="shape-label">HE</div>
    </div>
    
    <!-- Squares -->
    <div id="square1" class="shape square" style="top: 250px; left: 50px; width: 100px; height: 80px;">
        <div class="shape-label">Minute Ventilation</div>
    </div>
    <div id="square2" class="shape square" style="top: 250px; left: 200px; width: 100px; height: 80px;">
        <div class="shape-label">Waveforms</div>
    </div>
    <div id="square3" class="shape square" style="top: 250px; left: 350px; width: 100px; height: 80px;">
        <div class="shape-label">HAXI</div>
    </div>
</div>

<div class="controls-panel">
    <!-- Circle Controls -->
    <div class="shape-control-group">
        <h3>Circle Controls</h3>
        
        <div class="control-row">
            <label for="circle1-label">Peak Pressure:</label>
            <input type="text" id="circle1-label" value="Peak Pressure">
            <button onclick="updateLabel('circle1')">Update</button>
        </div>
        <div class="control-row">
            <label for="circle1-size">Size:</label>
            <input type="range" id="circle1-size" min="40" max="150" value="80" oninput="updateCircleSize('circle1')">
        </div>
        
        <div class="control-row">
            <label for="circle2-label">PEEP:</label>
            <input type="text" id="circle2-label" value="PEEP">
            <button onclick="updateLabel('circle2')">Update</button>
        </div>
        <div class="control-row">
            <label for="circle2-size">Size:</label>
            <input type="range" id="circle2-size" min="40" max="150" value="80" oninput="updateCircleSize('circle2')">
        </div>
        
        <div class="control-row">
            <label for="circle3-label">HE:</label>
            <input type="text" id="circle3-label" value="HE">
            <button onclick="updateLabel('circle3')">Update</button>
        </div>
        <div class="control-row">
            <label for="circle3-size">Size:</label>
            <input type="range" id="circle3-size" min="40" max="150" value="80" oninput="updateCircleSize('circle3')">
        </div>
    </div>

    <!-- Square Controls -->
    <div class="shape-control-group">
        <h3>Square Controls</h3>
        
        <div class="control-row">
            <label for="square1-label">Minute Ventilation:</label>
            <input type="text" id="square1-label" value="Minute Ventilation">
            <button onclick="updateLabel('square1')">Update</button>
        </div>
        <div class="control-row">
            <label for="square1-width">Width:</label>
            <input type="range" id="square1-width" min="40" max="800" value="100" oninput="updateSquareSize('square1')">
        </div>
        <div class="control-row">
            <label for="square1-height">Height:</label>
            <input type="range" id="square1-height" min="40" max="800" value="80" oninput="updateSquareSize('square1')">
        </div>
        
        <div class="control-row">
            <label for="square2-label">Waveforms:</label>
            <input type="text" id="square2-label" value="Waveforms">
            <button onclick="updateLabel('square2')">Update</button>
        </div>
        <div class="control-row">
            <label for="square2-width">Width:</label>
            <input type="range" id="square2-width" min="40" max="800" value="100" oninput="updateSquareSize('square2')">
        </div>
        <div class="control-row">
            <label for="square2-height">Height:</label>
            <input type="range" id="square2-height" min="40" max="800" value="80" oninput="updateSquareSize('square2')">
        </div>
        
        <div class="control-row">
            <label for="square3-label">HAXI:</label>
            <input type="text" id="square3-label" value="HAXI">
            <button onclick="updateLabel('square3')">Update</button>
        </div>
        <div class="control-row">
            <label for="square3-width">Width:</label>
            <input type="range" id="square3-width" min="40" max="800" value="100" oninput="updateSquareSize('square3')">
        </div>
        <div class="control-row">
            <label for="square3-height">Height:</label>
            <input type="range" id="square3-height" min="40" max="800" value="80" oninput="updateSquareSize('square3')">
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

<script>
    // Initialize with medical-themed labels
    const medicalLabels = {
        circle1: "Peak Pressure",
        circle2: "PEEP",
        circle3: "HE",
        square1: "Minute Ventilation",
        square2: "Waveforms",
        square3: "HAXI"
    };

    document.addEventListener('DOMContentLoaded', () => {
        const shapes = document.querySelectorAll('.shape');
        let activeShape = null;
        let offsetX, offsetY;

        // Initialize labels
        Object.entries(medicalLabels).forEach(([id, label]) => {
            document.getElementById(`${id}-label`).value = label;
            updateLabel(id);
        });

        // Make all shapes draggable
        shapes.forEach(shape => {
            shape.addEventListener('mousedown', startDrag);
        });

        function startDrag(e) {
            if (e.target.classList.contains('shape-label')) return;
            
            activeShape = e.target.closest('.shape');
            if (!activeShape) return;
            
            const rect = activeShape.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            activeShape.style.cursor = 'grabbing';
            document.addEventListener('mousemove', dragShape);
            document.addEventListener('mouseup', stopDrag);
            e.preventDefault();
        }

        function dragShape(e) {
            if (!activeShape) return;
            
            activeShape.style.left = `${e.clientX - offsetX}px`;
            activeShape.style.top = `${e.clientY - offsetY}px`;
        }

        function stopDrag() {
            if (activeShape) {
                activeShape.style.cursor = 'grab';
                activeShape = null;
            }
            document.removeEventListener('mousemove', dragShape);
            document.removeEventListener('mouseup', stopDrag);
        }
    });

    // Label update function
    function updateLabel(shapeId) {
        const input = document.getElementById(`${shapeId}-label`);
        const label = document.querySelector(`#${shapeId} .shape-label`);
        label.textContent = input.value;
        medicalLabels[shapeId] = input.value; // Update our labels object
    }

    // Circle size update function
    function updateCircleSize(shapeId) {
        const size = document.getElementById(`${shapeId}-size`).value;
        const shape = document.getElementById(shapeId);
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
    }

    // Square size update function
    function updateSquareSize(shapeId) {
        const width = document.getElementById(`${shapeId}-width`).value;
        const height = document.getElementById(`${shapeId}-height`).value;
        const shape = document.getElementById(shapeId);
        shape.style.width = `${width}px`;
        shape.style.height = `${height}px`;
    }

    // Save current configuration to localStorage
    function saveConfiguration() {
        const shapes = document.querySelectorAll('.shape');
        const config = {};
        
        shapes.forEach(shape => {
            const id = shape.id;
            config[id] = {
                type: shape.classList.contains('circle') ? 'circle' : 'square',
                label: document.querySelector(`#${id} .shape-label`).textContent,
                top: shape.style.top,
                left: shape.style.left,
                width: shape.style.width,
                height: shape.style.height
            };
        });
        
        localStorage.setItem('shapeConfig', JSON.stringify(config));
        alert('Configuration saved!');
    }

    // Load configuration from localStorage
    function loadConfiguration() {
        const savedConfig = localStorage.getItem('shapeConfig');
        if (!savedConfig) {
            alert('No saved configuration found!');
            return;
        }
        
        const config = JSON.parse(savedConfig);
        
        Object.entries(config).forEach(([id, shapeConfig]) => {
            const shape = document.getElementById(id);
            if (shape) {
                shape.style.top = shapeConfig.top;
                shape.style.left = shapeConfig.left;
                shape.style.width = shapeConfig.width;
                shape.style.height = shapeConfig.height;
                
                // Update label and input field
                document.querySelector(`#${id} .shape-label`).textContent = shapeConfig.label;
                document.getElementById(`${id}-label`).value = shapeConfig.label;
                
                // Update sliders
                if (shapeConfig.type === 'circle') {
                    const size = parseInt(shapeConfig.width);
                    document.getElementById(`${id}-size`).value = size;
                } else {
                    const width = parseInt(shapeConfig.width);
                    const height = parseInt(shapeConfig.height);
                    document.getElementById(`${id}-width`).value = width;
                    document.getElementById(`${id}-height`).value = height;
                }
            }
        });
    }

    // Export configuration as JSON
    function exportConfiguration() {
        const shapes = document.querySelectorAll('.shape');
        const config = {
            backgroundImage: 'image.png',
            shapes: {}
        };
        
        shapes.forEach(shape => {
            const id = shape.id;
            const rect = shape.getBoundingClientRect();
            
            config.shapes[id] = {
                type: shape.classList.contains('circle') ? 'circle' : 'square',
                label: document.querySelector(`#${id} .shape-label`).textContent,
                position: {
                    x: parseInt(shape.style.left),
                    y: parseInt(shape.style.top)
                },
                size: {
                    width: parseInt(shape.style.width),
                    height: parseInt(shape.style.height)
                },
                screenPosition: {
                    x: rect.left,
                    y: rect.top,
                    right: rect.right,
                    bottom: rect.bottom
                },
                color: shape.classList.contains('circle') ? '#FF6B6B' : '#4ECDC4'
            };
        });
        
        const jsonString = JSON.stringify(config, null, 2);
        document.getElementById('configuration-data').value = jsonString;
        
        // For potential ML use, you might want to:
        // 1. Normalize coordinates relative to image size
        // 2. Add additional features like proximity to other shapes
        // 3. Include relationships between shapes
    }
</script>
