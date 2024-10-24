type LoadableAudioContext = AudioContext & {
  waitForLoad: () => Promise<void>;
};
type FlushableAudioWorkletNode = AudioWorkletNode & {
  flushed: boolean;
  write: (chunk: any) => void;
  waitForFlush: () => Promise<void>;
};

export const ensureAudioContext = (() => {
  let audioContext: LoadableAudioContext | null = null;
  return () => {
    if (audioContext === null) {
      audioContext = new AudioContext({
        latencyHint: 'interactive',
      }) as LoadableAudioContext;
      const loadPromise = (async () => {
        await Promise.all([
          audioContext.audioWorklet.addModule(`/audio-worker/ws-input-worklet.js`),
          audioContext.audioWorklet.addModule(`/audio-worker/ws-output-worklet.js`),
        ]);
      })();
      audioContext.waitForLoad = () => loadPromise;
    }
    return audioContext;
  };
})();

const ensureAudioWorklet = async (
  audioContext: LoadableAudioContext,
  {
    signal,
  }: {
    signal: AbortSignal;
  },
) => {
  await audioContext.waitForLoad();
  
  const audioWorkletNode = new AudioWorkletNode(
    audioContext,
    'ws-output-worklet'
  ) as FlushableAudioWorkletNode;

  audioWorkletNode.flushed = true;
  audioWorkletNode.write = (chunk: any) => {
    audioWorkletNode.flushed = false;
    audioWorkletNode.port.postMessage(chunk);
  };
  audioWorkletNode.waitForFlush = async () => {
    if (!audioWorkletNode.flushed) {
      await new Promise((accept, reject) => {
        audioWorkletNode.addEventListener('flush', accept, { once: true });
      });
    }
  };
  audioWorkletNode.port.addEventListener('message', (e) => {
    const {
      method,
      // args,
    } = e.data;
    switch (method) {
      case 'flush': {
        audioWorkletNode.flushed = true;
        audioWorkletNode.dispatchEvent(new MessageEvent('flush', {
          data: null,
        }));
        break;
      }
      case 'volume': {
        // nothing
        break;
      }
      default: {
        console.warn('unhandled audio worklet node message method', e.data);
      }
    }
  });

  if (!signal.aborted) {
    audioWorkletNode.connect(audioContext.destination);
    signal.addEventListener('abort', () => {
      audioWorkletNode.disconnect();
    });
  }

  return audioWorkletNode;
}

export class AudioContextOutputStream extends WritableStream {
  audioContext: LoadableAudioContext;
  sampleRate: number;
  constructor() {
    const abortController = new AbortController();
    const {
      signal,
    } = abortController;
    // const queueManager = new QueueManager();

    super({
      write: async (chunk) => {
        const audioWorkletNode = await audioWorkletNodePromise;
        audioWorkletNode.write(chunk);
      },
      close: async () => {
        const audioWorkletNode = await audioWorkletNodePromise;
        await audioWorkletNode.waitForFlush();
        abortController.abort(new Error('close() called'));
      },
      abort(reason) {
        abortController.abort(reason);
      }
    });

    // create the output
    this.audioContext = ensureAudioContext();
    this.sampleRate = this.audioContext.sampleRate;
    // this.audioContext.resume();

    const audioWorkletNodePromise = ensureAudioWorklet(this.audioContext, {
      signal,
    });
  }
}