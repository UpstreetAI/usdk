import child_process from 'child_process';
import {
  AudioInput,
} from './audio-input.mjs';
import {
  VideoInput,
} from './video-input.mjs';

/*
ffmpeg -f avfoundation -list_devices true -i "" -hide_banner -loglevel info

ffmpeg -f avfoundation -i ":1" -c:a libopus -f opus pipe:1 >/tmp/lol.opus

ffmpeg -f avfoundation -framerate 30 -i "0" -vf "fps=1" -c:v libwebp -lossless 1 -f image2pipe - >/tmp/lol.webp
ffmpeg -f avfoundation -framerate 30 -i "1" -vf "fps=1" -c:v libwebp -lossless 1 -f image2pipe - >/tmp/lol.webp
ffmpeg -f v4l2 -framerate 30 -i /dev/video0 -vf "fps=1" -c:v libwebp -lossless 1 -f image2pipe - >/tmp/lol.webp
*/

export class InputDevices {
  async listDevices() {
    // capture command:
    // ffmpeg -f avfoundation -list_devices true -i "" -hide_banner -loglevel info
    const result = await new Promise((accept, reject) => {
      child_process.execFile('ffmpeg', [
        '-f', 'avfoundation', // for macos
        '-list_devices', 'true',
        '-i', '""',
        '-hide_banner',
        '-loglevel', 'info'
      ], (err, stdout, stderr) => {
        const match1 = stderr.match(/video devices[^\n]*\n((?:(?!\n[^\n]*?devices[^\n]*?\n)[\s\S])+)/i);
        const match2 = stderr.match(/audio devices[^\n]*\n((?:(?!\n[^\n]*?error[^\n]*?\n)[\s\S])+)/i);
        if (match1 && match2) {
          // console.log('got match', match1, match2);

          const parseDevice = (device) => {
            const match = device.match(/\[([0-9]+)\] ([^\n]*)/);
            if (match) {
              const id = match[1];
              const label = match[2];
              return {
                id,
                label,
              };
            } else {
              return null;
            }
          }

          const video = match1[1].split('\n').map(parseDevice).filter(d => d !== null);
          const audio = match2[1].split('\n').map(parseDevice).filter(d => d !== null);
          accept({
            video,
            audio
          });
        } else {
          reject(new Error('could not parse: ' + stderr))
        }
      });
    });
    return result;
  }
  getDefaultCameraDevice(videoDevices) {
    return videoDevices.find(d => /camera/i.test(d.label)) || videoDevices[0];
  }
  getDefaultScreenDevice(videoDevices) {
    return videoDevices.find(d => /screen/i.test(d.label)) || videoDevices[0];
  }
  getDefaultMicrophoneDevice(audioDevices) {
    return audioDevices.find(d => /mic/i.test(d.label)) || audioDevices[0];
  }
  getAudioInput(id, opts) {
    return new AudioInput(id, opts);
  }
  getVideoInput(id, opts) {
    return new VideoInput(id, opts);
  }
}