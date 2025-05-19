//fft.js file start

import * as SoundInput from './modules/sound-input.js';
import * as FFTDisplay from './modules/fft-display.js';
import * as UI from './modules/ui.js';
import * as Canvas from './modules/canvas.js';

class FFTVisualizer {
  constructor() {
    this.settings = {
      baseSensitivity: 0.5,
      dynamicRange: 0.7,
      noiseFloor: 0.2,
      visualMode: 'bars',
      isFullscreen: false
    };
    
    this.init();
  }
  
  async init() {
    UI.init(this);
    Canvas.init(this);
    SoundInput.init(this);
    FFTDisplay.init(this);
  }
  
  updateSettings(newSettings) {
    this.settings = {...this.settings, ...newSettings};
  }
  
  startVisualization(deviceId) {
    SoundInput.start(deviceId);
    FFTDisplay.start();
  }
  
  stopVisualization() {
    SoundInput.stop();
    FFTDisplay.stop();
  }
  
  toggleFullscreen() {
    Canvas.toggleFullscreen();
  }
}

new FFTVisualizer();

//fft.js file end
