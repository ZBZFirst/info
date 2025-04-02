---
layout: default
title: Interactive Draggable Graphics
---

<style>
    .shape-container {
        margin: 0;
        overflow: hidden;
        height: 70vh; /* Reduced to make room for form */
        position: relative;
        background: url('image.png') no-repeat center center;
        background-size: contain;
        background-color: #f0f0f0;
        cursor: grab;
    }

    .shape {
        position: absolute;
        cursor: grab;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        font-weight: bold;
        user-select: none;
    }

    .shape-label {
        background-color: white;
        color: black;
        padding: 2px 6px;
        border-radius: 3px;
        pointer-events: none;
        z-index: 10;
    }

    /* Circle style */
    .circle {
        width: 80px;
        height: 80px;
        border: 4px solid #FF6B6B;
        border-radius: 50%;
        background-color: transparent;
    }

    /* Square style */
    .square {
        width: 80px;
        height: 80px;
        border: 4px solid #4ECDC4;
        background-color: transparent;
    }

    /* Form styling */
    .label-controls {
        padding: 20px;
        background: white;
        border-top: 1px solid #ddd;
    }
    
    .shape-control {
        margin: 10px 0;
    }
    
    button {
        padding: 8px 15px;
        background: #4ECDC4;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
</style>

<div class="shape-container">
    <!-- Circles -->
    <div id="circle1" class="shape circle" style="top: 50px; left: 50px;">
        <div class="shape-label">Circle 1</div>
    </div>
    <div id="circle2" class="shape circle" style="top: 50px; left: 150px;">
        <div class="shape-label">Circle 2</div>
    </div>
    <div id="circle3" class="shape circle" style="top: 50px; left: 250px;">
        <div class="shape-label">Circle 3</div>
    </div>
    
    <!-- Squares -->
    <div id="square1" class="shape square" style="top: 150px; left: 50px;">
        <div class="shape-label">Square 1</div>
    </div>
    <div id="square2" class="shape square" style="top: 150px; left: 150px;">
        <div class="shape-label">Square 2</div>
    </div>
    <div id="square3" class="shape square" style="top: 150px; left: 250px;">
        <div class="shape-label">Square 3</div>
    </div>
</div>

<div class="label-controls">
    <h3>Shape Label Editor</h3>
    
    <!-- Circle Labels -->
    <div class="shape-control">
        <label for="circle1-label">Circle 1 Label:</label>
        <input type="text" id="circle1-label" value="Circle 1">
        <button onclick="updateLabel('circle1')">Update</button>
    </div>
    <div class="shape-control">
        <label for="circle2-label">Circle 2 Label:</label>
        <input type="text" id="circle2-label" value="Circle 2">
        <button onclick="updateLabel('circle2')">Update</button>
    </div>
    <div class="shape-control">
        <label for="circle3-label">Circle 3 Label:</label>
        <input type="text" id="circle3-label" value="Circle 3">
        <button onclick="updateLabel('circle3')">Update</button>
    </div>
    
    <!-- Square Labels -->
    <div class="shape-control">
        <label for="square1-label">Square 1 Label:</label>
        <input type="text" id="square1-label" value="Square 1">
        <button onclick="updateLabel('square1')">Update</button>
    </div>
    <div class="shape-control">
        <label for="square2-label">Square 2 Label:</label>
        <input type="text" id="square2-label" value="Square 2">
        <button onclick="updateLabel('square2')">Update</button>
    </div>
    <div class="shape-control">
        <label for="square3-label">Square 3 Label:</label>
        <input type="text" id="square3-label" value="Square 3">
        <button onclick="updateLabel('square3')">Update</button>
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
</script>
