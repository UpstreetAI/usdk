import {
  makePromise,
  makeId,
} from '../util.js';

export class BeatDetectionWorkletNode extends AudioWorkletNode {
  constructor({
    audioContext,
  }) {
    super(
      audioContext,
      'beat-detection-worklet',
    );

    const loadPromise = makePromise();
    const message = (e) => {
      const { data } = e;
      const { method, args } = data;
      if (method === 'ready') {
        loadPromise.resolve();
      } else if (method === 'update') {
        const {
          sampleTimestamp,
          bpm,
          onsetTimestamps,
          beatTimestamps,
          rootNote,
          quality,
          intervals,
        } = args;

        this.dispatchEvent(new MessageEvent('update', {
          data: {
            sampleTimestamp,
            bpm,
            onsetTimestamps,
            beatTimestamps,
            rootNote,
            quality,
            intervals,
          },
        }));
      } else if (method === 'finishResponse') {
        const { id } = args;
        const cb = cbs.get(id);
        if (!cb) {
          console.warn('missing cb', {
            id,
            cbs,
          });
          throw new Error('no cb: ' + id);
        }
        cbs.delete(id);
        cb(data);
      } else {
        console.warn('unexpected audio worker inject message', {
          method,
          args,
        });
      }
    };
    this.port.onmessage = message;

    this.waitForLoad = () => loadPromise;

    this.waitForFinish = (() => {
      const cbs = new Map();

      return () => {
        const p = makePromise();
        const id = makeId(8);
        cbs.set(id, p.resolve);

        this.port.postMessage({
          method: 'finishRequest',
          args: {
            id,
          },
        });
        return p;
      };
    })();
  }
}