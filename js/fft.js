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
    
    this.isRunning = false;
    this.canvas = null;
    this.fftCalc = {
      analyser: null,
      getProcessedData: () => {
        if (!this.fftCalc.analyser) return null;
        
        const bufferLength = this.fftCalc.analyser.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);
        const timeData = new Uint8Array(bufferLength);
        
        this.fftCalc.analyser.getByteFrequencyData(frequencyData);
        this.fftCalc.analyser.getByteTimeDomainData(timeData);
        
        return {
          frequencyData,
          timeData,
          bufferLength
        };
      },
      setAnalyser: (analyser) => {
        this.fftCalc.analyser = analyser;
      }
    };
    
    this.init();
  }
  
  async init() {
    this.canvas = Canvas.init(this);
    UI.init(this);
    await SoundInput.init(this);
    FFTDisplay.init(this);
  }
  
  updateSettings(newSettings) {
    this.settings = {...this.settings, ...newSettings};
  }
  
  async startVisualization(deviceId) {
    await SoundInput.start(deviceId);
    FFTDisplay.start(this.fftCalc, this);
    this.isRunning = true;
  }
  
  stopVisualization() {
    SoundInput.stop();
    FFTDisplay.stop();
    this.isRunning = false;
  }
  
  toggleFullscreen() {
    Canvas.toggleFullscreen();
  }
}

// Initialize the visualizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FFTVisualizer();
});
