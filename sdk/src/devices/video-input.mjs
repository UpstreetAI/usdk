import { EventEmitter } from 'events';
import child_process from 'child_process';

export class VideoInput extends EventEmitter {
  constructor(id, {
    framerate = 30,
    fps = 1,
  } = {}) {
    super();

    // ffmpeg -f avfoundation -framerate 30 -i "0" -vf "fps=1" -c:v libwebp -lossless 1 -f image2pipe -
    const cp = child_process.spawn('ffmpeg', [
      '-f', 'avfoundation',
      '-framerate', `${framerate}`,
      '-i', `${id}`,
      '-vf', `fps=${fps}`,
      '-c:v', 'libwebp',
      // '-lossless', '1',
      '-f', 'image2pipe',
      '-',
    ]);
    // cp.stderr.pipe(process.stderr);
    const bs = [];
    let bsLength = 0;
    const tryParseFrame = () => {
      if (bsLength >= 8) {
        const b = Buffer.concat(bs);
        // check for 'RIFF'
        if (
          b[0] === 0x52 && // 'R'
          b[1] === 0x49 && // 'I'
          b[2] === 0x46 && // 'F'
          b[3] === 0x46 // 'F'
        ) {
          let fileSize = new DataView(b.buffer, b.byteOffset + 4, 4).getUint32(0, true); // little-endian
          fileSize += 8; // add header size
          if (bsLength >= fileSize) {
            const frameData = b.slice(0, fileSize);
            this.emit('frame', frameData);

            bs.length = 0;
            bsLength -= fileSize;
            if (bsLength > 0) {
              bs.push(b.slice(fileSize));
            }
          }
        }
      }
    };
    cp.stdout.on('data', data => {
      this.emit('data', data);

      bs.push(data);
      bsLength += data.length;

      tryParseFrame();
    });
    cp.stdout.on('end', () => {
      this.emit('end');
    });
    cp.on('error', err => {
      this.emit('error', err);
    });
  }
};