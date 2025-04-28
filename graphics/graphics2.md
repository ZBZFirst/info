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

<script>
    // Track all shapes and their controls
    let shapes = [];
    let selectedShape = null;
    let nextId = 1;
    let currentImageIndex = 1;
    const totalImages = 10;

    document.addEventListener('DOMContentLoaded', () => {
        // Initialize with some default shapes if needed
        addShape('circle', {label: "Peak Pressure", top: "100px", left: "50px", width: "40px", height: "40px"});
        addShape('circle', {label: "PEEP", top: "100px", left: "200px", width: "40px", height: "40px"});
        addShape('circle', {label: "HE", top: "100px", left: "350px", width: "40px", height: "40px"});
        addShape('square', {label: "Minute Ventilation", top: "250px", left: "50px", width: "50px", height: "30px"});
        addShape('square', {label: "Waveforms", top: "250px", left: "200px", width: "50px", height: "30px"});
        addShape('square', {label: "HAXI", top: "250px", left: "350px", width: "50px", height: "30px"});
    });

    // Change the background image
    function changeImage(direction) {
        currentImageIndex += direction;
        
        // Wrap around if we go past the limits
        if (currentImageIndex < 1) currentImageIndex = totalImages;
        if (currentImageIndex > totalImages) currentImageIndex = 1;
        
        const container = document.getElementById('shapeContainer');
        container.style.backgroundImage = `url('ventscreen${currentImageIndex}.jpg')`;
        
        document.getElementById('currentImageDisplay').textContent = `Current: ventscreen${currentImageIndex}.jpg`;
    }

    // Add a new shape (circle or square)
    function addShape(type, config = {}) {
        const id = `shape-${nextId++}`;
        const container = document.getElementById('shapeContainer');
        
        // Default configuration
        const defaults = {
            label: `New ${type}`,
            top: '100px',
            left: '100px',
            width: type === 'circle' ? '50px' : '50px',
            height: type === 'circle' ? '30px' : '30px'
        };
        
        const shapeConfig = {...defaults, ...config};
        
        // Create the shape element
        const shape = document.createElement('div');
        shape.id = id;
        shape.className = `shape ${type}`;
        shape.style.top = shapeConfig.top;
        shape.style.left = shapeConfig.left;
        shape.style.width = shapeConfig.width;
        shape.style.height = shapeConfig.height;
        
        // Add label
        const label = document.createElement('div');
        label.className = 'shape-label';
        label.textContent = shapeConfig.label;
        shape.appendChild(label);
        
        // Add to container
        container.appendChild(shape);
        
        // Make draggable
        shape.addEventListener('mousedown', startDrag);
        shape.addEventListener('click', (e) => {
            e.stopPropagation();
            selectShape(id);
        });
        
        // Add to shapes array
        shapes.push({
            id,
            type,
            element: shape,
            labelElement: label
        });
        
        // Create controls for this shape
        createShapeControls(id, type, shapeConfig.label);
        
        // Select this new shape
        selectShape(id);
    }
    
    // Create controls for a shape
    function createShapeControls(id, type, label) {
        const controlsContainer = type === 'circle' ? 
            document.getElementById('circleControlsContainer') : 
            document.getElementById('squareControlsContainer');
        
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        controlGroup.id = `${id}-controls`;
        
        // Label control
        const labelRow = document.createElement('div');
        labelRow.className = 'control-row';
        
        const labelLabel = document.createElement('label');
        labelLabel.htmlFor = `${id}-label`;
        labelLabel.textContent = `${type} ${id.split('-')[1]}:`;
        
        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.id = `${id}-label`;
        labelInput.value = label;
        
        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'Update';
        updateBtn.onclick = () => updateLabel(id);
        
        labelRow.appendChild(labelLabel);
        labelRow.appendChild(labelInput);
        labelRow.appendChild(updateBtn);
        
        // Size controls
        const sizeRow = document.createElement('div');
        sizeRow.className = 'control-row';
        
        if (type === 'circle') {
            const sizeLabel = document.createElement('label');
            sizeLabel.htmlFor = `${id}-size`;
            sizeLabel.textContent = 'Size:';
            
            const sizeInput = document.createElement('input');
            sizeInput.type = 'range';
            sizeInput.id = `${id}-size`;
            sizeInput.min = '20';
            sizeInput.max = '400';
            sizeInput.value = '50';
            sizeInput.oninput = () => updateCircleSize(id);
            
            sizeRow.appendChild(sizeLabel);
            sizeRow.appendChild(sizeInput);
        } else {
            const widthLabel = document.createElement('label');
            widthLabel.htmlFor = `${id}-width`;
            widthLabel.textContent = 'Width:';
            
            const widthInput = document.createElement('input');
            widthInput.type = 'range';
            widthInput.id = `${id}-width`;
            widthInput.min = '20';
            widthInput.max = '600';
            widthInput.value = '50';
            widthInput.oninput = () => updateSquareSize(id);
            
            const heightLabel = document.createElement('label');
            heightLabel.htmlFor = `${id}-height`;
            heightLabel.textContent = 'Height:';
            
            const heightInput = document.createElement('input');
            heightInput.type = 'range';
            heightInput.id = `${id}-height`;
            heightInput.min = '20';
            heightInput.max = '300';
            heightInput.value = '30';
            heightInput.oninput = () => updateSquareSize(id);
            
            sizeRow.appendChild(widthLabel);
            sizeRow.appendChild(widthInput);
            sizeRow.appendChild(heightLabel);
            sizeRow.appendChild(heightInput);
        }
        
        controlGroup.appendChild(labelRow);
        controlGroup.appendChild(sizeRow);
        controlsContainer.appendChild(controlGroup);
    }
    
    // Select a shape
    function selectShape(id) {
        // Deselect all shapes first
        shapes.forEach(shape => {
            shape.element.style.borderColor = shape.type === 'circle' ? '#FF6B6B' : '#4ECDC4';
        });
        
        // Select the new shape
        const shape = shapes.find(s => s.id === id);
        if (shape) {
            shape.element.style.borderColor = '#FFD700'; // Gold color for selection
            selectedShape = shape;
        }
    }
    
    // Delete the selected shape
    function deleteSelectedShape() {
        if (!selectedShape) {
            alert('Please select a shape to delete');
            return;
        }
        
        if (confirm('Are you sure you want to delete this shape?')) {
            // Remove from DOM
            selectedShape.element.remove();
            
            // Remove controls
            const controls = document.getElementById(`${selectedShape.id}-controls`);
            if (controls) controls.remove();
            
            // Remove from shapes array
            shapes = shapes.filter(s => s.id !== selectedShape.id);
            
            selectedShape = null;
        }
    }

    // Drag and drop functionality
    function startDrag(e) {
        if (e.target.classList.contains('shape-label')) return;
        
        const shape = e.target.closest('.shape');
        if (!shape) return;
        
        const rect = shape.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        shape.style.cursor = 'grabbing';
        selectShape(shape.id);
        
        function dragShape(e) {
            shape.style.left = `${e.clientX - offsetX}px`;
            shape.style.top = `${e.clientY - offsetY}px`;
        }
        
        function stopDrag() {
            shape.style.cursor = 'grab';
            document.removeEventListener('mousemove', dragShape);
            document.removeEventListener('mouseup', stopDrag);
        }
        
        document.addEventListener('mousemove', dragShape);
        document.addEventListener('mouseup', stopDrag);
        e.preventDefault();
    }

    // Label update function
    function updateLabel(shapeId) {
        const input = document.getElementById(`${shapeId}-label`);
        const shape = shapes.find(s => s.id === shapeId);
        if (shape) {
            shape.labelElement.textContent = input.value;
        }
    }

    // Circle size update function
    function updateCircleSize(shapeId) {
        const size = document.getElementById(`${shapeId}-size`).value;
        const shape = shapes.find(s => s.id === shapeId);
        if (shape) {
            shape.element.style.width = `${size}px`;
            shape.element.style.height = `${size}px`;
        }
    }

    // Square size update function
    function updateSquareSize(shapeId) {
        const width = document.getElementById(`${shapeId}-width`).value;
        const height = document.getElementById(`${shapeId}-height`).value;
        const shape = shapes.find(s => s.id === shapeId);
        if (shape) {
            shape.element.style.width = `${width}px`;
            shape.element.style.height = `${height}px`;
        }
    }

    // Save current configuration to localStorage
    function saveConfiguration() {
        const config = {
            shapes: shapes.map(shape => ({
                id: shape.id,
                type: shape.type,
                label: shape.labelElement.textContent,
                top: shape.element.style.top,
                left: shape.element.style.left,
                width: shape.element.style.width,
                height: shape.element.style.height
            })),
            nextId: nextId,
            currentImageIndex: currentImageIndex
        };
        
        localStorage.setItem('ventilatorLabelerConfig', JSON.stringify(config));
        alert('Configuration saved!');
    }

    // Load configuration from localStorage
    function loadConfiguration() {
        const savedConfig = localStorage.getItem('ventilatorLabelerConfig');
        if (!savedConfig) {
            alert('No saved configuration found!');
            return;
        }
        
        const config = JSON.parse(savedConfig);
        
        // Clear existing shapes
        shapes.forEach(shape => {
            shape.element.remove();
            const controls = document.getElementById(`${shape.id}-controls`);
            if (controls) controls.remove();
        });
        shapes = [];
        
        // Clear controls containers
        document.getElementById('circleControlsContainer').innerHTML = '';
        document.getElementById('squareControlsContainer').innerHTML = '';
        
        // Recreate shapes from config
        config.shapes.forEach(shapeConfig => {
            addShape(shapeConfig.type, {
                label: shapeConfig.label,
                top: shapeConfig.top,
                left: shapeConfig.left,
                width: shapeConfig.width,
                height: shapeConfig.height
            });
        });
        
        // Restore nextId to prevent ID collisions
        nextId = config.nextId || shapes.length + 1;
        
        // Restore the image index if it exists
        if (config.currentImageIndex) {
            currentImageIndex = config.currentImageIndex;
            const container = document.getElementById('shapeContainer');
            container.style.backgroundImage = `url('ventscreen${currentImageIndex}.jpg')`;
            document.getElementById('currentImageDisplay').textContent = `Current: ventscreen${currentImageIndex}.jpg`;
        }
    }

    // Export configuration as JSON
    function exportConfiguration() {
        const container = document.getElementById('shapeContainer');
        const containerRect = container.getBoundingClientRect();
        const imageWidth = containerRect.width;
        const imageHeight = containerRect.height;
        
        const config = {
            image: `ventscreen${currentImageIndex}.jpg`,
            imageDimensions: {
                width: imageWidth,
                height: imageHeight
            },
            labels: shapes.map(shape => {
                const rect = shape.element.getBoundingClientRect();
                const normalizedX = (rect.left - containerRect.left) / imageWidth;
                const normalizedY = (rect.top - containerRect.top) / imageHeight;
                const normalizedWidth = rect.width / imageWidth;
                const normalizedHeight = rect.height / imageHeight;
                
                return {
                    id: shape.id,
                    type: shape.type,
                    label: shape.labelElement.textContent,
                    position: {
                        x: parseInt(shape.element.style.left),
                        y: parseInt(shape.element.style.top)
                    },
                    normalizedPosition: {
                        x: normalizedX,
                        y: normalizedY
                    },
                    size: {
                        width: parseInt(shape.element.style.width),
                        height: parseInt(shape.element.style.height)
                    },
                    normalizedSize: {
                        width: normalizedWidth,
                        height: normalizedHeight
                    },
                    screenPosition: {
                        left: rect.left,
                        top: rect.top,
                        right: rect.right,
                        bottom: rect.bottom
                    }
                };
            })
        };
        
        const jsonString = JSON.stringify(config, null, 2);
        document.getElementById('configuration-data').value = jsonString;
    }
</script>
