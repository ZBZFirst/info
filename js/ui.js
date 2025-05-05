export function init(visualizer) {
  // Private functions
  function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', () => {
      if (visualizer.isRunning) {
        visualizer.stopVisualization();
      } else {
        showDeviceSelection();
      }
    });
    
    // ... other event listeners
  }

  function showDeviceSelection() {
    // ... device selection logic
  }

  function updateUI() {
    // ... update UI elements based on visualizer state
  }

  // Public API
  return {
    init() {
      setupEventListeners();
      updateUI();
    },
    
    showError(message) {
      // ... display error to user
    }
  };
}
