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
    const toggleDevicesBtn = document.createElement('button'); // New device toggle button

    if (!startBtn || !fullscreenBtn || !sensitivitySlider || !deviceList) {
        console.error('[UI] Could not find all required elements!');
        return null;
    }

    console.log('[UI] All UI elements found');

    // Add toggle button for devices
    toggleDevicesBtn.textContent = 'Show Audio Devices';
    toggleDevicesBtn.className = 'secondary';
    deviceList.parentNode.insertBefore(toggleDevicesBtn, deviceList.nextSibling);

    // Event Listeners
    startBtn.addEventListener('click', async () => {
        console.log('[UI] Start button clicked');
        if (visualizer.isRunning) {
            console.log('[UI] Stopping visualization');
            visualizer.stop();
            startBtn.textContent = 'Start Visualizer';
        } else {
            console.log('[UI] Starting visualization');
            try {
                await visualizer.start();
                startBtn.textContent = 'Stop Visualizer';
            } catch (error) {
                console.error('[UI] Visualization start failed:', error);
                startBtn.textContent = 'Error - Try Again';
                showError('Could not access microphone. Please check permissions.');
            }
        }
    });

    fullscreenBtn.addEventListener('click', () => {
        console.log('[UI] Fullscreen button clicked');
        visualizer.toggleFullscreen();
        fullscreenBtn.textContent = visualizer.settings.isFullscreen 
            ? 'Exit Fullscreen' 
            : 'Enter Fullscreen';
    });

    // Sliders
    const updateSlider = (slider, valueElement, settingKey) => {
        slider.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            valueElement.textContent = e.target.value;
            console.log(`[UI] ${settingKey} changed to:`, value);
            visualizer.settings[settingKey] = value;
        });
    };

    updateSlider(sensitivitySlider, document.getElementById('sensitivityValue'), 'baseSensitivity');
    updateSlider(dynamicRangeSlider, document.getElementById('dynamicRangeValue'), 'dynamicRange');
    updateSlider(noiseFloorSlider, document.getElementById('noiseFloorValue'), 'noiseFloor');

    // Visual Modes
    visualOptions.forEach(option => {
        option.addEventListener('click', () => {
            const mode = option.dataset.mode;
            console.log('[UI] Visual mode changed to:', mode);
            visualOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            visualizer.settings.visualMode = mode;
        });
    });

    // Device List Management
    toggleDevicesBtn.addEventListener('click', () => {
        deviceList.classList.toggle('hidden');
        toggleDevicesBtn.textContent = deviceList.classList.contains('hidden') 
            ? 'Show Audio Devices' 
            : 'Hide Audio Devices';
    });

    async function populateDeviceList() {
        console.log('[UI] Populating audio devices list');
        try {
            const devices = await visualizer.getAudioDevices();
            const audioDevices = devices.filter(device => device.kind === 'audioinput');
            
            console.log('[UI] Found audio devices:', audioDevices);
            
            deviceList.innerHTML = '';
            
            if (audioDevices.length === 0) {
                deviceList.innerHTML = '<div class="device-item">No audio devices found</div>';
                return;
            }
            
            audioDevices.forEach(device => {
                const deviceItem = document.createElement('div');
                deviceItem.className = 'device-item';
                deviceItem.textContent = device.label || `Device ${device.deviceId.slice(0, 8)}`;
                deviceItem.dataset.deviceId = device.deviceId;
                
                deviceItem.addEventListener('click', async () => {
                    console.log('[UI] Selected device:', device.label);
                    deviceList.querySelectorAll('.device-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    deviceItem.classList.add('active');
                    
                    if (visualizer.isRunning) {
                        await visualizer.stop();
                    }
                    
                    try {
                        await visualizer.start(device.deviceId);
                        startBtn.textContent = 'Stop Visualizer';
                        deviceList.classList.add('hidden');
                        toggleDevicesBtn.textContent = 'Show Audio Devices';
                    } catch (error) {
                        console.error('[UI] Device switch failed:', error);
                        showError('Could not switch to selected device');
                    }
                });
                
                deviceList.appendChild(deviceItem);
            });
            
        } catch (error) {
            console.error('[UI] Error getting audio devices:', error);
            deviceList.innerHTML = '<div class="device-item error">Could not access audio devices</div>';
        }
    }

    // Initialize device list
    populateDeviceList();

    // Error display function
    function showError(message) {
        console.error('[UI] Showing error:', message);
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        document.body.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 3000);
    }

    return {
        showError,
        refreshDevices: populateDeviceList
    };
}
