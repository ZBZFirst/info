console.log('[UI] Module loading...');

export function init(visualizer) {
    console.log('[UI] Initializing UI with visualizer:', visualizer);
    
    // Elements
    const startBtn = document.getElementById('startBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const sensitivitySlider = document.getElementById('sensitivity');
    const dynamicRangeSlider = document.getElementById('dynamicRange');
    const noiseFloorSlider = document.getElementById('noiseFloor');
    const visualOptions = document.querySelectorAll('.visual-option');
    const deviceList = document.getElementById('deviceList');

    if (!startBtn || !fullscreenBtn || !sensitivitySlider || !deviceList) {
        console.error('[UI] Could not find all required elements!');
        return null;
    }

    console.log('[UI] All UI elements found');

    // Event Listeners
    startBtn.addEventListener('click', async () => {
        console.log('[UI] Start button clicked');
        if (visualizer.isRunning) {
            console.log('[UI] Stopping visualization');
            visualizer.stopVisualization();
            startBtn.textContent = 'Start Visualizer';
        } else {
            console.log('[UI] Starting visualization');
            try {
                await visualizer.startVisualization();
                startBtn.textContent = 'Stop Visualizer';
            } catch (error) {
                console.error('[UI] Visualization start failed:', error);
                startBtn.textContent = 'Error - Try Again';
            }
        }
    });

    fullscreenBtn.addEventListener('click', () => {
        console.log('[UI] Fullscreen button clicked');
        visualizer.toggleFullscreen();
    });

    // Sliders
    sensitivitySlider.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        document.getElementById('sensitivityValue').textContent = e.target.value;
        console.log('[UI] Sensitivity changed to:', value);
        visualizer.updateSettings({ baseSensitivity: value });
    });

    dynamicRangeSlider.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        document.getElementById('dynamicRangeValue').textContent = e.target.value;
        console.log('[UI] Dynamic range changed to:', value);
        visualizer.updateSettings({ dynamicRange: value });
    });

    noiseFloorSlider.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        document.getElementById('noiseFloorValue').textContent = e.target.value;
        console.log('[UI] Noise floor changed to:', value);
        visualizer.updateSettings({ noiseFloor: value });
    });

    // Visual Modes
    visualOptions.forEach(option => {
        option.addEventListener('click', () => {
            const mode = option.dataset.mode;
            console.log('[UI] Visual mode changed to:', mode);
            visualOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            visualizer.updateSettings({ visualMode: mode });
        });
    });

    // Device List
    async function populateDeviceList() {
        console.log('[UI] Populating audio devices list');
        try {
            const devices = await visualizer.getAudioDevices();
            const audioDevices = devices.filter(device => device.kind === 'audioinput');
            
            console.log('[UI] Found audio devices:', audioDevices);
            
            deviceList.innerHTML = '';
            audioDevices.forEach(device => {
                const option = document.createElement('div');
                option.textContent = device.label || `Device ${device.deviceId}`;
                option.dataset.deviceId = device.deviceId;
                deviceList.appendChild(option);
            });
            
            deviceList.classList.remove('hidden');
        } catch (error) {
            console.error('[UI] Error getting audio devices:', error);
            deviceList.innerHTML = '<div class="error">Could not access audio devices</div>';
        }
    }

    // Initialize
    populateDeviceList();

    return {
        showError(message) {
            console.error('[UI] Showing error:', message);
            // Create a better error display in your UI
            const errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.textContent = message;
            document.body.appendChild(errorEl);
            setTimeout(() => errorEl.remove(), 3000);
        }
    };
}
