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
const fullscreenBtn = document.getElementById('fullscreenBtn');
const visualOptions = document.querySelectorAll('.visual-option');

// Audio processing settings
let settings = {
    baseSensitivity: 0.5,
    dynamicRange: 0.7,
    noiseFloor: 0.2,
    history: [],
    maxHistory: 10,
    currentMax: 0,
    decayRate: 0.95,
    visualMode: 'bars',
    isFullscreen: false
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

function toggleFullscreen() {
    if (settings.isFullscreen) {
        document.exitFullscreen();
    } else {
        canvas.requestFullscreen().catch(err => {
            alert(`Error entering fullscreen: ${err.message}`);
        });
    }
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

// Enhanced visualize() function
function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    
    function draw() {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);
        
        const dynamicData = applyDynamicProcessing(freqData);
        
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        switch(settings.visualMode) {
            case 'bars':
                drawBars(dynamicData, bufferLength);
                break;
            case 'wave':
                drawWaveform(timeData, bufferLength);
                break;
            case 'circle':
                drawCircle(dynamicData, bufferLength);
                break;
            case 'particles':
                drawParticles(dynamicData, bufferLength);
                break;
        }
    }
    
    draw();
}

// Visualization mode functions
function drawBars(dataArray, bufferLength) {
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, `hsl(${200 + (i/bufferLength)*160}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${200 + (i/bufferLength)*160}, 100%, 20%)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
    }
}

function drawWaveform(dataArray, bufferLength) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsl(${settings.colorHue}, 100%, 50%)`;
    ctx.beginPath();
    
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2 * settings.sensitivity;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function drawCircle(dataArray, bufferLength) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.4;
    
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < bufferLength; i++) {
        const angle = (i * Math.PI * 2) / bufferLength;
        const scaledValue = dataArray[i] * settings.sensitivity * 0.5;
        const pointRadius = radius + scaledValue;
        
        const x = centerX + Math.cos(angle) * pointRadius;
        const y = centerY + Math.sin(angle) * pointRadius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.strokeStyle = `hsl(${settings.colorHue}, 100%, 50%)`;
    ctx.stroke();
}

function drawParticles(dataArray, bufferLength) {
    const particleCount = bufferLength / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (i * Math.PI * 2) / particleCount;
        const value = dataArray[i] * settings.sensitivity * 0.5;
        const radius = Math.min(maxRadius * 0.2 + value, maxRadius);
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const size = 2 + (value / 255) * 8;
        
        ctx.fillStyle = `hsl(${(settings.colorHue + i) % 360}, 100%, 50%)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}
