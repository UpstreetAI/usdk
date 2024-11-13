import * as THREE from 'three';
import { MediaPipeProcessorWorker } from '../../../mediapipe/mediapipe-worker-wrap.js';
import { MediaPipeRenderer } from '../../../mediapipe/renderer.js';
// import {
//   VoiceInput,
// } from '../../audio/voice-input/voice-input.js';

const localVector = new THREE.Vector3();

export const embodyModes = ['None', 'VTube', 'VR', 'AR'];

//

export class EmbodimentManager extends EventTarget {
  constructor({
    engineRenderer,
    audioManager,
    playersManager,
    chatManager,
    voiceQueueManager,
    xrManager,
    tempManager,
  }) {
    super();

    if (
      !engineRenderer ||
      !audioManager ||
      !playersManager ||
      !chatManager ||
      !voiceQueueManager ||
      !xrManager ||
      !tempManager
    ) {
      console.warn('missing arguments', {
        engineRenderer,
        audioManager,
        playersManager,
        chatManager,
        voiceQueueManager,
        xrManager,
        tempManager,
      });
      debugger;
      throw new Error('missing arguments');
    }

    this.engineRenderer = engineRenderer;
    this.audioManager = audioManager;
    this.playersManager = playersManager;
    this.chatManager = chatManager;
    this.voiceQueueManager = voiceQueueManager;
    this.xrManager = xrManager;
    this.tempManager = tempManager;

    this.mode = embodyModes[0];

    const localPlayer = playersManager.getLocalPlayer();
    this.voiceInput = localPlayer.voiceInput;

    // bind speech
    this.chatManager.addEventListener('message', (e) => {
      const { message, source } = e.data;

      if (source === 'local') {
        // XXX this needs to be replaced with:
        // message.bindLore(engine);
        // ChatConversation.queueMessage(message);

        // (async () => {
        //   const abortController = new AbortController();
        //   const { signal } = abortController;

        //   const text = message.getContent();
        //   const stream = await localPlayer.voicer.getStream(text, {
        //     signal,
        //   });

        //   this.dispatchEvent(
        //     new MessageEvent('chatstream', {
        //       data: {
        //         stream,
        //       },
        //     })
        //   );
        // })();
      }
    });
    this.voiceInput.addEventListener('speech', async (e) => {
      const { transcript } = e.data;

      // submit speech to speech
      e.waitUntil(
        (async () => {
          const localPlayer = this.playersManager.getLocalPlayer();
          const stream = await localPlayer.voicer.getStream(transcript);

          let p = null;
          const e2 = new MessageEvent('speechstream', {
            data: {
              stream,
            },
          });
          e2.waitUntil = (p2) => {
            p = p2;
          };
          this.dispatchEvent(e2);
          if (p !== null) {
            await p;
          }
        })()
      );
    });
    // bind rvc
    this.voiceInput.addEventListener('rvcstream', async (e) => {
      this.dispatchEvent(
        new MessageEvent('rvcstream', {
          data: e.data,
        })
      );
    });
    // proxy enabled events
    for (const eventName of ['speechchange', 'micchange', 'rvcchange']) {
      this.voiceInput.addEventListener(eventName, (e) => {
        const { enabled } = e.data;
        this.dispatchEvent(
          new MessageEvent(eventName, {
            data: {
              enabled,
            },
          })
        );
      });
    }
    /* this.voiceInput.addEventListener('buffer', async e => {
      const {
        buffer: audioBlob,
      } = e.data;
      console.log('got voice change stream', audioBlob);

      const audio = document.createElement('audio');
      audio.src = URL.createObjectURL(audioBlob);
      audio.oncanplaythrough = () => {
        audio.play();
      };
      audio.onerror = err => {
        console.warn(err);
      };

      // submit speech to speech
      const localPlayer = this.playersManager.getLocalPlayer();
      const stream = await localPlayer.voicer.getVoiceChangeStream(audioBlob);

      const abortController = new AbortController();
      const {
        signal,
      } = abortController;

      // await voiceQueueManager.waitForTurn(async () => {
        await localPlayer.playStream(stream, {
          onStart: () => {
            // console.log('voice queue start');
            // playStart(message);
          },
          onEnd: () => {
            // console.log('voice queue end');
            // playEnd(message);
          },
          signal,
        });
      // });
    });
    this.voiceInput.addEventListener('bufferchange', e => {
      const {
        enabled,
      } = e.data;
      this.dispatchEvent(new MessageEvent('micchange', {
        data: {
          enabled,
        },
      }));
    }); */

    this.cameraPose = null;
    this.cancel = null;

    this.#listen();
  }

  getMode() {
    return this.mode;
  }
  setMode(mode) {
    this.mode = mode;

    this.dispatchEvent(
      new MessageEvent('modechange', {
        data: {
          mode,
        },
      })
    );
  }

  getMicEnabled() {
    return this.voiceInput.micEnabled();
  }
  async toggleMic() {
    this.audioManager.resume();

    await this.voiceInput.toggleMic();
  }

  getSpeechEnabled() {
    return this.voiceInput.speechEnabled();
  }
  async toggleSpeech() {
    this.audioManager.resume();

    await this.voiceInput.toggleSpeech();
  }

  async togglervc(multiplayer) {
    this.audioManager.resume();
    return await this.voiceInput.togglervc(this, multiplayer);
  }

  getRvcEnabled() {
    return this.voiceInput.rvcEnabled();
  }
  async toggleRvc() {
    this.audioManager.resume();

    await this.voiceInput.toggleRvc();
  }

  #listen() {
    this.addEventListener('modechange', (e) => {
      const { mode } = e.data;

      if (this.cancel) {
        this.cancel();
        this.cancel = null;
      }

      if (mode === 'VTube') {
        this.cancel = this.#startCamera();
      } else if (['VR', 'AR'].includes(mode)) {
        this.cancel = this.#startWebXR(mode);
      }
    });
  }
  #startCamera() {
    const abortController = new AbortController();
    const { signal } = abortController;

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      const closeStream = () => {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      };
      if (signal.aborted) {
        closeStream();
        return;
      } else {
        signal.addEventListener('abort', () => {
          closeStream();
        });
      }

      //

      const localPlayer = this.playersManager.getLocalPlayer();
      const worker = new MediaPipeProcessorWorker();
      worker.start({
        stream,
      });
      worker.addEventListener('load', () => {
        this.dispatchEvent(new Event('mediapipeload'));
      });
      worker.addEventListener('results', (e) => {
        const { results } = e.data;
        localPlayer.setAvatarPose(
          MediaPipeRenderer.computeAvatarPoseFromMediapipe(
            results,
            localPlayer.getAvatarPose(),
            this.tempManager
          )
        );
      });
      signal.addEventListener('abort', () => {
        worker.stop();
        localPlayer.setAvatarPose(null);
      });

      // debug output
      const renderer = new MediaPipeRenderer();
      this.engineRenderer.scene.add(renderer.scene);
      signal.addEventListener('abort', () => {
        renderer.scene.parent.remove(renderer.scene);
      });
      renderer.scene.updateMatrixWorld();
      worker.addEventListener('results', (e) => {
        const { results } = e.data;
        MediaPipeRenderer.drawResults(
          results,
          renderer.textureCanvas,
          renderer.textureCanvasCtx
        );
        renderer.render(results, this.tempManager);

        results.image.close(); // optimization

        const localPlayer = this.playersManager.getLocalPlayer();
        renderer.scene.position
          .copy(localPlayer.position)
          .add(
            localVector.set(0, 0, -1).applyQuaternion(localPlayer.quaternion)
          );
        renderer.scene.quaternion.copy(localPlayer.quaternion);
        renderer.scene.updateMatrixWorld();
      });
    })();

    return () => {
      abortController.abort();
    };
  }
  #startWebXR(mode) {
    const abortController = new AbortController();
    const { signal } = abortController;

    (async () => {
      await this.xrManager.enterXr(mode);

      const sessionend = () => {
        this.setMode('None');
        this.xrManager.removeEventListener('sessionend', sessionend);
      };
      this.xrManager.addEventListener('sessionend', sessionend);
    })();

    return () => {
      abortController.abort();
    };
  }
}
