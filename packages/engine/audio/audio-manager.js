import * as THREE from 'three';
// import {getAudioContext} from 'wsrtc/ws-audio-context.js';
import microphoneWorklet from './microphone-worklet.js?worker';
import wsInjectWorklet from './ws-inject-worklet.js?worker';
import wsInputWorklet from './ws-input-worklet.js?worker';
import wsOutputWorklet from './ws-output-worklet.js?worker';
// import beatDetectionWorklet from './beat-detection-worklet.js?worker';

//

const getFnUrl = (fn) => fn.toString().match(/"(.+?)"/)[1];

//

const microphoneWorkletUrl = getFnUrl(microphoneWorklet);
const wsInjectWorkletUrl = getFnUrl(wsInjectWorklet);
const wsInputWorkletUrl = getFnUrl(wsInputWorklet);
const wsOutputWorkletUrl = getFnUrl(wsOutputWorklet);
// const beatDetectionWorkletUrl = getFnUrl(beatDetectionWorklet);
export const loadWorkletModules = async (audioContext) => {
  const audioWorkletPromises = [
    audioContext.audioWorklet.addModule(microphoneWorkletUrl),
    audioContext.audioWorklet.addModule(wsInjectWorkletUrl),
    audioContext.audioWorklet.addModule(wsInputWorkletUrl),
    audioContext.audioWorklet.addModule(wsOutputWorkletUrl),
    // audioContext.audioWorklet.addModule(beatDetectionWorkletUrl),
  ];

  await Promise.all(audioWorkletPromises);
};

//

export class AudioManager {
  constructor({ audioContext }) {
    this.audioContext = audioContext;
    // gain node
    this.audioContext.gain = this.audioContext.createGain();
    // split in two
    this.audioContext.splitter = this.audioContext.createChannelSplitter(2);
    // create media stream destination node
    this.audioContext.mediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    // connect
    this.audioContext.gain.connect(this.audioContext.splitter);
    this.audioContext.splitter.connect(this.audioContext.destination, 0);
    this.audioContext.splitter.connect(
      this.audioContext.mediaStreamDestination,
      1
    );

    //

    this.audioListener = new THREE.AudioListener();
    this.positionalAudio = new THREE.PositionalAudio(this.audioListener);

    //

    this.loadPromise = loadWorkletModules(this.audioContext);
  }


  setAudioSession(sessionType = 'auto') {
    if (navigator.audioSession?.type) {
      navigator.audioSession.type = sessionType;
    }
  }

  async resume() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
  update() {
    this.audioListener.updateMatrixWorld();
  }

  setVolume(volume) {
    this.audioContext.gain.gain.value = volume;
  }

  getInput() {
    return this.audioContext.gain;
  }

  captureStream() {
    return this.audioContext.mediaStreamDestination.stream;
  }

  playBuffer(audioBuffer) {
    const sourceNode = this.audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(this.audioContext.gain);
    sourceNode.start();
  }

  playSpatialBuffer(audioBuffer, object) {
    const sourceNode = this.audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(this.audioContext.gain);
    sourceNode.start();
  }

  async enumerateDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices;
  }

  async getUserMedia(opts) {
    return await navigator.mediaDevices.getUserMedia(opts);
  }

  async waitForLoad() {
    await this.loadPromise;
  }
  async waitForStart() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}
