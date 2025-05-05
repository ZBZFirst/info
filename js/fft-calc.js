const settings = {
  history: [],
  maxHistory: 10,
  currentMax: 0,
  decayRate: 0.95
};

let analyser;

export function init(visualizer) {
  // Private functions
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

  function applyDynamicProcessing(dataArray, visualizerSettings) {
    const processed = new Float32Array(dataArray.length);
    let currentMax = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      currentMax = Math.max(currentMax, dataArray[i]);
    }
    
    const rangeAdjustedMax = updateDynamicRange(currentMax);
    const dynamicScale = rangeAdjustedMax > 0 ? (1 / rangeAdjustedMax) : 1;
    
    for (let i = 0; i < dataArray.length; i++) {
      let value = (dataArray[i] / 255) * visualizerSettings.baseSensitivity;
      value *= dynamicScale;
      value = Math.max(0, value - visualizerSettings.noiseFloor);
      processed[i] = Math.min(255, value * 255 * (1 + visualizerSettings.dynamicRange));
    }
    
    return processed;
  }

  // Public API
  return {
    setAnalyser(newAnalyser) {
      analyser = newAnalyser;
    },
    
    getProcessedData() {
      if (!analyser) return null;
      
      const bufferLength = analyser.frequencyBinCount;
      const freqData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);
      
      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(timeData);
      
      return {
        frequencyData: applyDynamicProcessing(freqData, visualizer.settings),
        timeData,
        bufferLength
      };
    }
  };
}
