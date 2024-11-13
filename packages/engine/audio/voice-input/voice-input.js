import { createMp3MicrophoneSource } from '../../../multiplayer/public/audio/audio-client.mjs';
import { aiProxyHost } from '../../endpoints.js';
import { QueueManager } from '../../managers/queue/queue-manager.js';
import { decodeAudioFile, delay, stt } from '../../util.js';
import MicrophoneWorker from '../microphone-worker.js';
import Rvc from '../rvc.js';
import analyserFrequency from 'analyser-frequency-average';
import posthog from 'posthog-js';
//

class VoiceActivityDetector extends AnalyserNode {
  static updateTime = 20; // rate at which to poll
  static graceTime = 500; // time to wait after a change before allowing another change

  constructor(audioContext, opts) {
    super(audioContext, opts);

    //

    const options = {
      fftSize: 512,
      // bufferLen: 1024,
      // smoothingTimeConstant: 0.8,
      // smoothingTimeConstant: 0.2,
      smoothingTimeConstant: 0,
      // note: male voice range is typically 85-155 Hz, while female voice range is typically 165-255 Hz
      minCaptureFreq: 100, // in Hz
      maxCaptureFreq: 255, // in Hz
      noiseCaptureDuration: 500, // in ms
      minNoiseLevel: 0.4, // from 0 to 1
      maxNoiseLevel: 0.8, // from 0 to 1
      avgNoiseMultiplier: 1.5,
      // onVoiceStart: function() {
      // },
      // onVoiceStop: function() {
      // },
      // onUpdate: function(val) {
      // },
    };
    this.smoothingTimeConstant = options.smoothingTimeConstant;
    this.fftSize = options.fftSize;

    //

    const frequencies = new Uint8Array(this.frequencyBinCount);

    let baseLevel = 0;
    // let voiceScale = 1;
    let activityCounter = 0;
    let activityCounterMin = 0;
    let activityCounterMax = 60;
    let activityCounterThresh = 5;
    let envFreqRange = [];
    let isNoiseCapturing = true;
    let prevVadState = false;
    let vadState = false;
    let noiseCaptureStartTime = -Infinity;
    let lastChangeTime = -Infinity;

    this.update = () => {
      const now = performance.now();
      this.getByteFrequencyData(frequencies);
      const average = analyserFrequency(
        this,
        frequencies,
        options.minCaptureFreq,
        options.maxCaptureFreq,
      );

      if (isNoiseCapturing) {
        if (!isFinite(noiseCaptureStartTime)) {
          noiseCaptureStartTime = now;
        }

        const timeDiff = now - noiseCaptureStartTime;
        if (timeDiff < options.noiseCaptureDuration) {
          envFreqRange.push(average);
        } else {
          // envFreqRange = envFreqRange.filter(function(val) {
          //   return val;
          // }).sort();
          // const averageEnvFreq = envFreqRange.length ? envFreqRange.reduce(function (p, c) { return Math.min(p, c) }, 1) : options.minNoiseLevel;
          let averageEnvFreq;
          const envFreqRange2 = envFreqRange.filter((val) => val !== 0);
          if (envFreqRange2.length > 0) {
            // averageEnvFreq = 1;
            // for (let i = 0; i < envFreqRange2.length; i++) {
            //   averageEnvFreq = Math.min(averageEnvFreq, envFreqRange2[i]);
            // }
            averageEnvFreq = 0;
            for (let i = 0; i < envFreqRange2.length; i++) {
              averageEnvFreq += envFreqRange2[i];
            }
            averageEnvFreq /= envFreqRange2.length;
          } else {
            averageEnvFreq = options.minNoiseLevel;
          }
          baseLevel = averageEnvFreq * options.avgNoiseMultiplier;
          // console.log('base level 1', baseLevel);
          baseLevel = Math.min(
            Math.max(baseLevel, options.minNoiseLevel),
            options.maxNoiseLevel,
          );
          // console.log('base level 2', baseLevel);

          // voiceScale = 1 - baseLevel;

          isNoiseCapturing = false;
        }
      } else if (!isNoiseCapturing) {
        if (average >= baseLevel && activityCounter < activityCounterMax) {
          activityCounter++;
          // console.log('up');
        } else if (
          average < baseLevel * 0.9 &&
          activityCounter > activityCounterMin
        ) {
          activityCounter--;
          // console.log('down');
        }
        vadState = activityCounter > activityCounterThresh;

        if (prevVadState !== vadState) {
          // console.log('pre change');
          if (now - lastChangeTime > VoiceActivityDetector.graceTime) {
            this.dispatchEvent(
              new MessageEvent('voicechange', {
                data: {
                  enabled: vadState,
                },
              }),
            );
            console.log('changed', vadState);
            prevVadState = vadState;

            if (!vadState) {
              activityCounter = 0;
            }
            lastChangeTime = now;
            // } else {
            //   console.warn('too early');
          }
        }
      }
    };
    this.live = true;
    this.interval = null;
    this.resume();
  }
  resume() {
    if (this.live && this.interval === null) {
      this.interval = setInterval(
        this.update,
        VoiceActivityDetector.updateTime,
      );
    }
  }
  pause() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  destroy() {
    this.live = false;
    clearInterval(this.interval);
    this.interval = null;
  }
}

//

const closeMediaStream = (mediaStream) => {
  for (const track of mediaStream.getTracks()) {
    track.stop();
  }
};

//

export class VoiceInput extends EventTarget {
  constructor({ character, audioManager }) {
    super();

    // members
    this.character = character;
    this.audioManager = audioManager;

    // settings
    this.microphone = null;

    // locals
    this.mediaStream = null;
    // this.speechRecognition = null;
    this.speechMediaStream = null;
    this.speechActivityDetector = null;
    this.speechSource = null;
    // this.bufferWorker = null;
    this.rvcMediaStream = null;
    this.rvcWorker = null;
    this.rvc = null;
    this.rvcStream = null;

    this.deviceId = null;
  }

  micEnabled() {
    return !!this.mediaStream;
  }

  async #getDeviceID() {
    const devices = await this.audioManager.enumerateDevices();
    // find the microphone label
    const device = devices.find(
      (device) =>
        device.kind === 'audioinput' && device.label === this.microphone,
    );
    const deviceId = device && device.deviceId;
    return deviceId;
  }

  async #getMediaStream() {
    if (this.deviceId === null) {
      const deviceId = await this.#getDeviceID();
      this.deviceId = deviceId;
    }
    
    const sampleRate = this.audioManager.audioContext.sampleRate;
    const mediaStream = await this.audioManager.getUserMedia({
      audio: {
        deviceId: this.deviceId,
        sampleRate,
        echoCancellation: true,
        noiseSuppression: true,
        // autoGainControl: true,
      },
    });
    return mediaStream;
  }

  async enableMic() {
    this.mediaStream = await this.#getMediaStream();

    this.character && this.character.setMicMediaStream(this.mediaStream);

    this.dispatchEvent(
      new MessageEvent('micchange', {
        data: {
          enabled: true,
        },
      }),
    );
  }

  disableMic() {
    this.character && this.character.setMicMediaStream(null);

    // close all tracks on the stream
    if (this.mediaStream) {
      closeMediaStream(this.mediaStream);
      this.mediaStream = null;

      this.dispatchEvent(
        new MessageEvent('micchange', {
          data: {
            enabled: false,
          },
        }),
      );
    }

    if (this.speechEnabled()) {
      this.disableSpeech();
    }
  }

  async toggleMic() {
    if (this.micEnabled()) {
      this.disableMic();
    } else {
      await this.enableMic();
    }
  }

  speechEnabled() {
    return !!this.speechMediaStream;
  }

  async enableSpeech() {
    const speechMediaStream = await this.#getMediaStream();
    this.speechMediaStream = speechMediaStream;

    const { audioContext } = this.audioManager;
    const speechActivityDetector = new VoiceActivityDetector(audioContext);
    this.speechActivityDetector = speechActivityDetector;

    // let microphoneSource = null;
    const voiceQueue = new QueueManager();
    speechActivityDetector.addEventListener('voicechange', async (e) => {
      const { enabled } = e.data;
      if (this.speechSource === null && enabled) {
        // console.log('enabled');

        this.speechSource = createMp3MicrophoneSource({
          mediaStream: speechMediaStream,
          audioContext,
        });

        const bs = await this.speechSource.output.readAll();

        // try {
        if (bs.length > 0) {
          const audioBlob = new Blob(bs, {
            type: 'audio/mpeg',
          });
          bs.length = 0; // optimization
          // console.log('got blob', audioBlob);
          if (audioBlob.size > 4096) {
            await voiceQueue.waitForTurn(async () => {
              const text = await stt(audioBlob);

              if (text) {
                speechActivityDetector.pause();
                console.log('pause');

                let p = null;
                const e2 = new MessageEvent('speech', {
                  data: {
                    transcript: text,
                  },
                });
                e2.waitUntil = (p2) => {
                  p = p2;
                };
                this.dispatchEvent(e2);
                if (p !== null) {
                  await p;

                  // additional time to clear out the fft
                  await new Promise((accept, reject) => {
                    setTimeout(() => {
                      accept();
                    }, 100);
                  });
                }

                console.log('resume');
                speechActivityDetector.resume();
              }
            });
          } else {
            console.log('blob is too small', audioBlob.size);
          }
        }
        // } finally {
        //   this.speechActivityDetector.resume();
        // }
      } else if (this.speechSource !== null && !enabled) {
        this.speechSource.close();
        this.speechSource = null;
      }
    });

    // connect nodes
    const mediaStreamSource =
      audioContext.createMediaStreamSource(speechMediaStream);
    mediaStreamSource.connect(this.speechActivityDetector);

    // resume audio context if needed
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    this.dispatchEvent(
      new MessageEvent('speechchange', {
        data: {
          enabled: true,
        },
      }),
    );

    /* let final_transcript = '';
    const localSpeechRecognition = new webkitSpeechRecognition();

    // localSpeechRecognition.interimResults = false;
    localSpeechRecognition.interimResults = true;
    localSpeechRecognition.maxAlternatives = 1;
    // localSpeechRecognition.continuous = true;
    // localSpeechRecognition.interimResults = true;
    // localSpeechRecognition.lang = document.querySelector("#select_dialect").value;
    localSpeechRecognition.onerror = e => {
      console.log('speech recognition error', e);
    };
    localSpeechRecognition.onend = () => {
      if (final_transcript) {
        this.dispatchEvent(new MessageEvent('speech', {
          data: {
            transcript: final_transcript,
          },
        }));

        // this.disableSpeech();
      }

      if (localSpeechRecognition === this.speechRecognition) {
        final_transcript = '';
        localSpeechRecognition.start();
      }
    };
    localSpeechRecognition.onresult = event => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const partial = event.results[i][0].transcript;
        this.dispatchEvent(new MessageEvent('speechupdate', {
          data: {
            transcript: partial,
          },
        }));
        final_transcript = partial;
      }
    };
    localSpeechRecognition.start();

    this.speechRecognition = localSpeechRecognition;

    this.dispatchEvent(new MessageEvent('speechchange', {
      data: {
        enabled: true,
      },
    })); */
  }

  disableSpeech() {
    if (this.speechEnabled()) {
      if (this.speechMediaStream) {
        closeMediaStream(this.speechMediaStream);
        this.speechMediaStream = null;
      }
      if (this.speechSource) {
        this.speechSource.close();
        this.speechSource = null;
      }
      if (this.speechActivityDetector) {
        this.speechActivityDetector.disconnect();
        this.speechActivityDetector.destroy();
        this.speechActivityDetector = null;
      }

      this.dispatchEvent(
        new MessageEvent('speechchange', {
          data: {
            enabled: false,
          },
        }),
      );
    }
  }

  async toggleSpeech() {
    if (this.speechEnabled()) {
      this.disableSpeech();
      this.disableMic();
    } else {
      await this.enableSpeech();
    }
  }

  rvcEnabled() {
    return !!this.rvcMediaStream;
  }

  async enableRvc() {
    const rvcMediaStream = await this.#getMediaStream();
    this.rvcMediaStream = rvcMediaStream;

    const { audioContext } = this.audioManager;
    this.rvcWorker = new MicrophoneWorker({
      audioContext,
      sampleRate: Rvc.sampleRate,
      bufferSize: 4096 * 10,
      muted: true,
      emitVolume: false,
      emitBuffer: true,
    });

    this.rvc = new Rvc();
    this.rvcStream = this.rvc.createStream();

    // const bs = [];
    // let bsLength = 0;
    // this.rvcWorker.addEventListener('buffer', e => {
    //   // console.log('got data', e.data.byteLength);
    //   bs.push(e.data);
    //   bsLength += e.data.length;
    //   // console.log('got output', output);

    //   if (bsLength > 4096) {
    //     const b = new Float32Array(bsLength);
    //     for (let i = 0, offset = 0; i < bs.length; i++) {
    //       const b2 = bs[i];
    //       b.set(b2, offset);
    //       offset += b2.length;
    //     }
    //     this.rvcStream.write(b);

    //     bs.length = 0;
    //     bsLength = 0;
    //   }
    // });
    this.rvcWorker.addEventListener('buffer', (e) => {
      this.rvcStream.write(e.data);
    });

    /* var channels = 1
    var sampleRate = kSampleRate
    var frames = length

    var buffer = context.createBuffer(channels, frames, sampleRate)

    console.log('Setting data to buffer');
    // `data` comes from your Websocket, first convert it to Float32Array
    buffer.getChannelData(0).set(data)

    buffer.getChannelData(0).buffer = data.buffer;

    console.log('source.buffer = buffer');

    var source = context.createBufferSource()
    source.buffer = buffer;

    console.log('Connecting source');
    // Then output to speaker for example
    source.connect(context.destination) */

    // connect nodes
    const mediaStreamSource =
      audioContext.createMediaStreamSource(rvcMediaStream);
    const bufferNode = this.rvcWorker.getInput();
    mediaStreamSource.connect(bufferNode);

    // resume audio context if needed
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    this.dispatchEvent(
      new MessageEvent('rvcstream', {
        data: {
          stream: this.rvcStream,
        },
      }),
    );

    this.dispatchEvent(
      new MessageEvent('rvcchange', {
        data: {
          enabled: true,
        },
      }),
    );
  }

  async disableRvc() {
    if (this.rvcMediaStream) {
      closeMediaStream(this.rvcMediaStream);
      this.rvcMediaStream = null;
    }
    if (this.rvcWorker) {
      this.rvcWorker.close();
      this.rvcWorker = null;
    }
    if (this.rvc) {
      this.rvc.destroy();
      this.rvc = null;
    }
    if (this.rvcStream) {
      this.rvcStream.end();
      this.rvcStream = null;
    }

    this.dispatchEvent(
      new MessageEvent('rvcchange', {
        data: {
          enabled: false,
        },
      }),
    );
  }

  async toggleRvc() {
    if (this.rvcEnabled()) {
      this.disableRvc();
    } else {
      await this.enableRvc();
    }
  }

  async togglervc(embodimmentManager, multiplayer) {
    if (this.rvcMediaStream) {
      closeMediaStream(this.rvcMediaStream);
      this.rvcMediaStream = null;

      this.rvcAudioContext = null;
      
      if (this.speechMediaStream) {
        closeMediaStream(this.speechMediaStream);
        this.speechMediaStream = null;
      }
      if (this.speechSource) {
        this.speechSource.close();
        this.speechSource = null;
      }
      if (this.speechActivityDetector) {
        this.speechActivityDetector.disconnect();
        this.speechActivityDetector.destroy();
        this.speechActivityDetector = null;
      }

      this.dispatchEvent(
        new MessageEvent('speechchange', {
          data: {
            enabled: false,
          },
        }),
      );

      this.deviceId = null;
    } else {
      this.rvcMediaStream = await this.#getMediaStream();
      const { audioContext } = this.audioManager;
      this.rvcAudioContext = audioContext;

      const speechMediaStream = await this.#getMediaStream();
      this.speechMediaStream = speechMediaStream;
      const speechActivityDetector = new VoiceActivityDetector(audioContext);
      this.speechActivityDetector = speechActivityDetector;

      speechActivityDetector.addEventListener('voicechange', async (e) => {
        const { enabled } = e.data;
        // console.log('voicechange', enabled);
        if (this.speechSource === null && enabled) {
          // console.log('enabled');
          this.speechSource = createMp3MicrophoneSource({
            mediaStream: speechMediaStream,
            audioContext,
          });
          const bs = await this.speechSource.output.readAll();

          if (bs.length > 0) {
            const audioBlob = new Blob(bs, {
              type: 'audio/mpeg',
            });
            bs.length = 0; 
            if (audioBlob.size > 4096) {
              const text = await stt(audioBlob);
              embodimmentManager.dispatchEvent(new MessageEvent('rvc_message', {
                data: {
                  message: text,
                  multiplayer,
                },
              }));
          }
        }
      } else if (this.speechSource !== null && !enabled) {
        this.speechSource.close();
        this.speechSource = null;
      }
    });

      const mediaStreamSource =
      audioContext.createMediaStreamSource(speechMediaStream);
      mediaStreamSource.connect(this.speechActivityDetector);
    }

    return !!this.rvcMediaStream;
  }

  /* getBufferEnabled() {
    return !!this.bufferWorker;
  }
  async enableBuffer() {
    if (!this.micEnabled()) {
      await this.enableMic();
    }

    const {
      audioContext,
    } = this.audioManager;
    const {
      mediaStream,
    } = this;
    this.bufferWorker = new MicrophoneWorker({
      audioContext,
      muted: true,
      emitVolume: true,
      emitBuffer: false,
    });

    // let microphoneSource = null;
    let mediaRecorder = null;
    let lastEnabledTime = 0;
    const enableThreshold = 0.1;
    const disableThreshold = 0.05;
    const enabledGracePeriod = 500;
    this.bufferWorker.addEventListener('volume', async e => {
      const volume = e.data;
      const now = performance.now();
      if (volume > enableThreshold) {
        lastEnabledTime = now;
      }
      if (mediaRecorder === null && volume > enableThreshold) {
        console.log('enabled');

        const localMediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'audio/webm',
        });
        mediaRecorder = localMediaRecorder;
        mediaRecorder.blobs = [];
        const queue = new QueueManager();
        mediaRecorder.addEventListener('dataavailable', async e => {
          // await queue.waitForTurn(async () => {
          //   const blob = await mediaRecorder.requestData();
          //   mediaRecorder.blobs.push(blob);
          // });
          localMediaRecorder.blobs.push(e.data);
        });
        const framerate = 500;
        mediaRecorder.start(framerate);

        // microphoneSource = createMicrophoneSource({
        //   mediaStream,
        //   audioContext,
        // });
        // microphoneSource.bs = [];
        // const {
        //   outputSocket,
        // } = microphoneSource;
        // outputSocket.addEventListener('data', e => {
        //   microphoneSource.bs.push(e.data);
        // });
      } else if (mediaRecorder !== null && volume < disableThreshold && (now - lastEnabledTime) > enabledGracePeriod) {
        const localMediaRecorder = mediaRecorder;
        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(localMediaRecorder.blobs, {
            type: 'audio/webm',
          });
          this.dispatchEvent(new MessageEvent('buffer', {
            data: {
              buffer: audioBlob,
            },
          }));
        });
        mediaRecorder.stop();
        mediaRecorder = null;
        // console.log('got bs', microphoneSource.bs);
        // const audioBlob = new Blob(microphoneSource.bs, {
        //   type: 'audio/webm',
        // });
        // this.dispatchEvent(new MessageEvent('buffer', {
        //   data: {
        //     buffer: audioBlob,
        //   },
        // }));
        // microphoneSource.close();
        // microphoneSource = null;
      }
    });
    const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
    const bufferNode = this.bufferWorker.getInput();
    // const outputNode = this.audioManager.getInput();
    mediaStreamSource.connect(bufferNode);
    // bufferNode.connect(outputNode);

    // resume audio context if needed
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    this.dispatchEvent(new MessageEvent('bufferchange', {
      data: {
        enabled: true,
      }
    }));
  }
  disableBuffer() {
    if (this.getBufferEnabled()) {
      this.bufferWorker.close();
      this.bufferWorker = null;

      this.dispatchEvent(new MessageEvent('bufferchange', {
        data: {
          enabled: false,
        }
      }));
    }
  }
  async toggleBuffer() {
    if (this.getBufferEnabled()) {
      this.disableBuffer();
    } else {
      await this.enableBuffer();
    }
  } */

  destroy() {
    this.disableSpeech();
    this.disableMic();
  }
}
