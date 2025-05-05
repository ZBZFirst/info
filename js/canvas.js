export function init(visualizer) {
  const canvas = document.getElementById('visualizer');
  
  // Private functions
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

  // Public API
  return {
    init() {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    },
    
    toggleFullscreen() {
      if (visualizer.settings.isFullscreen) {
        document.exitFullscreen();
      } else {
        canvas.requestFullscreen();
      }
    },
    
    getCanvas() {
      return canvas;
    }
  };
}
