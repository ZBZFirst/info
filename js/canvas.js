export function init(visualizer) {
  const canvas = document.getElementById('visualizer');
  
  function resizeCanvas() {
    const width = Math.min(800, window.innerWidth - 40);
    canvas.width = width;
    canvas.height = width * 0.5;
  }

  function handleFullscreenChange() {
    visualizer.settings.isFullscreen = !!document.fullscreenElement;
    if (visualizer.settings.isFullscreen) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      resizeCanvas();
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('fullscreenchange', handleFullscreenChange);

  return canvas;
}

export function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
