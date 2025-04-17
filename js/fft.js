// Audio elements
let audioContext;
let analyser;
let audioSource;
let animationId;
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// UI Elements
const startBtn = document.getElementById('startBtn');
const deviceList = document.getElementById('deviceList');
const sensitivitySlider = document.getElementById('sensitivity');
const sensitivityValue = document.getElementById('sensitivityValue');
const dynamicRangeSlider = document.getElementById('dynamicRange');
const dynamicRangeValue = document.getElementById('dynamicRangeValue');
const noiseFloorSlider = document.getElementById('noiseFloor');
const noiseFloorValue = document.getElementById('noiseFloorValue');

// Audio processing settings
let settings = {
    baseSensitivity: 0.5,
    dynamicRange: 0.7,
    noiseFloor: 0.2,
    history: [],
    maxHistory: 10,
    currentMax: 0,
    decayRate: 0.95
};

// Initialize UI
setupEventListeners();

function setupEventListeners() {
    startBtn.addEventListener('click', startDeviceSelection);
    
    sensitivitySlider.addEventListener('input', () => {
        settings.baseSensitivity = sensitivitySlider.value / 100;
        sensitivityValue.textContent = sensitivitySlider.value;
    });
    
    dynamicRangeSlider.addEventListener('input', () => {
        settings.dynamicRange = dynamicRangeSlider.value / 100;
        dynamicRangeValue.textContent = dynamicRangeSlider.value;
    });
    
    noiseFloorSlider.addEventListener('input', () => {
        settings.noiseFloor = noiseFloorSlider.value / 100;
        noiseFloorValue.textContent = noiseFloorSlider.value;
    });
}

async function startDeviceSelection() {
    try {
        startBtn.disabled = true;
        
        // Get available audio devices
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        if (audioDevices.length === 0) {
            throw new Error('No audio devices found');
        }
        
        // Show device selection
        deviceList.innerHTML = '';
        audioDevices.forEach(device => {
            const btn = document.createElement('button');
            btn.className = 'device-btn';
            btn.textContent = device.label || `Audio Device ${device.deviceId.slice(0, 5)}`;
            btn.onclick = () => startVisualizer(device.deviceId);
            deviceList.appendChild(btn);
        });
        
        deviceList.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Could not access audio devices. Please ensure permissions are granted.');
        resetUI();
    }
}

async function startVisualizer(deviceId) {
    try {
        deviceList.classList.add('hidden');
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: deviceId ? { exact: deviceId } : undefined,
                noiseSuppression: true,
                echoCancellation: false,
                autoGainControl: false
            }
        });
        
        audioSource = audioContext.createMediaStreamSource(stream);
        audioSource.connect(analyser);
        
        startBtn.textContent = 'Stop Visualizer';
        startBtn.onclick = stopVisualizer;
        visualize();
        
    } catch (error) {
        console.error('Error starting visualizer:', error);
        alert('Could not access the selected audio device');
        resetUI();
    }
}

function stopVisualizer() {
    cancelAnimationFrame(animationId);
    if (audioSource) {
        audioSource.disconnect();
        audioSource.mediaStream.getTracks().forEach(track => track.stop());
        audioSource = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    resetUI();
    clearCanvas();
}

function clearCanvas() {
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function resetUI() {
    startBtn.textContent = 'Start Visualizer';
    startBtn.onclick = startDeviceSelection;
    startBtn.disabled = false;
    deviceList.classList.add('hidden');
}

function updateDynamicRange(currentValue) {
    settings.history.push(currentValue);
    if (settings.history.length > settings.maxHistory) {
        settings.history.shift();
    }
    
    const avg = settings.history.reduce((sum, val) => sum + val, 0) / settings.history.length;
    settings.currentMax = Math.max(
        currentValue, 
        settings.currentMax * settings.decayRate,
        avg * 1.5
    );
    
    return settings.currentMax > 0 ? currentValue / settings.currentMax : 0;
}

function applyDynamicProcessing(dataArray) {
    const processed = new Float32Array(dataArray.length);
    let currentMax = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
        currentMax = Math.max(currentMax, dataArray[i]);
    }
    
    const rangeAdjustedMax = updateDynamicRange(currentMax);
    const dynamicScale = rangeAdjustedMax > 0 ? (1 / rangeAdjustedMax) : 1;
    
    for (let i = 0; i < dataArray.length; i++) {
        let value = (dataArray[i] / 255) * settings.baseSensitivity;
        value *= dynamicScale;
        value = Math.max(0, value - settings.noiseFloor);
        processed[i] = Math.min(255, value * 255 * (1 + settings.dynamicRange));
    }
    
    return processed;
}

function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const processedArray = new Float32Array(bufferLength);
    
    function draw() {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        
        for (let i = 0; i < bufferLength; i++) {
            processedArray[i] = dataArray[i];
        }
        const dynamicData = applyDynamicProcessing(processedArray);
        
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dynamicData[i];
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, `hsl(${200 + (i/bufferLength)*160}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${200 + (i/bufferLength)*160}, 100%, 20%)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    draw();
}
