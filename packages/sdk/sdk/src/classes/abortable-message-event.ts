export class AbortableMessageEvent<T> extends MessageEvent<T> {
  abortController: AbortController;
  constructor(type: string, init: {data: T}) {
    super(type, {
      data: init.data,
    });
    this.abortController = new AbortController();
  }
  abort() {
    this.abortController.abort();
  }
}