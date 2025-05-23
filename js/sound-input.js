console.log("[SoundInput] Loading sound-input module");

let audioContext;
let analyser;
let audioSource;

export async function getAudioDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
        console.error("[SoundInput] Error getting devices:", error);
        throw error;
    }
}

async function setupAudio(deviceId) {
  console.log("[SoundInput] Setting up audio context");
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  
  console.log("[SoundInput] Requesting microphone access");
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      noiseSuppression: true
    }
  });
  
  console.log("[SoundInput] Creating audio source");
  audioSource = audioContext.createMediaStreamSource(stream);
  audioSource.connect(analyser);
  
  return analyser;
}

export async function start(deviceId, visualizer) {
  console.log(`[SoundInput] Starting with device ${deviceId || 'default'}`);
  try {
    const analyser = await setupAudio(deviceId);
    console.log("[SoundInput] Audio setup complete");
    visualizer.fftCalc.setAnalyser(analyser);
    visualizer.isRunning = true;
  } catch (error) {
    console.error("[SoundInput] Start error:", error);
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

