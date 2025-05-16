let shapes = [];
let selectedShape = null;
let nextId = 1;
let currentImageIndex = 1;
const totalImages = 10;
let imageConfigurations = {};

document.addEventListener('DOMContentLoaded', () => {
    fetch('/info/js/ventLabels.csv')
        .then(response => response.text())
        .then(csvData => {
            parseCSVConfigurations(csvData);
            loadImage(currentImageIndex);
        })
        .catch(error => {
            console.error('Error loading CSV file:', error);
            loadImage(currentImageIndex, true);
        });
    document.addEventListener('keydown', handleKeyPress);
});

function handleKeyPress(e) {
    if (!selectedShape) return;
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        copySelectedShape();
    }
    if (e.ctrlKey && e.key === 'v' && copiedShape) {
        e.preventDefault();
        pasteCopiedShape();
    }
    if (e.key === 'Delete') {
        e.preventDefault();
        deleteSelectedShape();
    }
}
let copiedShape = null;
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

function loadImage(index, useDefaults = false) {
    currentImageIndex = index;
    const imageName = `ventscreen${currentImageIndex}.jpg`;
    const imagePath = `/info/graphics/${imageName}`; // Updated path
    const container = document.getElementById('shapeContainer');
    container.style.backgroundImage = `url('${imagePath}')`;
    document.getElementById('currentImageDisplay').textContent = `Current: ${imageName}`;
    clearAllShapes();

    if (!useDefaults && imageConfigurations[imageName]) {
        const config = imageConfigurations[imageName];
        const containerRect = container.getBoundingClientRect();

        config.labels.forEach(label => {
            // Use normalized coordinates if available, otherwise use pixels
            const left = label.normalized ? 
                label.normalized.x * containerRect.width : 
                label.position.x;
            const top = label.normalized ? 
                label.normalized.y * containerRect.height : 
                label.position.y;
            const width = label.normalized ? 
                label.normalized.width * containerRect.width : 
                label.size.width;
            const height = label.normalized ? 
                label.normalized.height * containerRect.height : 
                label.size.height;

            addShape(label.type, {
                label: label.label,
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`
            });
        });
    } else {
        createDefaultShapes();
    }
}


function pasteCopiedShape() {
    if (!copiedShape) return;
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

function changeImage(direction) {
    let newIndex = currentImageIndex + direction;
    if (newIndex < 1) newIndex = totalImages;
    if (newIndex > totalImages) newIndex = 1;
    loadImage(newIndex);
}

function addShape(type, config = {}) {
    const id = `shape-${nextId++}`;
    const container = document.getElementById('shapeContainer');
    const defaults = {
        label: `New ${type}`,
        top: '100px',
        left: '100px',
        width: type === 'circle' ? '50px' : '50px',
        height: type === 'circle' ? '30px' : '30px'
    };
    const shapeConfig = {...defaults, ...config};
    const shape = document.createElement('div');
    shape.id = id;
    shape.className = `shape ${type}`;
    shape.style.top = shapeConfig.top;
    shape.style.left = shapeConfig.left;
    shape.style.width = shapeConfig.width;
    shape.style.height = shapeConfig.height;
    const label = document.createElement('div');
    label.className = 'shape-label';
    label.textContent = shapeConfig.label;
    shape.appendChild(label);
    if (type === 'square') {
        addResizeHandles(shape);
    }
    container.appendChild(shape);
    shape.addEventListener('mousedown', startDrag);
    shape.addEventListener('click', (e) => {
        e.stopPropagation();
        selectShape(id);
    });
    shapes.push({
        id,
        type,
        element: shape,
        labelElement: label
    });
    createShapeControls(id, type, shapeConfig.label);
    selectShape(id);
}

function addResizeHandles(shape) {
    const resizeHandleSize = 10;
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
    resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        startResize(e, shape);
    });
    shape.appendChild(resizeHandle);
}

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

function createShapeControls(id, type, label) {
    const controlsContainer = type === 'circle' ? 
        document.getElementById('circleControlsContainer') : 
        document.getElementById('squareControlsContainer');
    const controlGroup = document.createElement('div');
    controlGroup.className = 'control-group';
    controlGroup.id = `${id}-controls`;
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

function selectShape(id) {
    shapes.forEach(shape => {
        shape.element.style.borderColor = shape.type === 'circle' ? '#FF6B6B' : '#4ECDC4';
    });
    const shape = shapes.find(s => s.id === id);
    if (shape) {
        shape.element.style.borderColor = '#FFD700'; // Gold color for selection
        selectedShape = shape;
    }
}

function deleteSelectedShape() {
    if (!selectedShape) {
        alert('Please select a shape to delete');
        return;
    }
    if (confirm('Are you sure you want to delete this shape?')) {
        selectedShape.element.remove();
        const controls = document.getElementById(`${selectedShape.id}-controls`);
        if (controls) controls.remove();
        shapes = shapes.filter(s => s.id !== selectedShape.id);
        selectedShape = null;
    }
}

function startDrag(e) {
    if (e.target.classList.contains('shape-label') || e.target.classList.contains('resize-handle')) return;
    const shape = e.target.closest('.shape');
    if (!shape) return;
    const style = window.getComputedStyle(shape);
    const left = parseInt(style.left) || 0;
    const top = parseInt(style.top) || 0;
    const offsetX = e.clientX - left;
    const offsetY = e.clientY - top;
    shape.style.cursor = 'grabbing';
    selectShape(shape.id);
    function dragShape(e) {
        const newLeft = e.clientX - offsetX;
        const newTop = e.clientY - offsetY;
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

function updateLabel(shapeId) {
    const input = document.getElementById(`${shapeId}-label`);
    const shape = shapes.find(s => s.id === shapeId);
    if (shape) {
        shape.labelElement.textContent = input.value;
    }
}

function updateCircleSize(shapeId) {
    const size = document.getElementById(`${shapeId}-size`).value;
    const shape = shapes.find(s => s.id === shapeId);
    if (shape) {
        shape.element.style.width = `${size}px`;
        shape.element.style.height = `${size}px`;
    }
}

function updateSquareSize(shapeId) {
    const width = document.getElementById(`${shapeId}-width`).value;
    const height = document.getElementById(`${shapeId}-height`).value;
    const shape = shapes.find(s => s.id === shapeId);
    if (shape) {
        shape.element.style.width = `${width}px`;
        shape.element.style.height = `${height}px`;
    }
}

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

function loadConfiguration() {
    const savedConfig = localStorage.getItem('ventilatorLabelerConfig');
    if (!savedConfig) {
        alert('No saved configuration found!');
        return;
    }
    const config = JSON.parse(savedConfig);
    shapes.forEach(shape => {
        shape.element.remove();
        const controls = document.getElementById(`${shape.id}-controls`);
        if (controls) controls.remove();
    });
    shapes = [];
    document.getElementById('circleControlsContainer').innerHTML = '';
    document.getElementById('squareControlsContainer').innerHTML = '';
    config.shapes.forEach(shapeConfig => {
        addShape(shapeConfig.type, {
            label: shapeConfig.label,
            top: shapeConfig.top,
            left: shapeConfig.left,
            width: shapeConfig.width,
            height: shapeConfig.height
        });
    });
    nextId = config.nextId || shapes.length + 1;
    if (config.currentImageIndex) {
        currentImageIndex = config.currentImageIndex;
        const container = document.getElementById('shapeContainer');
        container.style.backgroundImage = `url('/info/graphics/ventscreen${currentImageIndex}.jpg')`;
        document.getElementById('currentImageDisplay').textContent = `Current: ventscreen${currentImageIndex}.jpg`;
    }
}

function parseCSVConfigurations(csvData) {
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        console.log('CSV file has less than 2 lines (header + data)');
        return;
    }

    // Log the raw lines for debugging
    console.log('Raw CSV lines:');
    lines.forEach((line, i) => console.log(`${i}: ${line}`));

    // Extract headers (image names)
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('Headers:', headers);

    // Process each data line (skip header)
    for (let lineNum = 1; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        console.log(`\nProcessing line ${lineNum}: ${line}`);

        // Initialize variables for parsing
        const columns = [];
        let currentColumn = '';
        let inQuotes = false;
        let quoteStart = -1;

        // Parse the line character by character
        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes) {
                    // Check if this is an escaped quote
                    if (i + 1 < line.length && line[i + 1] === '"') {
                        currentColumn += '"';
                        i++; // Skip next quote
                    } else {
                        inQuotes = false;
                    }
                } else {
                    inQuotes = true;
                    quoteStart = i;
                }
            } else if (char === ',' && !inQuotes) {
                columns.push(currentColumn.trim());
                currentColumn = '';
            } else {
                currentColumn += char;
            }
        }
        // Add the last column
        columns.push(currentColumn.trim());

        console.log('Parsed columns:', columns);

        // Match columns with headers
        for (let i = 0; i < Math.min(headers.length, columns.length); i++) {
            const header = headers[i];
            const columnValue = columns[i];
            // console.log(`Column ${i} (${header}):`, columnValue);

            // Try to parse JSON if the column looks like JSON
            if (columnValue.startsWith('{') || columnValue.startsWith('[')) {
                try {
                    let jsonString = columnValue;
                    // Remove surrounding quotes if present
                    if ((jsonString.startsWith('"') && jsonString.endsWith('"'))) {
                        jsonString = jsonString.slice(1, -1);
                    }
                    // Replace escaped quotes
                    jsonString = jsonString.replace(/""/g, '"');
                    
                    console.log('Attempting to parse JSON:', jsonString);
                    const parsedConfig = JSON.parse(jsonString);
                    imageConfigurations[header] = parsedConfig;
                    console.log(`Successfully parsed configuration for ${header}`);
                } catch (e) {
                    console.error(`Error parsing JSON for ${header}:`, e);
                }
            }
        }
    }

    console.log('Final image configurations:', imageConfigurations);
}

function loadCurrentImageConfiguration() {
    const imageName = `ventscreen${currentImageIndex}.jpg`;
    const config = imageConfigurations[imageName];
    if (!config) {
        console.log(`No configuration found for ${imageName}`);
        return;
    }
    clearAllShapes();

    config.labels.forEach(label => {
        addShape(label.type, {
            label: label.label,
            top: `${label.position.y}px`,
            left: `${label.position.x}px`,
            width: `${label.size.width}px`,
            height: `${label.size.height}px`
        });
    });

    updateNextId();
}


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


function exportConfiguration() {
    const container = document.getElementById('shapeContainer');
    const containerRect = container.getBoundingClientRect();
    const config = {
        image: `ventscreen${currentImageIndex}.jpg`,
        // Keep original pixel-based data for backward compatibility
        labels: shapes.map(shape => {
            const rect = shape.element.getBoundingClientRect();
            return {
                id: shape.id,
                type: shape.type,
                label: shape.labelElement.textContent,
                // Original pixel values (preserve existing data)
                position: { 
                    x: parseInt(shape.element.style.left), 
                    y: parseInt(shape.element.style.top) 
                },
                size: { 
                    width: parseInt(shape.element.style.width), 
                    height: parseInt(shape.element.style.height) 
                },
                // NEW: Normalized coordinates (0-1 scale)
                normalized: {
                    x: (rect.left - containerRect.left) / containerRect.width,
                    y: (rect.top - containerRect.top) / containerRect.height,
                    width: rect.width / containerRect.width,
                    height: rect.height / containerRect.height
                }
            };
        })
    };
    document.getElementById('configuration-data').value = JSON.stringify(config, null, 2);
}
