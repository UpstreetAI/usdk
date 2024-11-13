import * as THREE from 'three';
import { unmuteAudioContext } from './utils/unmuteAudioContext';

const sampleRate = 48000;

let audioContext = null;
let unmuteAudioContextHandle = null;

export const getAudioContext = () => {
  if (audioContext === null) {
    audioContext = new AudioContext({
      sampleRate,
    });

    unmuteAudioContextHandle = unmuteAudioContext(audioContext, false, false);

    THREE.AudioContext.setContext(audioContext);
  }
  return audioContext;
};

export const disposeUnmuteAudioContextHandle = () => {
  if (unmuteAudioContextHandle === null) return;

  unmuteAudioContextHandle.dispose();
  unmuteAudioContextHandle = null;
};
