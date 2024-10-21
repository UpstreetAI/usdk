export class AudioOutput extends EventTarget {
  constructor() {
    super();

    this.live = true;
  }
  write(data) {
    this.dispatchEvent(new MessageEvent('data', {
      data,
    }));
  }
  end() {
    this.live = false;
    this.dispatchEvent(new MessageEvent('end'));
  }
  readAll() {
    return new Promise((accept, reject) => {
      const bs = [];
      if (this.live) {
        this.addEventListener('data', e => {
          bs.push(e.data);
        });
        this.addEventListener('end', () => {
          accept(bs);
        });
      } else {
        accept(bs);
      }
    });
  }
}