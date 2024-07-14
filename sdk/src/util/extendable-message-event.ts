export class ExtendableMessageEvent<T> extends MessageEvent<T> {
  private promises: Array<Promise<any>> = [];
  constructor(type: string, opts: object = {}) {
    super(type, opts);
  }
  waitUntil(promise: Promise<any>) {
    this.promises.push(promise);
  }
  async waitForFinish() {
    await Promise.all(this.promises);
  }
}