class CanvasRegistry {
  constructor() {
    this.canvases = new Map();
  }
  getCanvas(canvasId) {
    return this.canvases.get(canvasId);
  }
  addCanvas(canvasId, canvas) {
    this.canvases.set(canvasId, canvas);
  }
  removeCanvas(canvasId) {
    this.canvases.delete(canvasId);
  }
}
const canvasRegistry = new CanvasRegistry();
export default canvasRegistry;