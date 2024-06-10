// for async render completion tracking
export class RenderLoader {
  private userLoadPromises: Array<Promise<any>> = [];
  useLoad(p: Promise<any>) {
    this.userLoadPromises.push(p);
  }
  async waitForLoad() {
    await Promise.all(this.userLoadPromises);
  }
  clear() {
    this.userLoadPromises.length = 0;
  }
}
