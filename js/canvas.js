console.log('[Canvas] Module loading...');

const canvasApi = {
  canvas: null,
  visualizer: null,

  init(visualizer) {
    console.log('[Canvas] Initializing with visualizer:', visualizer);
    this.visualizer = visualizer;
    this.canvas = document.getElementById('visualizer');
    
    if (!this.canvas) {
      console.error('[Canvas] Could not find canvas element!');
      return null;
    }

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());

    return this;
  },

  resizeCanvas() {
    console.log('[Canvas] Resizing canvas');
    const width = Math.min(800, window.innerWidth - 40);
    this.canvas.width = width;
    this.canvas.height = width * 0.5;
  },

  handleFullscreenChange() {
    const isFullscreen = !!document.fullscreenElement;
    console.log(`[Canvas] Fullscreen change: ${isFullscreen}`);
    
    if (isFullscreen) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    } else {
      this.resizeCanvas();
    }
  },

  toggleFullscreen() {
    console.log('[Canvas] Toggling fullscreen');
    if (!document.fullscreenElement) {
      this.canvas.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  }
};

export default canvasApi;
