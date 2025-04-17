// Audio elements
let audioContext;
let analyser;
let audioSource;
let animationId;
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// DOM Elements
const elements = {
    startBtn: document.getElementById('startBtn'),
    deviceList: document.getElementById('deviceList'),
    sensitivitySlider: document.getElementById('sensitivity'),
    sensitivityValue: document.getElementById('sensitivityValue'),
    dynamicRangeSlider: document.getElementById('dynamicRange'),
    dynamicRangeValue: document.getElementById('dynamicRangeValue'),
    noiseFloorSlider: document.getElementById('noiseFloor'),
    noiseFloorValue: document.getElementById('noiseFloorValue'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    visualOptions: document.querySelectorAll('.visual-option')
};

// Application state
const state = {
    audio: {
        context: null,
        analyser: null,
        source: null
    },
    settings: {
        baseSensitivity: 0.5,
        dynamicRange: 0.7,
        noiseFloor: 0.2,
        visualMode: 'bars',
        colorHue: 200,
        history: [],
        maxHistory: 10,
        currentMax: 0,
        decayRate: 0.95
    },
    ui: {
        isFullscreen: false,
        isVisualizing: false
    }
};

// Initialization
function init() {
    setupEventListeners();
    resizeCanvas();
}

// Event Listeners
function setupEventListeners() {
    // Button events
    elements.startBtn.addEventListener('click', handleStartButton);
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Slider events
    elements.sensitivitySlider.addEventListener('input', () => updateSlider('sensitivity'));
    elements.dynamicRangeSlider.addEventListener('input', () => updateSlider('dynamicRange'));
    elements.noiseFloorSlider.addEventListener('input', () => updateSlider('noiseFloor'));

    // Visualization mode selection
    elements.visualOptions.forEach(option => {
        option.addEventListener('click', () => {
            setVisualizationMode(option.dataset.mode);
            elements.visualOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    // Window events
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
}

// Core Functions
async function handleStartButton() {
    if (state.ui.isVisualizing) {
        stopVisualizer();
    } else {
        await startDeviceSelection();
    }
}

async function startDeviceSelection() {
    try {
        elements.startBtn.disabled = true;
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        if (audioDevices.length === 0) throw new Error('No audio devices found');
        
        renderDeviceList(audioDevices);
        elements.deviceList.classList.remove('hidden');
        
    } catch (error) {
        console.error('Device access error:', error);
        showError('Could not access audio devices. Please ensure permissions are granted.');
        resetUI();
    }
}

function renderDeviceList(devices) {
    elements.deviceList.innerHTML = '';
    devices.forEach(device => {
        const btn = document.createElement('button');
        btn.className = 'device-btn';
        btn.textContent = device.label || `Audio Device ${device.deviceId.slice(0, 5)}`;
        btn.onclick = () => startVisualizer(device.deviceId);
        elements.deviceList.appendChild(btn);
    });
}

async function startVisualizer(deviceId) {
    try {
        elements.deviceList.classList.add('hidden');
        
        // Initialize audio context
        state.audio.context = new (window.AudioContext || window.webkitAudioContext)();
        state.audio.analyser = state.audio.context.createAnalyser();
        state.audio.analyser.fftSize = 2048;
        state.audio.analyser.smoothingTimeConstant = 0.8;
        
        // Get audio stream
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: deviceId ? { exact: deviceId } : undefined,
                noiseSuppression: true,
                echoCancellation: false,
                autoGainControl: false
            }
        });
        
        // Connect audio nodes
        state.audio.source = state.audio.context.createMediaStreamSource(stream);
        state.audio.source.connect(state.audio.analyser);
        
        // Update UI
        elements.startBtn.textContent = 'Stop Visualizer';
        state.ui.isVisualizing = true;
        
        // Start visualization
        visualize();
        
    } catch (error) {
        console.error('Visualizer error:', error);
        showError('Could not access the selected audio device');
        resetUI();
    }
}

function stopVisualizer() {
    cancelAnimationFrame(animationId);
    
    // Clean up audio resources
    if (state.audio.source) {
        state.audio.source.disconnect();
        state.audio.source.mediaStream.getTracks().forEach(track => track.stop());
        state.audio.source = null;
    }
    
    if (state.audio.context) {
        state.audio.context.close().catch(console.error);
        state.audio.context = null;
    }
    
    // Reset state
    state.ui.isVisualizing = false;
    resetUI();
    clearCanvas();
}

// Visualization Functions
function visualize() {
    const bufferLength = state.audio.analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    
    function draw() {
        animationId = requestAnimationFrame(draw);
        
        // Get fresh audio data
        state.audio.analyser.getByteFrequencyData(freqData);
        state.audio.analyser.getByteTimeDomainData(timeData);
        
        // Process and visualize
        clearCanvas();
        
        switch(state.settings.visualMode) {
            case 'bars':
                drawBars(processAudioData(freqData), bufferLength);
                break;
            case 'wave':
                drawWaveform(timeData, bufferLength);
                break;
            case 'circle':
                drawCircle(processAudioData(freqData), bufferLength);
                break;
            case 'particles':
                drawParticles(processAudioData(freqData), bufferLength);
                break;
        }
    }
    
    draw();
}

function processAudioData(dataArray) {
    const processed = new Float32Array(dataArray.length);
    let currentMax = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
        const logValue = Math.log1p(dataArray[i]) * 10;
        currentMax = Math.max(currentMax, logValue);
        processed[i] = logValue;
    }
    
    const rangeAdjustedMax = updateDynamicRange(currentMax);
    const dynamicScale = rangeAdjustedMax > 0 ? (1 / rangeAdjustedMax) : 1;
    
    for (let i = 0; i < dataArray.length; i++) {
        let value = processed[i];
        value *= dynamicScale * (1 + state.settings.baseSensitivity * 2);
        value = Math.max(0, value - (state.settings.noiseFloor * 0.5));
        processed[i] = Math.min(255, value * 255 * (1 + state.settings.dynamicRange * 2));
    }
    return processed;
}

function updateDynamicRange(currentValue) {
    const weight = 0.3; // How quickly we adapt to changes
    state.settings.currentMax = state.settings.currentMax > 0 ?
        (weight * currentValue) + ((1 - weight) * state.settings.currentMax) :
        currentValue;
    
    return Math.max(state.settings.currentMax, 20);
}

function drawBars(dataArray, bufferLength) {
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    
    const boost = 1.5 + (state.settings.baseSensitivity * 2);
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.max(2, dataArray[i] * boost);
        const hue = state.settings.colorHue + (i/bufferLength)*160;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, `hsl(${hue}, 100%, 70%)`); // Brighter colors
        gradient.addColorStop(1, `hsl(${hue}, 100%, 30%)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
    }
}

function drawWaveform(dataArray, bufferLength) {
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsl(${state.settings.colorHue}, 100%, 50%)`;
    ctx.beginPath();
    
    for (let i = 0; i < bufferLength; i++) {
        const y = (dataArray[i] / 128.0) * canvas.height / 2 * state.settings.baseSensitivity;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        x += sliceWidth;
    }
    
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function drawCircle(dataArray, bufferLength) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.3;
    
    // Boost factor for circular visualization
    const boost = 2 + (state.settings.baseSensitivity * 3);
    
    ctx.lineWidth = 3; // Thicker lines for better visibility
    ctx.beginPath();
    
    for (let i = 0; i < bufferLength; i++) {
        const angle = (i * Math.PI * 2) / bufferLength;
        const pointRadius = baseRadius + (dataArray[i] * boost * 0.3);
        
        const x = centerX + Math.cos(angle) * pointRadius;
        const y = centerY + Math.sin(angle) * pointRadius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.strokeStyle = `hsl(${state.settings.colorHue}, 100%, 60%)`; // Brighter stroke
    ctx.stroke();
}

function drawParticles(dataArray, bufferLength) {
    const particleCount = bufferLength / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (i * Math.PI * 2) / particleCount;
        const radius = Math.min(maxRadius * 0.2 + (dataArray[i] * state.settings.baseSensitivity * 0.5), maxRadius);
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const size = 2 + (dataArray[i] / 255) * 8;
        
        ctx.fillStyle = `hsl(${(state.settings.colorHue + i) % 360}, 100%, 50%)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// UI Functions
function updateSlider(setting) {
    state.settings[setting] = elements[`${setting}Slider`].value / 100;
    elements[`${setting}Value`].textContent = elements[`${setting}Slider`].value;
}

function setVisualizationMode(mode) {
    state.settings.visualMode = mode;
}

function toggleFullscreen() {
    if (state.ui.isFullscreen) {
        document.exitFullscreen();
    } else {
        canvas.requestFullscreen().catch(err => {
            console.error('Fullscreen error:', err);
            showError(`Fullscreen error: ${err.message}`);
        });
    }
}

function handleFullscreenChange() {
    state.ui.isFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement;
    
    elements.fullscreenBtn.textContent = state.ui.isFullscreen ? 
        'Exit Fullscreen' : 'Enter Fullscreen';
    
    if (state.ui.isFullscreen) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        resizeCanvas();
    }
}

function handleResize() {
    if (!state.ui.isFullscreen) {
        resizeCanvas();
    }
}

function handleKeyDown(e) {
    if (state.ui.isFullscreen && e.key === 'Escape') {
        toggleFullscreen();
    }
}

// Utility Functions
function resizeCanvas() {
    const width = Math.min(800, window.innerWidth - 40);
    canvas.width = width;
    canvas.height = width * 0.5;
}

function clearCanvas() {
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function resetUI() {
    elements.startBtn.textContent = 'Start Visualizer';
    elements.startBtn.disabled = false;
    elements.deviceList.classList.add('hidden');
    state.ui.isVisualizing = false;
}

function showError(message) {
    alert(message);
}

// Initialize the application
init();
