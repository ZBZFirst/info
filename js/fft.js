// In your fft.js file, update the imports and initialization:

import { start as startSoundInput, stop as stopSoundInput, getAudioDevices } from './sound-input.js';
import { init as initFFTDisplay } from './fft-display.js';
import { init as initUI } from './ui.js';
import { init as initCanvas, toggleFullscreen } from './canvas.js';

console.log("[FFT] Initializing FFTVisualizer...");

class FFTVisualizer {
  constructor() {
    console.log("[FFT] Constructor called");
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
        if (!this.fftCalc.analyser) {
          console.warn("[FFT] No analyser available");
          return null;
        }
        
        const bufferLength = this.fftCalc.analyser.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);
        const timeData = new Uint8Array(bufferLength);
        
        this.fftCalc.analyser.getByteFrequencyData(frequencyData);
        this.fftCalc.analyser.getByteTimeDomainData(timeData);
        
        console.log(`[FFT] Got data - bufferLength: ${bufferLength}`);
        return {
          frequencyData,
          timeData,
          bufferLength
        };
      },
      setAnalyser: (analyser) => {
        console.log("[FFT] Setting analyser");
        this.fftCalc.analyser = analyser;
      }
    };
    
    this.init();
  }
  
  async init() {
    console.log("[FFT] Starting initialization...");
    try {
      // Change Canvas.init to initCanvas
      this.canvas = initCanvas(this);
      console.log("[FFT] Canvas initialized");
      
      // Change UI.init to initUI
      initUI(this);
      console.log("[FFT] UI initialized");
      
      // Change SoundInput.init to startSoundInput
      await startSoundInput(null, this); // Passing null for default device
      console.log("[FFT] SoundInput initialized");
      
      // Change FFTDisplay.init to initFFTDisplay
      initFFTDisplay(this);
      console.log("[FFT] FFTDisplay initialized");
    } catch (error) {
      console.error("[FFT] Initialization error:", error);
    }
  }
  
  async getAudioDevices() {
      return await getAudioDevices();
  }}

document.addEventListener('DOMContentLoaded', () => {
  console.log("[FFT] DOM fully loaded");
  new FFTVisualizer();
});
