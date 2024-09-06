export class AbortableMessageEvent<T> extends MessageEvent<T> {
  abortController = new AbortController();
  constructor(type: string, init: {data: T}) {
    super(type, init);
  }
  abort() {
    this.abortController.abort();
  }
}