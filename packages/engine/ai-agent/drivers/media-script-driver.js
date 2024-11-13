import {
  whisperTranscribe,
} from '../../../../pages/helpers/WhisperTranscribe.js';
import lamejs from 'lamejstmp';
import audioBufferToWav from 'audiobuffer-to-wav';
import {
  imageCaptioning,
  imageSegmentation,
  imageSegmentationMulti,
} from '../../../../packages/engine/vqa.js';
import {
  loadWorkletModules,
} from '../../../../packages/engine/audio/audio-manager.js';
import {
  BeatDetectionWorkletNode,
} from '../../../../packages/engine/audio/beat-detection-worklet-node.js';
import {
  BasicPitch,
} from '@spotify/basic-pitch';
import {
  addPitchBendsToNoteEvents,
  // NoteEventTime,
  noteFramesToTime,
  outputToNotesPoly,
} from '@spotify/basic-pitch/esm/toMidi.js';
import {
  Note,
  Chord,
  Midi,
} from 'tonal';
import {
  Muxer,
  ArrayBufferTarget,
} from 'webm-muxer';

function convertAudioBufferToAudioData(audioBuffer) {
  const channelDatas = Array(audioBuffer.numberOfChannels);
  for (let j = 0; j < audioBuffer.numberOfChannels; j++) {
    const channelData = audioBuffer.getChannelData(j);
    channelDatas[j] = channelData;
  }

  // combine planes
  const combinedChannelData = new Float32Array(audioBuffer.length * audioBuffer.numberOfChannels);
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let j = 0; j < audioBuffer.numberOfChannels; j++) {
      combinedChannelData[i * audioBuffer.numberOfChannels + j] = channelDatas[j][i];
    }
  }

  const audioData = new AudioData({
    format: 'f32',
    sampleRate: audioBuffer.sampleRate,
    numberOfChannels: audioBuffer.numberOfChannels,
    numberOfFrames: audioBuffer.length,
    timestamp: 0,
    data: combinedChannelData,
  });
  return audioData;
}

//

class VideoTicker extends EventTarget {
  constructor(video, {
    fpsFactor = 1,
  } = {}) {
    super();

    this.video = video;
    this.fpsFactor = fpsFactor;
  }
  async play(cb) {
    const {
      video,
    } = this;

    const frameDelay = 1000 / this.fpsFactor;
    // const maxDuration = 5;
    const maxDuration = Infinity;

    // encode video
    const frame = async (i) => {
      const t = i * frameDelay / 1000;
      if (t < video.duration && t < maxDuration) {
        video.currentTime = t;

        // wait for frame
        await new Promise((accept, reject) => {
          // console.log('frame callback 1', i, t);
          video.requestVideoFrameCallback(() => {
            // console.log('frame callback 2');
            accept();
          });
        });

        await cb({
          video,
          timestamp: t,
        });

        return true;
      } else {
        return false;
      }
    };
    for (let i = 0; ; i++) {
      const result = await frame(i);
      if (!result) {
        // console.log('frame break', i);
        break;
      }
    }
  }
}

//

class LocalStorageCache {
  constructor(prefix = '') {
    this.prefix = prefix;
  }
  get(u) {
    const s = localStorage.getItem(this.prefix + u);
    if (s !== null) {
      const result = JSON.parse(s);
      return result;
    } else {
      return void 0;
    }
  }
  set(u, result) {
    const s = JSON.stringify(result);
    localStorage.setItem(this.prefix + u, s);
  }
  clear() {
    const keysToRemove = [];
    for (let i = 0, len = localStorage.length; i < len; ++i) {
      const k = localStorage.key(i);
      if (k.startsWith(this.prefix)) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      localStorage.removeItem(k);
    }
  }
}
export class CachedScriptCompiler extends EventTarget {
  constructor({
    cacheScripts = false,
  } = {}) {
    super();

    this.cacheScripts = cacheScripts;

    this.cache = new LocalStorageCache(this.constructor.name + ':');
  }
  async getScriptProps(u, cb) {
    let result;
    if (this.cacheScripts) {
      result = this.cache.get(u);
      // console.log('get cache', this.cache, u);
      // if (result !== void 0) {
      //   console.log('got cached script props', u, result);
      // }
    }
    if (result === void 0) {
      result = await cb();
      // console.log('got script props', result);
      if (this.cacheScripts) {
        this.cache.set(u, result);
      }
    }
    return result;
  }
  clear() {
    this.cache.clear();
  }
}

// const u = `/public/unfold.mp4`;
// const u = `/public/anohana.mp4`;
// const u = `/public/ghost.mp4`;
// const u = `/public/blossom.mp4`;
// const u = `/public/everything-goes-on.mp4`;
// const u = `/public/something-comforting.mp4`;
// const u = `/public/highest.mp4`;
// const u = `/public/musician.mp4`;
// const u = `/public/kimi.mp4`;
export class FullScriptCompiler extends CachedScriptCompiler {
  constructor({
    aiFps = 1,
    cacheScripts = false,
  } = {}) {
    super({
      cacheScripts,
    });
  }
  async compile(u) {
    const resPromise = fetch(u);
    u = null;
    const res = await resPromise;
    const arrayBuffer = await res.arrayBuffer();

    const language = 'en';
    // const language = 'ja';

    const audioTranscript = await (async () => {
      // console.log('got audio data', audioData);

      // const wavBuffer = audioBufferToWav(audioData);
      // const wavBlob = new Blob([wavBuffer], {
      //   type: 'audio/wav',
      // });

      // midi
      {
        const audioContext = new AudioContext({
          sampleRate: 22050,
        });
        const audioData = await audioContext.decodeAudioData(arrayBuffer.slice());
        // convert to mono
        const channelDatas = [];
        for (let j = 0; j < audioData.numberOfChannels; j++) {
          channelDatas.push(audioData.getChannelData(j));
        }
        const monoAudioData = audioContext.createBuffer(1, audioData.length, audioData.sampleRate);
        const monoChannelData = monoAudioData.getChannelData(0);
        for (let j = 0; j < audioData.length; j++) {
          let v = 0;
          for (let k = 0; k < channelDatas.length; k++) {
            v += channelDatas[k][j];
          }
          v /= channelDatas.length;
          monoChannelData[j] = v;
        }

        const frames = [];
        const onsets = [];
        const contours = [];
        const basicPitch = new BasicPitch('/weights/basic-pitch/model.json');
        // console.log('pitch 1');
        await basicPitch.evaluateModel(
          monoAudioData,
          (f, o, c) => {
            frames.push(...f);
            onsets.push(...o);
            contours.push(...c);
          },
          (p) => {
            pct = p;
          },
        );
        console.log('pitch 2');

        // outputToNotesPoly(
        //   frames: number[][],
        //   onsets: number[][],
        //   onsetThresh: number = 0.5,
        //   frameThresh: number = 0.15,
        //   minNoteLen: number = 11,
        //   inferOnsets: boolean = true,
        //   maxFreq: Optional<number> = null,
        //   minFreq: Optional<number> = null,
        //   melodiaTrick: boolean = true,
        //   energyTolerance: number = 11,
        // )
        let notes = noteFramesToTime(
          addPitchBendsToNoteEvents(
            contours,
            outputToNotesPoly(
              frames,
              onsets,
              0.5,
              0.3,
              5,
              // true,
              // 0,
              // 3000,
              // true,
            ),
          ),
        );
        notes = notes.sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
        const pitches = notes.map(note => Midi.midiToNoteName(note.pitchMidi));
        const freqs = notes.map(note => Midi.midiToFreq(note.pitchMidi));
        const pitchesString = pitches.join(' ');
        // globalThis.pitchesString = pitchesString;
        console.log('got notes', notes, pitches);
      }

      {
        const audioContext = new AudioContext({
          sampleRate: 48000,
        });
        const audioData = await audioContext.decodeAudioData(arrayBuffer.slice());

        const mp3Data = [];

        const mp3encoder = new lamejs.Mp3Encoder(1, audioData.sampleRate, 128); //mono 44.1khz encode to 128kbps
        const samples = new Int16Array(audioData.length); //one second of silence replace that with your own samples

        // copy over the float32 samples to the int16 array
        // sum channel data
        const channelDatas = [];
        for (let j = 0; j < audioData.numberOfChannels; j++) {
          channelDatas.push(audioData.getChannelData(j));
        }
        for (let i = 0; i < audioData.length; i++) {
          let v = 0;
          for (let j = 0; j < audioData.numberOfChannels; j++) {
            v += channelDatas[j][i];
          }
          samples[i] = (v / audioData.numberOfChannels) * 0.5 * 0x7FFF;
        }
        const mp3Tmp = mp3encoder.encodeBuffer(samples); //encode mp3
        //Push encode buffer to mp3Data variable
        mp3Data.push(mp3Tmp);

        // Get end part of mp3
        const mp3Tmp2 = mp3encoder.flush();
        // Write last data to the output data, too
        // mp3Data contains now the complete mp3Data
        mp3Data.push(mp3Tmp2);

        const mp3Blob = new Blob(mp3Data, {
          type: 'audio/mpeg',
        });
        console.log('got mp3 data', mp3Blob);
        downloadFile(mp3Blob, 'test.mp3');

        const audioTranscript = await whisperTranscribe(mp3Blob, undefined, language, 0.1, 'json');
        console.log('got audio transcript', audioTranscript);
        return audioTranscript;
      }
    })();
  }
};

//

class VideoFileRecorder {
  constructor({
    width,
    height,
  }) {
    this.sampleRate = 48000;
    this.numberOfChannels = 2;

    this.muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: {
        codec: 'V_VP9',
        width,
        height,
      },
      audio: {
        codec: 'A_OPUS',
        numberOfChannels: this.numberOfChannels,
        sampleRate: this.sampleRate,
      },
    });

    this.videoEncoder = new VideoEncoder({
      output: (chunk, metadata) => {
        // console.log('video chunk', chunk, metadata);
        return this.muxer.addVideoChunk(chunk, metadata);
      },
      error: (error) => {
        console.error('VideoEncoder error:', error);
      },
    });
    this.videoEncoder.configure({
      // codec: 'vp09.*', // or 'avc1.4D401F', 'vp8', etc.
      codec: 'vp09.00.41.08',
      // width: canvas.width,
      // height: canvas.height,
      width,
      height,
      // bitrate: 1000000, // in bits per second
      // use 5Mbps
      bitrate: 5000000,
      framerate: 30,
    });

    this.audioEncoder = new AudioEncoder({
      output: (encodedChunk, metadata) => {
        // console.log('audio chunk', encodedChunk, metadata);
        return this.muxer.addAudioChunk(encodedChunk, metadata);
      },
      error: err => {
        console.error('AudioEncoder error:', err);
      },
    });
    this.audioEncoder.configure({
      codec: 'opus',
      sampleRate: this.sampleRate,
      numberOfChannels: this.numberOfChannels,
      bitrate: 128000,
    });
  }
  
  async encodeVideoFrame(canvas, timestampSeconds, keyFrame) {
    const timestamp = timestampSeconds * 1000 * 1000; // microseconds
    // console.log('encode video frame', canvas, timestamp);
    const imageBitmap = await createImageBitmap(canvas);
    const videoFrame = new VideoFrame(imageBitmap, {
      timestamp,
    });
    this.videoEncoder.encode(videoFrame, {
      keyFrame,
    });
    videoFrame.close();
    imageBitmap.close();
  }
  async finishVideo() {
    await this.videoEncoder.flush();
  }

  encodeAudio(audioBuffer) {
    const audioData = convertAudioBufferToAudioData(audioBuffer);
    // console.log('encode audio', audioData);  
    this.audioEncoder.encode(audioData);
    audioData.close();
  }
  async finishAudio() {
    await this.audioEncoder.flush();
    this.audioEncoder.close();
  }

  getResult() {
    this.muxer.finalize();
    const {
      buffer: webmBuffer,
    } = this.muxer.target;
    return webmBuffer;
  }
}
export class VideoScriptCompiler extends CachedScriptCompiler {
  constructor({
    aiFps = 1,
    cacheScripts = false,
  } = {}) {
    super({
      cacheScripts,
    });

    this.aiFps = aiFps;
  }
  async compile(u) {
    // fetch the video
    const resPromise = fetch(u);
    const oldU = u;
    u = null;
    const res = await resPromise;
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const arrayBuffer = await blob.arrayBuffer();

    const video = document.createElement('video');
    video.src = blobUrl;

    const metadata = await new Promise((accept, reject) => {
      video.onloadeddata = e => {
        accept(e);
      };
    });
    this.dispatchEvent(new MessageEvent('loadedmetadata', {
      data: {
        video,
        metadata,
      },
    }));

    const videoTicker = new VideoTicker(video, {
      fpsFactor: this.aiFps,
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // bake video
    const frames = await this.getScriptProps(oldU, async () => {
      const frames = [];

      const startTime = performance.now();
      await videoTicker.play(async e => {
        const {
          video,
          timestamp: t,
        } = e;

        const factor = t / video.duration;
        const percent = factor * 100;
        const now = performance.now();
        const eta = (((now - startTime) / factor) - (now - startTime)) / 1000;
        console.log(`${percent.toFixed(2)}% ETA ${eta.toFixed(2)}s`);

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise((accept, reject) => {
          canvas.toBlob(blob => {
            accept(blob);
          }, 'image/jpeg');
        });

        const imageBitmapPromise = Promise.resolve(video);
        const segmentCaptions = await imageSegmentationMulti({
          blob,
          imageBitmapPromise,
        });

        const frame = {
          segmentCaptions,
          timestamp: t,
        };
        frames.push(frame);

        this.dispatchEvent(new MessageEvent('perceptionupdate', {
          data: {
            imageBitmap: video,
            seg: segmentCaptions,
          },
        }));
      });

      return frames;
    });

    // render video
    const videoFileRecorder = new VideoFileRecorder({
      width: video.videoWidth,
      height: video.videoHeight,
    });
    let lastKeyframeTime = 0;
    const maxKeyFrameTime = 30; // seconds
    await Promise.all([
      (async () => {
        // render audio
        const audioContext = new AudioContext({
          sampleRate: videoFileRecorder.sampleRate,
        });

        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice());
        videoFileRecorder.encodeAudio(audioBuffer);
        await videoFileRecorder.finishAudio();
      })(),
      (async () => {
        // render video
        await videoTicker.play(async e => {
          const {
            video,
            timestamp: t,
          } = e;

          // render
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const timeSinceLastKeyframe = t - lastKeyframeTime;
          const isKeyframe = timeSinceLastKeyframe >= maxKeyFrameTime;
          if (isKeyframe) {
            lastKeyframeTime = t;
          }
          await videoFileRecorder.encodeVideoFrame(canvas, t, isKeyframe);
        });

        await videoFileRecorder.finishVideo();

        // finish muxing
        {
          const webmBuffer = videoFileRecorder.getResult();
          console.log('got mux result', webmBuffer);
          const blob = new Blob([webmBuffer], {
            type: 'video/webm',
          });
          // downloadFile(blob, 'output.webm');

          // play the video
          const video = document.createElement('video');
          video.src = URL.createObjectURL(blob);
          video.controls = true;
          video.style.cssText = `\
position: fixed;
top: 0;
left: 0;
z-index: 2;
`;
          document.body.appendChild(video);
        }
      })(),
    ]);

  }
};
export class AudioScriptCompiler extends CachedScriptCompiler {
  constructor({
    aiFps = 1,
    cacheScripts = false,
  } = {}) {
    super({
      cacheScripts,
    });
  }
  async compile(u) {
    console.log('compileAudioScript 1', u);
    const resPromise = fetch(u);
    u = null;
    console.log('compileAudioScript 2', u);
    const res = await resPromise;
    const arrayBuffer = await res.arrayBuffer();
    console.log('compileAudioScript 3', u, arrayBuffer.byteLength);

    const audioContext = new AudioContext();
    const audioData = await audioContext.decodeAudioData(arrayBuffer.slice());

    console.log('compileAudioScript 4', u);

    const musicScript = await (async () => {
      // offline render audio context
      const offlineAudioContext = new OfflineAudioContext({
        sampleRate: audioContext.sampleRate,
        length: audioData.length,
        numberOfChannels: audioData.numberOfChannels,
      });
      await loadWorkletModules(offlineAudioContext);

      // play entire audio buffer
      const audioBufferSourceNode = offlineAudioContext.createBufferSource();
      audioBufferSourceNode.buffer = audioData;

      // beat detector node
      const beatDetectionWorkletNode = new BeatDetectionWorkletNode({
        audioContext: offlineAudioContext,
      });
      let musicScript = [];
      beatDetectionWorkletNode.addEventListener('update', e => {
        const {
          bpm,
          sampleTimestamp,
          onsetTimestamps,
          beatTimestamps,
          rootNote,
          quality,
          intervals,
        } = e.data;
        // console.log('got update', {bpm, intervals});
        console.log('got update', bpm);

        for (let i = 0; i < beatTimestamps.length; i++) {
          const beatTimestamp = beatTimestamps[i];
          const me = {
            type: 'beat',
            timestamp: beatTimestamp,
            bpm,
          };
          musicScript.push(me);
        }

        if (rootNote !== '') {        
          let chord = Chord.get(`${rootNote}${quality}${intervals}`);
          if (chord.empty) {
            chord = Chord.get(`${rootNote}${quality}`);
          }
          if (chord && !chord.empty) {
            const octave = 4;
            const rawNotes = chord.notes.map(note => Note.get(`${note}${octave}`));
            const notes = [];
            const freqs = [];
            for (const note of rawNotes) {
              if (note && !note.empty) {
                notes.push(note.name);
                freqs.push(note.freq);
              }
            }
            if (freqs.length > 0) {
              const lastMe = musicScript[musicScript.length - 1];
              if (lastMe && lastMe.type === 'chord' && lastMe.symbol === chord.symbol) {
                // skip;
              } else {
                const chordDetectionOffsetSamples = 8192;
                let chordTimestamp = sampleTimestamp - chordDetectionOffsetSamples;
                chordTimestamp = Math.max(chordTimestamp, 0);

                const me = {
                  type: 'chordFragment',
                  timestamp: chordTimestamp,
                  symbol: chord.symbol,
                  notes,
                  freqs,
                };
                musicScript.push(me);
              }
            }
          } else {
            console.warn('bad chord', chord);
            debugger;
          }
        }
      });
      // console.log('beat detector wait for load 1');
      await beatDetectionWorkletNode.waitForLoad();
      // console.log('beat detector wait for load 2');

      // connect
      audioBufferSourceNode.connect(beatDetectionWorkletNode);
      beatDetectionWorkletNode.connect(offlineAudioContext.destination);

      // start
      audioBufferSourceNode.start();

      // render
      await offlineAudioContext.startRendering();

      // postprocess musicScript
      {
        console.log('musicScript 1', musicScript.slice());
        // add duration to all chord fragments
        for (let i = 0; i < musicScript.length; i++) {
          const me = musicScript[i];
          if (me.type === 'chordFragment') {
            const nextMe = (() => {
              for (let j = i + 1; j < musicScript.length; j++) {
                const _me = musicScript[j];
                if (_me.type === 'chordFragment') {
                  return _me;
                }
              }
              return null;
            })();
            if (nextMe) {
              me.duration = nextMe.timestamp - me.timestamp;
            } else {
              me.duration = audioData.sampleRate;
            }
          }
        }
        // console.log('post 2', musicScript.length);
        // join chord fragments next to each other with the same symbol
        for (let i = 0; i < musicScript.length; i++) {
          const me = musicScript[i];
          if (me.type === 'chordFragment' && me.duration > 0) {
            let baseIndex = i + 1;
            for (;;) {
              const nextMe = (() => {
                for (; baseIndex < musicScript.length; baseIndex++) {
                  const _me = musicScript[baseIndex];
                  if (_me.type === 'chordFragment') {
                    return _me;
                  }
                }
                return null;
              })();
              if (nextMe && nextMe.symbol === me.symbol) {
                me.duration += nextMe.duration;
                nextMe.duration = 0;

                baseIndex++;
              } else {
                break;
              }
            }
          }
        }
        // console.log('post 3', musicScript.length);
        // filter out 0 duration chord fragments
        musicScript = musicScript.filter(me => me.type !== 'chordFragment' || me.duration > 0);
        // add end time to chord fragments
        // console.log('post 4', musicScript.length);
        for (let i = 0; i < musicScript.length; i++) {
          const me = musicScript[i];
          if (me.type === 'chordFragment') {
            me.endTimestamp = me.timestamp + me.duration;
          }
        }
        // compute chords in beteween beats
        const beats = musicScript.filter(me => me.type === 'beat');
        beats.unshift(null); // prior to first beat
        for (let i = 0; i < beats.length; i++) {
          const beat = beats[i];
          const timestamp = beat ? beat.timestamp : 0;
          const nextBeat = beats[i + 1];
          const endTimestamp = nextBeat ? nextBeat.timestamp : (timestamp + audioData.sampleRate);
          const duration = endTimestamp - timestamp;

          // find most popular chord in this beat, by how much they overlap
          const chordPopularity = new Map();
          for (let j = 0; j < musicScript.length; j++) {
            const me = musicScript[j];
            if (me.type === 'chordFragment') {
              const overlap = Math.min(me.endTimestamp, endTimestamp) - Math.max(me.timestamp, timestamp);
              if (overlap > 0) {
                const popularity = chordPopularity.get(me.symbol) || 0;
                chordPopularity.set(me.symbol, popularity + overlap);
              }
            }
          }
          if (chordPopularity.size > 0) {
            // get the most popular chord symbol
            let maxPopularity = 0;
            let maxPopularitySymbol = '';
            for (const [symbol, popularity] of chordPopularity) {
              if (popularity > maxPopularity) {
                maxPopularity = popularity;
                maxPopularitySymbol = symbol;
              }
            }
            // get the first chord fragment with that symbol
            const chordFragment = musicScript.find(me => me.type === 'chordFragment' && me.symbol === maxPopularitySymbol);
            if (!chordFragment) {
              throw new Error('internal error: no chord fragment found');
            }
            const {
              symbol,
              notes,
              freqs,
            } = chordFragment;

            const me = {
              type: 'chord',
              timestamp,
              duration,
              symbol,
              notes,
              freqs,
            };
            musicScript.push(me);
          }
          // console.log('post 5', musicScript.length);
        }
        // filter out chord fragments
        musicScript = musicScript.filter(me => me.type !== 'chordFragment');
      }

      return musicScript;
    })();

    console.log('got music script', musicScript);
    // compute the chord string
    let symbols = musicScript.filter(n => n.type === 'chord').map(n => n.symbol);
    // remove adjacent duplicates, replacing them with 'x ${repeatCount}', for example 'x 2' 
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      if (symbol) {
        let repeatCount = 1;
        for (let j = i + 1; j < symbols.length; j++) {
          const nextSymbol = symbols[j];
          if (nextSymbol === symbol) {
            repeatCount++;
            symbols[j] = '';
          } else {
            break;
          }
        }
        if (repeatCount > 1) {
          symbols[i] += ` x ${repeatCount}`;
        }
      }
    }
    symbols = symbols.filter(n => !!n);
    const chordString = symbols.join(' ');
    console.log('got chord string', chordString);
    // globalThis.chordString = chordString;

    // render the music script
    const renderAudioContext = new AudioContext();

    // load sfx
    const tickAudioData = await (async () => {
      const res = await fetch('/audio/tick2.mp3');
      const arrayBuffer = await res.arrayBuffer();
      const audioData = await renderAudioContext.decodeAudioData(arrayBuffer);
      return audioData;
    })();

    // schedule main
    const audioBufferSourceNode = renderAudioContext.createBufferSource();
    audioBufferSourceNode.buffer = audioData;
    audioBufferSourceNode.connect(renderAudioContext.destination);
    audioBufferSourceNode.start();

    // schedule beat ticks
    for (let i = 0; i < musicScript.length; i++) {
      const me = musicScript[i];
      if (me.type === 'beat') {
        const {
          timestamp,
        } = me;

        // timestamp is in samples, convert it to seconds
        const timestampSeconds = timestamp / audioData.sampleRate;

        const tickAudioBufferSourceNode = renderAudioContext.createBufferSource();
        tickAudioBufferSourceNode.buffer = tickAudioData;
        tickAudioBufferSourceNode.connect(renderAudioContext.destination);
        tickAudioBufferSourceNode.start(timestampSeconds);
      }
    }

    // shedule chords
    // const rawSynth = new RawSynth();
    // rawSynth.connect(renderAudioContext.destination);
    const chordDestinationNode = renderAudioContext.createGain();
    chordDestinationNode.gain.value = 0.15;
    chordDestinationNode.connect(renderAudioContext.destination);

    for (let i = 0; i < musicScript.length; i++) {
      const me = musicScript[i];
      if (me.type === 'chord') {
        let {
          timestamp,
          freqs,
        } = me;

        // timestamp is in samples, convert it to seconds
        const timestampSeconds = timestamp / audioData.sampleRate;

        // compute end time
        const nextChord = (() => {
          for (let j = i + 1; j < musicScript.length; j++) {
            const nextMe = musicScript[j];
            if (nextMe.type === 'chord') {
              return nextMe;
            }
          }
          return null;
        })() ?? {
          timestamp: timestamp + audioData.sampleRate,
          freqs: [],
        };
        const duration = (nextChord.timestamp - timestamp) / audioData.sampleRate;
        const endTimestampSeconds = timestampSeconds + duration;

        // create oscillator
        for (let j = 0; j < freqs.length; j++) {
          const freq = freqs[j];
          const oscillator = renderAudioContext.createOscillator();
          // oscillator.type = 'sine';
          oscillator.type = 'sawtooth';
          oscillator.frequency.value = freq;
          // volume goes down as the frequency goes up
          // const volume = 1 - (freq / 1000);
          // better forula:
          // let volume = 1 - ((freq / 1000) ** 2);
          let volume = 1 - (freq / 500);
          // scale all notes except the first
          volume /= (2 ** (j - 1));
          oscillator.volume = volume;
          oscillator.connect(chordDestinationNode);
          oscillator.start(timestampSeconds);
          oscillator.stop(endTimestampSeconds);
        }
      }
    }

    // play the audio
    await renderAudioContext.resume();
  }
};
// globalThis.enableDeviceEmulation = async (width = 512, height = 512) => {
//   await globalThis.electronIpc.enableDeviceEmulation({
//     width,
//     height,
//   });
// };
globalThis.screenshotPage = async () => {
  const screenshotResult = await globalThis.electronIpc.screenshotPage();
  // console.log('got screenshot result', screenshotResult);
  const {
    width,
    height,
    imageBufferB64,
  } = screenshotResult;
  // console.log('got result ', {
  //   width,
  //   height,
  //   // imageBufferB64,
  //   // screenshotResult,
  // });

  const imgUrl = `data:image/png;base64,${imageBufferB64}`;
  const img = new Image();
  img.src = imgUrl;
  img.style.cssText = `\
position: fixed;
top: 0;
left: 0;
width: 300px;
height: auto;
object-fit: contain;
z-index: 3;
`;
  img.onload = () => {
    console.log('got image', img);
  };
  img.onerror = err => {
    console.warn('error loading image', err);
  };
  document.body.appendChild(img);
};

export function compileMediaScript(blob) {
  console.log('compile media script', blob);
}

//

export class MediaScriptDriver extends EventTarget {
  constructor() {
    super();
  }

  start() {
    // XXX
  }
  stop() {
    // XXX
  }
}