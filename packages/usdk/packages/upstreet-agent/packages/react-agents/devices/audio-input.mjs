import { EventEmitter } from 'events';
import child_process from 'child_process';

//

export class AudioInput extends EventEmitter {
  static defaultSampleRate = 48000;
  constructor(id, {
    sampleRate = AudioInput.defaultSampleRate,
    numSamples,
  } = {}) {
    super();

    const _reset = () => {
      this.abortController = new AbortController();
      const { signal } = this.abortController;

      this.paused = false;

      // ffmpeg -f avfoundation -i ":1" -ar 48000 -c:a libopus -f opus pipe:1
      const cp = child_process.spawn('ffmpeg', [
        '-f', 'avfoundation',
        '-i', `:${id}`,
        '-ar', `${sampleRate}`,
        // '-c:a', 'libopus',
        // '-f', 'opus',
        '-f', 'f32le',
        '-acodec', 'pcm_f32le',
        'pipe:1',
      ]);
      // cp.stderr.pipe(process.stderr);
      signal.addEventListener('abort', () => {
        cp.kill();
      });

      const _listenForStart = () => {
        let s = '';
        cp.stderr.setEncoding('utf8');
        const ondata = data => {
          s += data;
          if (/time=/.test(s)) {
            this.emit('start');
            cp.stderr.removeListener('data', ondata);
          }
        };
        cp.stderr.on('data', ondata);

        signal.addEventListener('abort', () => {
          cp.stderr.removeListener('data', ondata);
        });
      };
      _listenForStart();

      const bs = [];
      let bsLength = 0;
      const ondata = data => {
        if (typeof numSamples === 'number') {
          bs.push(data);
          bsLength += data.length;

          // console.log('bs length', bsLength, numSamples);

          if (bsLength / Float32Array.BYTES_PER_ELEMENT >= numSamples) {
            const b = Buffer.concat(bs);
            let i = 0;
            while (bsLength / Float32Array.BYTES_PER_ELEMENT >= numSamples) {
              // const data = b.slice(i * Float32Array.BYTES_PER_ELEMENT, (i + numSamples) * Float32Array.BYTES_PER_ELEMENT);
              // const samples = new Float32Array(data.buffer, data.byteOffset, numSamples);
              const samples = new Float32Array(b.buffer, b.byteOffset + i * Float32Array.BYTES_PER_ELEMENT, numSamples);
              this.emit('data', samples);

              i += numSamples;
              bsLength -= numSamples * Float32Array.BYTES_PER_ELEMENT;
            }
            // unshift the remainder
            bs.length = 0;
            if (bsLength > 0) {
              bs.push(b.slice(i * Float32Array.BYTES_PER_ELEMENT));
            }
          }
        } else {
          const samples = new Float32Array(data.buffer, data.byteOffset, data.length / Float32Array.BYTES_PER_ELEMENT);
          this.emit('data', samples);
        }
      };
      cp.stdout.on('data', ondata);
      const onend = () => {
        this.emit('end');
      };
      cp.stdout.on('end', onend);
      const onerror = err => {
        this.emit('error', err);
      };
      cp.on('error', onerror);

      signal.addEventListener('abort', () => {
        cp.stdout.removeListener('data', ondata);
        cp.stdout.removeListener('end', onend);
        cp.removeListener('error', onerror);
      });
    };
    _reset();

    this.on('pause', e => {
      this.abortController.abort();
    });
    this.on('resume', e => {
      _reset();
    });
  }
  close() {
    this.abortController.abort();
    this.emit('close');
  }
  pause() {
    if (!this.paused) {
      this.paused = true;
      this.emit('pause');
    }
  }
  resume() {
    if (this.paused) {
      this.paused = false;
      this.emit('resume');
    }
  }
};