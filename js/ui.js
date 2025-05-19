//ui.js file start

export function init(visualizer) {
  const startBtn = document.getElementById('startBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const sensitivitySlider = document.getElementById('sensitivity');
  const dynamicRangeSlider = document.getElementById('dynamicRange');
  const noiseFloorSlider = document.getElementById('noiseFloor');
  const visualOptions = document.querySelectorAll('.visual-option');
  
  // Event listeners
  startBtn.addEventListener('click', async () => {
    if (visualizer.isRunning) {
      visualizer.stopVisualization();
      startBtn.textContent = 'Start Visualizer';
    } else {
      await visualizer.startVisualization();
      startBtn.textContent = 'Stop Visualizer';
    }
  });
  
  fullscreenBtn.addEventListener('click', () => {
    visualizer.toggleFullscreen();
  });
  
  // Settings sliders
  sensitivitySlider.addEventListener('input', (e) => {
    const value = e.target.value / 100;
    document.getElementById('sensitivityValue').textContent = e.target.value;
    visualizer.updateSettings({ baseSensitivity: value });
  });
  
  dynamicRangeSlider.addEventListener('input', (e) => {
    const value = e.target.value / 100;
    document.getElementById('dynamicRangeValue').textContent = e.target.value;
    visualizer.updateSettings({ dynamicRange: value });
  });
  
  noiseFloorSlider.addEventListener('input', (e) => {
    const value = e.target.value / 100;
    document.getElementById('noiseFloorValue').textContent = e.target.value;
    visualizer.updateSettings({ noiseFloor: value });
  });
  
  // Visual mode buttons
  visualOptions.forEach(option => {
    option.addEventListener('click', () => {
      visualOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      visualizer.updateSettings({ visualMode: option.dataset.mode });
    });
  });
  
  // Device selection (you can expand this)
  async function populateDeviceList() {
    try {
      const devices = await SoundInput.getAudioDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      // ... populate device list dropdown
    } catch (error) {
      console.error('Error getting audio devices:', error);
    }
  }
  
  // Initialize device list
  populateDeviceList();
  
  return {
    showError(message) {
      alert(message); // Replace with better error display
    }
  };
}

//ui.js file end
