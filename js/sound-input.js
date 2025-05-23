let audioContext;
let analyser;
let audioSource;

async function getAudioDevices() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return navigator.mediaDevices.enumerateDevices();
  } catch (error) {
    throw error;
  }
}

async function setupAudio(deviceId) {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      noiseSuppression: true
    }
  });
  
  audioSource = audioContext.createMediaStreamSource(stream);
  audioSource.connect(analyser);
  
  return analyser;
}

export async function start(deviceId, visualizer) {
  try {
    const analyser = await setupAudio(deviceId);
    visualizer.fftCalc.setAnalyser(analyser);
    visualizer.isRunning = true;
  } catch (error) {
    visualizer.ui.showError('Could not access audio device');
  }
}

export function stop(visualizer) {
  if (audioSource) {
    audioSource.disconnect();
    audioSource.mediaStream.getTracks().forEach(track => track.stop());
  }
  if (audioContext) {
    audioContext.close();
  }
  visualizer.isRunning = false;
}

export async function getAudioDevices() {
  return getAudioDevices();
}
