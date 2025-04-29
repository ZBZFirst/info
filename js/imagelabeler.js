// Track all shapes and their controls
let shapes = [];
let selectedShape = null;
let nextId = 1;
let currentImageIndex = 1;
const totalImages = 10;
let imageConfigurations = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // First load the CSV configurations
    fetch('ventLabels.csv')
        .then(response => response.text())
        .then(csvData => {
            parseCSVConfigurations(csvData);
            // Now load the first image with its configuration
            loadImage(currentImageIndex);
        })
        .catch(error => {
            console.error('Error loading CSV file:', error);
            // Fallback to default shapes if CSV fails to load
            loadImage(currentImageIndex, true);
        });

    // Add keyboard event listeners
    document.addEventListener('keydown', handleKeyPress);
});

// Handle keyboard shortcuts
function handleKeyPress(e) {
    if (!selectedShape) return;
    
    // Copy selected shape (Ctrl+C)
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        copySelectedShape();
    }
    
    // Paste copied shape (Ctrl+V)
    if (e.ctrlKey && e.key === 'v' && copiedShape) {
        e.preventDefault();
        pasteCopiedShape();
    }
    
    // Delete selected shape (Delete key)
    if (e.key === 'Delete') {
        e.preventDefault();
        deleteSelectedShape();
    }
}

let copiedShape = null;

// Copy the selected shape
function copySelectedShape() {
    if (!selectedShape) return;
    
    const shape = selectedShape.element;
    copiedShape = {
        type: selectedShape.type,
        label: selectedShape.labelElement.textContent,
        top: shape.style.top,
        left: shape.style.left,
        width: shape.style.width,
        height: shape.style.height
    };
}

// Main function to load an image and its configuration
function loadImage(index, useDefaults = false) {
    currentImageIndex = index;
    const imageName = `ventscreen${currentImageIndex}.jpg`;
    const container = document.getElementById('shapeContainer');
    
    // Set the background image
    container.style.backgroundImage = `url('${imageName}')`;
    document.getElementById('currentImageDisplay').textContent = `Current: ${imageName}`;
    
    // Clear existing shapes
    clearAllShapes();
    
    // Load the configuration for this image if available
    if (!useDefaults && imageConfigurations[imageName]) {
        const config = imageConfigurations[imageName];
        config.labels.forEach(label => {
            addShape(label.type, {
                label: label.label,
                top: `${label.position.y}px`,
                left: `${label.position.x}px`,
                width: `${label.size.width}px`,
                height: `${label.size.height}px`
            });
        });
    } else {
        // Create default shapes if no configuration exists
        createDefaultShapes();
    }
}


// Paste the copied shape
function pasteCopiedShape() {
    if (!copiedShape) return;
    
    // Offset the new shape slightly from the original
    const offset = 20;
    const newLeft = parseInt(copiedShape.left) + offset;
    const newTop = parseInt(copiedShape.top) + offset;
    
    addShape(copiedShape.type, {
        label: copiedShape.label,
        top: `${newTop}px`,
        left: `${newLeft}px`,
        width: copiedShape.width,
        height: copiedShape.height
    });
}

// Change image function
function changeImage(direction) {
    let newIndex = currentImageIndex + direction;
    
    // Wrap around if we go past the limits
    if (newIndex < 1) newIndex = totalImages;
    if (newIndex > totalImages) newIndex = 1;
    
    // Load the new image with its configuration
    loadImage(newIndex);
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
    
    // Add resize handles (only for squares)
    if (type === 'square') {
        addResizeHandles(shape);
    }
    
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

// Add resize handles to a shape
function addResizeHandles(shape) {
    const resizeHandleSize = 10;
    
    // Create resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.style.width = `${resizeHandleSize}px`;
    resizeHandle.style.height = `${resizeHandleSize}px`;
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = `-${resizeHandleSize/2}px`;
    resizeHandle.style.bottom = `-${resizeHandleSize/2}px`;
    resizeHandle.style.backgroundColor = '#FFD700';
    resizeHandle.style.borderRadius = '50%';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.zIndex = '20';
    
    // Prevent drag events from bubbling up to the shape
    resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        startResize(e, shape);
    });
    
    shape.appendChild(resizeHandle);
}

// Start resizing a shape
function startResize(e, shape) {
    e.preventDefault();
    
    const startWidth = parseInt(shape.style.width);
    const startHeight = parseInt(shape.style.height);
    const startX = e.clientX;
    const startY = e.clientY;
    
    function doResize(e) {
        const width = startWidth + (e.clientX - startX);
        const height = startHeight + (e.clientY - startY);
        
        shape.style.width = `${Math.max(20, width)}px`;
        shape.style.height = `${Math.max(20, height)}px`;
        
        // Update controls if this shape is selected
        if (selectedShape && selectedShape.element === shape) {
            updateSizeControls(shape.id, shape.style.width, shape.style.height);
        }
    }
    
    function stopResize() {
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
    }
    
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
}

// Update the size controls in the control panel
function updateSizeControls(shapeId, width, height) {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;
    
    if (shape.type === 'circle') {
        const sizeInput = document.getElementById(`${shapeId}-size`);
        if (sizeInput) sizeInput.value = parseInt(width);
    } else {
        const widthInput = document.getElementById(`${shapeId}-width`);
        const heightInput = document.getElementById(`${shapeId}-height`);
        if (widthInput) widthInput.value = parseInt(width);
        if (heightInput) heightInput.value = parseInt(height);
    }
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
        widthInput.max = '900';
        widthInput.value = '50';
        widthInput.oninput = () => updateSquareSize(id);
        
        const heightLabel = document.createElement('label');
        heightLabel.htmlFor = `${id}-height`;
        heightLabel.textContent = 'Height:';
        
        const heightInput = document.createElement('input');
        heightInput.type = 'range';
        heightInput.id = `${id}-height`;
        heightInput.min = '20';
        heightInput.max = '600';
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

// Drag and drop functionality - Fixed version
function startDrag(e) {
    if (e.target.classList.contains('shape-label') || e.target.classList.contains('resize-handle')) return;
    
    const shape = e.target.closest('.shape');
    if (!shape) return;
    
    // Get current computed position
    const style = window.getComputedStyle(shape);
    const left = parseInt(style.left) || 0;
    const top = parseInt(style.top) || 0;
    
    const offsetX = e.clientX - left;
    const offsetY = e.clientY - top;
    
    shape.style.cursor = 'grabbing';
    selectShape(shape.id);
    
    function dragShape(e) {
        // Calculate new position
        const newLeft = e.clientX - offsetX;
        const newTop = e.clientY - offsetY;
        
        // Apply new position with 'px' units
        shape.style.left = `${newLeft}px`;
        shape.style.top = `${newTop}px`;
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

// Parse CSV data and store configurations
function parseCSVConfigurations(csvData) {
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return;
    
    const headers = lines[0].split(',');
    const jsonData = lines[1].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    
    headers.forEach((header, i) => {
        try {
            const cleanHeader = header.trim();
            if (!cleanHeader) return;
            
            let jsonString = jsonData[i]?.trim() || '';
            jsonString = jsonString.replace(/^"(.*)"$/, '$1');
            
            if (jsonString) {
                imageConfigurations[cleanHeader] = JSON.parse(jsonString);
            }
        } catch (e) {
            console.error(`Error parsing configuration for ${header}:`, e);
        }
    });
}

// Load configuration for current image
function loadCurrentImageConfiguration() {
    const imageName = `ventscreen${currentImageIndex}.jpg`;
    const config = imageConfigurations[imageName];
    if (!config) {
        console.log(`No configuration found for ${imageName}`);
        return;
    }

    // Clear existing shapes
    clearAllShapes();

    // Create shapes from the configuration
    config.labels.forEach(label => {
        addShape(label.type, {
            label: label.label,
            top: `${label.position.y}px`,
            left: `${label.position.x}px`,
            width: `${label.size.width}px`,
            height: `${label.size.height}px`
        });
    });

    // Set nextId to avoid ID collisions
    updateNextId();
}

// Create default shapes
function createDefaultShapes() {
    addShape('circle', {label: "Peak Inspiratory Pressure", top: "100px", left: "50px", width: "40px", height: "40px"});
    addShape('circle', {label: "PEEP", top: "100px", left: "200px", width: "40px", height: "40px"});
    addShape('circle', {label: "Minute Ventilation", top: "100px", left: "350px", width: "40px", height: "40px"});
    addShape('square', {label: "Waveform1", top: "250px", left: "50px", width: "50px", height: "30px"});
    addShape('square', {label: "Waveform2", top: "250px", left: "200px", width: "50px", height: "30px"});
    addShape('square', {label: "Input Data", top: "250px", left: "350px", width: "50px", height: "30px"});
    addShape('square', {label: "Output Data", top: "250px", left: "350px", width: "50px", height: "30px"});
}

function clearAllShapes() {
    shapes.forEach(shape => {
        shape.element.remove();
        const controls = document.getElementById(`${shape.id}-controls`);
        if (controls) controls.remove();
    });
    shapes = [];
    
    document.getElementById('circleControlsContainer').innerHTML = '';
    document.getElementById('squareControlsContainer').innerHTML = '';
}

function updateNextId() {
    nextId = shapes.length > 0 ? 
        Math.max(...shapes.map(s => parseInt(s.id.split('-')[1]))) + 1 : 
        1;
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
