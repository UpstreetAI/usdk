'use client'

// import * as THREE from 'three';
// import {getAudioContext} from 'wsrtc/ws-audio-context.js';
// import microphoneWorklet from './microphone-worklet.js';
// import wsInjectWorklet from './ws-inject-worklet.js';
// import wsInputWorklet from './ws-input-worklet.js';
// import wsOutputWorklet from './ws-output-worklet.js';
// import microphoneWorklet from './microphone-worklet.js?worker';
// import wsInjectWorklet from './ws-inject-worklet.js?worker';
// import wsInputWorklet from './ws-input-worklet.js?worker';
// import wsOutputWorklet from './ws-output-worklet.js?worker';
// // import beatDetectionWorklet from './beat-detection-worklet.js?worker';


let createAudioManager ;

if (typeof window !== 'undefined' && window.AudioContext) {

  console.log("windows exists: ",window);
  
const loadWorkletModules = async (audioContext) => {
  try {
    const omitCreds = {
      credentials: "omit",
    };
    const audioWorkletPromises = [
      audioContext.audioWorklet.addModule('/scripts/microphone-worklet.js',omitCreds).catch((e) => { console.error('Error loading microphone-worklet.js:', e); throw e; }),
      audioContext.audioWorklet.addModule('/scripts/ws-inject-worklet.js',omitCreds).catch((e) => { console.error('Error loading ws-inject-worklet.js:', e); throw e; }),
      audioContext.audioWorklet.addModule('/scripts/ws-input-worklet.js',omitCreds).catch((e) => { console.error('Error loading ws-input-worklet.js:', e); throw e; }),
      audioContext.audioWorklet.addModule('/scripts/ws-output-worklet.js',omitCreds).catch((e) => { console.error('Error loading ws-output-worklet.js:', e); throw e; }),
    ];

    await Promise.all(audioWorkletPromises);
    console.log('All worklet modules loaded successfully.');
  } catch (error) {
    console.error('loadWorkletModules error:', error);
  }
  };

  createAudioManager = function({ audioContext }) {
    let gainNode = audioContext.createGain();
    let splitterNode = audioContext.createChannelSplitter(2);
    let mediaStreamDestinationNode = audioContext.createMediaStreamDestination();

    gainNode.connect(splitterNode);
    splitterNode.connect(audioContext.destination, 0);
    splitterNode.connect(mediaStreamDestinationNode, 1);

    let loadPromise = loadWorkletModules(audioContext);

    console.log("load promise: ", loadPromise);

    return {
      setAudioSession(sessionType = 'auto') {
        if (navigator.audioSession?.type) {
          navigator.audioSession.type = sessionType;
        }
      },

      async resume() {
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      },

      update() {
        // Assuming audioListener is defined elsewhere, like in a THREE.js context
        audioListener.updateMatrixWorld();
      },

      setVolume(volume) {
        gainNode.gain.value = volume;
      },

      getInput() {
        return gainNode;
      },

      captureStream() {
        return mediaStreamDestinationNode.stream;
      },

      playBuffer(audioBuffer) {
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(gainNode);
        sourceNode.start();
      },

      playSpatialBuffer(audioBuffer, object) {
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(gainNode);
        sourceNode.start();
      },

      async enumerateDevices() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices;
      },

      async getUserMedia(opts) {
        return await navigator.mediaDevices.getUserMedia(opts);
      },

      async waitForLoad() {
        await loadPromise;
      },

      async waitForStart() {
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      }
    };
  };
} else {
  // Fallback if running in a server environment or unsupported browser
  createAudioManager = function() {
    throw new Error('AudioContext is not supported in this environment.');
  };
}

export { createAudioManager };

// export class AudioManager {
//   constructor({ audioContext }) {
//     this.audioContext = audioContext;
//     // gain node
//     this.audioContext.gain = this.audioContext.createGain();
//     // split in two
//     this.audioContext.splitter = this.audioContext.createChannelSplitter(2);
//     // create media stream destination node
//     this.audioContext.mediaStreamDestination =
//       this.audioContext.createMediaStreamDestination();
//     // connect
//     this.audioContext.gain.connect(this.audioContext.splitter);
//     this.audioContext.splitter.connect(this.audioContext.destination, 0);
//     this.audioContext.splitter.connect(
//       this.audioContext.mediaStreamDestination,
//       1
//     );

//     //

//     // this.audioListener = new THREE.AudioListener();
//     // this.positionalAudio = new THREE.PositionalAudio(this.audioListener);

//     //

//     this.loadPromise = loadWorkletModules(this.audioContext);

//     console.log("loadPromise: ",this.loadPromise);
//   }


//   setAudioSession(sessionType = 'auto') {
//     if (navigator.audioSession?.type) {
//       navigator.audioSession.type = sessionType;
//     }
//   }

//   async resume() {
//     if (this.audioContext.state === 'suspended') {
//       await this.audioContext.resume();
//     }
//   }
//   update() {
//     this.audioListener.updateMatrixWorld();
//   }

//   setVolume(volume) {
//     this.audioContext.gain.gain.value = volume;
//   }

//   getInput() {
//     return this.audioContext.gain;
//   }

//   captureStream() {
//     return this.audioContext.mediaStreamDestination.stream;
//   }

//   playBuffer(audioBuffer) {
//     const sourceNode = this.audioContext.createBufferSource();
//     sourceNode.buffer = audioBuffer;
//     sourceNode.connect(this.audioContext.gain);
//     sourceNode.start();
//   }

//   playSpatialBuffer(audioBuffer, object) {
//     const sourceNode = this.audioContext.createBufferSource();
//     sourceNode.buffer = audioBuffer;
//     sourceNode.connect(this.audioContext.gain);
//     sourceNode.start();
//   }

//   async enumerateDevices() {
//     const devices = await navigator.mediaDevices.enumerateDevices();
//     return devices;
//   }

//   async getUserMedia(opts) {
//     return await navigator.mediaDevices.getUserMedia(opts);
//   }

//   async waitForLoad() {
//     await this.loadPromise;
//   }
//   async waitForStart() {
//     if (this.audioContext.state === 'suspended') {
//       await this.audioContext.resume();
//     }
//   }
// }
