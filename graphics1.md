---
layout: default
title: Interactive Draggable Graphics
---

<style>
    .shape-container {
        margin: 0;
        overflow: hidden;
        height: 60vh; /* Reduced to make room for controls */
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
</style>

<div class="shape-container">
    <!-- Circles -->
    <div id="circle1" class="shape circle" style="top: 100px; left: 50px; width: 80px; height: 80px;">
        <div class="shape-label">Circle 1</div>
    </div>
    <div id="circle2" class="shape circle" style="top: 100px; left: 200px; width: 80px; height: 80px;">
        <div class="shape-label">Circle 2</div>
    </div>
    <div id="circle3" class="shape circle" style="top: 100px; left: 350px; width: 80px; height: 80px;">
        <div class="shape-label">Circle 3</div>
    </div>
    
    <!-- Squares -->
    <div id="square1" class="shape square" style="top: 250px; left: 50px; width: 100px; height: 80px;">
        <div class="shape-label">Square 1</div>
    </div>
    <div id="square2" class="shape square" style="top: 250px; left: 200px; width: 100px; height: 80px;">
        <div class="shape-label">Square 2</div>
    </div>
    <div id="square3" class="shape square" style="top: 250px; left: 350px; width: 100px; height: 80px;">
        <div class="shape-label">Square 3</div>
    </div>
</div>

<div class="controls-panel">
    <!-- Circle Controls -->
    <div class="shape-control-group">
        <h3>Circle Controls</h3>
        
        <div class="control-row">
            <label for="circle1-label">Circle 1:</label>
            <input type="text" id="circle1-label" value="Circle 1">
            <button onclick="updateLabel('circle1')">Update</button>
        </div>
        <div class="control-row">
            <label for="circle1-size">Size:</label>
            <input type="range" id="circle1-size" min="40" max="150" value="80" oninput="updateCircleSize('circle1')">
        </div>
        
        <div class="control-row">
            <label for="circle2-label">Circle 2:</label>
            <input type="text" id="circle2-label" value="Circle 2">
            <button onclick="updateLabel('circle2')">Update</button>
        </div>
        <div class="control-row">
            <label for="circle2-size">Size:</label>
            <input type="range" id="circle2-size" min="40" max="150" value="80" oninput="updateCircleSize('circle2')">
        </div>
        
        <div class="control-row">
            <label for="circle3-label">Circle 3:</label>
            <input type="text" id="circle3-label" value="Circle 3">
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
            <label for="square1-label">Square 1:</label>
            <input type="text" id="square1-label" value="Square 1">
            <button onclick="updateLabel('square1')">Update</button>
        </div>
        <div class="control-row">
            <label for="square1-width">Width:</label>
            <input type="range" id="square1-width" min="40" max="200" value="100" oninput="updateSquareSize('square1')">
        </div>
        <div class="control-row">
            <label for="square1-height">Height:</label>
            <input type="range" id="square1-height" min="40" max="200" value="80" oninput="updateSquareSize('square1')">
        </div>
        
        <div class="control-row">
            <label for="square2-label">Square 2:</label>
            <input type="text" id="square2-label" value="Square 2">
            <button onclick="updateLabel('square2')">Update</button>
        </div>
        <div class="control-row">
            <label for="square2-width">Width:</label>
            <input type="range" id="square2-width" min="40" max="200" value="100" oninput="updateSquareSize('square2')">
        </div>
        <div class="control-row">
            <label for="square2-height">Height:</label>
            <input type="range" id="square2-height" min="40" max="200" value="80" oninput="updateSquareSize('square2')">
        </div>
        
        <div class="control-row">
            <label for="square3-label">Square 3:</label>
            <input type="text" id="square3-label" value="Square 3">
            <button onclick="updateLabel('square3')">Update</button>
        </div>
        <div class="control-row">
            <label for="square3-width">Width:</label>
            <input type="range" id="square3-width" min="40" max="200" value="100" oninput="updateSquareSize('square3')">
        </div>
        <div class="control-row">
            <label for="square3-height">Height:</label>
            <input type="range" id="square3-height" min="40" max="200" value="80" oninput="updateSquareSize('square3')">
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const shapes = document.querySelectorAll('.shape');
        let activeShape = null;
        let offsetX, offsetY;

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
</script>
