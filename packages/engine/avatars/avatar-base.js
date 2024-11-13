import * as THREE from 'three';
import {AudioRecognizer} from '../audio/audio-recognizer.js';
import MicrophoneWorker from '../audio/microphone-worker.js';
import {
  AudioInjectWorkletNode,
} from '../audio/inject-worklet-node.js';

//

export class AvatarBase {
  constructor() {
    this.audioWorker = null;
    this.audioRecognizer = null;
    this.microphoneWorker = null;

    this.volume = 0;
  }

  isAudioEnabled() {
    return !!this.audioWorker;
  }

  #cleanupAudio() {
    this.volume = 0;

    if (this.audioWorker) {
      this.audioWorker.close();
      this.audioWorker = null;
    }
    if (this.audioRecognizer) {
      this.audioRecognizer.destroy();
      this.audioRecognizer = null;
    }
    if (this.microphoneWorker) {
      this.microphoneWorker.close();
      this.microphoneWorker = null;
    }
  }
  getAudioRecognizer({
    audioContext,
  }) {
    let {audioRecognizer} = this;
    if (!audioRecognizer) {
      audioRecognizer = new AudioRecognizer({
        sampleRate: audioContext.sampleRate,
      });
      audioRecognizer.addEventListener('result', e => {
        this.vowels.set(e.data);
      });
      this.audioRecognizer = audioRecognizer;
    }
    return audioRecognizer;
  }
  setAudioEnabled({
    audioContext,
  }) {
    // if (!audioContext) {
    //   debugger;
    // }

    if (audioContext) {
      if (!this.audioWorker) {
        // this.volume = 0;

        // const {audioContext} = audioManager;
        // if (audioContext.state === 'suspended') {
        //   (async () => {
        //     await audioContext.resume();
        //   })();
        // }

        this.audioWorker = new MicrophoneWorker({
          audioContext,
          muted: false,
          emitVolume: true,
          emitBuffer: true,
        });

        const _volume = e => {
          // the mouth is manually overridden by the CharacterBehavior class which is attached to all players
          // this happens when a player is eating fruit or yelling while making an attack
          if (!this.manuallySetMouth) {
            this.volume = e.data;
          }
        };
        const audioRecognizer = this.getAudioRecognizer({
          audioContext,
        });
        const _buffer = e => {
          audioRecognizer.send(e.data);
        };
        this.audioWorker.addEventListener('volume', _volume);
        this.audioWorker.addEventListener('buffer', _buffer);
      }
    } else {
      this.#cleanupAudio();
    }
  }

  getAudioInput() {
    return this.audioWorker.getInput();
  }

  setMicrophoneEnabled({
    audioContext,
  }) {
    // setup
    if (audioContext) {
      if (!this.microphoneWorker) {
        this.setAudioEnabled({
          audioContext,
        });

        this.microphoneWorker = new MicrophoneWorker({
          audioContext,
          muted: true,
          // muted: false,
          emitVolume: true,
          emitBuffer: true,
        });

        // let lastTime = performance.now();
        const _volume = e => {
          this.volume = this.volume * 0.8 + e.data * 0.2;
        };
        const audioRecognizer = this.getAudioRecognizer({
          audioContext,
        });
        const _buffer = e => {
          audioRecognizer.send(e.data);
        };
        this.microphoneWorker.addEventListener('volume', _volume);
        this.microphoneWorker.addEventListener('buffer', _buffer);
      }
    } else {
      // this.volume = 0;

      if (this.microphoneWorker) {
        this.microphoneWorker.close();
        this.microphoneWorker = null;
      }
    }
  }
  setAudioStreamEnabled({
    audioContext,
  }) {
    if (audioContext) {
      if (!this.audioInjectWorkletNode) {
        this.setAudioEnabled({
          audioContext,
        });

        this.audioInjectWorkletNode = new AudioInjectWorkletNode({
          audioContext,
        });

        this.audioInjectWorkletNode.connect(this.audioWorker.getInput());
      }
    } else {
      this.audioInjectWorkletNode.disconnect();
      this.audioInjectWorkletNode = null;
    }
  }
  getAudioStreamInput() {
    return this.audioInjectWorkletNode;
  }

  isMicrophoneEnabled() {
    return !!this.microphoneWorker;
  }

  getMicrophoneInput() {
    return this.microphoneWorker.getInput();
  }

  destroy() {
    this.#cleanupAudio();
  }
}