import { EventEmitter } from 'events';
import child_process from 'child_process';

export class AudioInput extends EventEmitter {
  constructor(id) {
    super();

    // ffmpeg -f avfoundation -i ":1" -c:a libopus -f opus pipe:1
    const cp = child_process.spawn('ffmpeg', [
      '-f', 'avfoundation',
      '-i', `:${id}`,
      '-c:a', 'libopus',
      '-f', 'opus',
      'pipe:1',
    ]);
    // cp.stderr.pipe(process.stderr);
    cp.stdout.on('data', data => {
      this.emit('data', data);
    });
    cp.stdout.on('end', () => {
      this.emit('end');
    });
    cp.on('error', err => {
      this.emit('error', err);
    });
  }
};