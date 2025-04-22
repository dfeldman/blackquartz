// Simple window manager for handling z-index stacking
let zIndexCounter = 1000; // Starting z-index for windows

const windowManager = {
  // Get a new z-index that will be on top of all windows
  getNewZIndex() {
    return ++zIndexCounter;
  },
  
  // Reset the counter (useful for testing)
  resetCounter() {
    zIndexCounter = 1000;
  }
};

export default windowManager;
