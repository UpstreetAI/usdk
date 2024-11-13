import * as THREE from 'three';

//

export class SfxManager {
  constructor({
    engineRenderer,
    audioManager,
    sounds,
  }) {
    if (!sounds || !audioManager || !engineRenderer) {
      console.warn('missing args', {
        sounds,
        audioManager,
        engineRenderer,
      });
      debugger;
    }

    this.engineRenderer = engineRenderer;
    this.audioManager = audioManager;
    this.sounds = sounds;
    this.sourceNodes = new Set();

    this.audioListener = new THREE.AudioListener();
    engineRenderer.camera.add(this.audioListener);
  }

  playSpatialAudioBuffer(audioBufferSourceNode, object, {
    volume = 1,
  } = {}) {
    const sourceNode = new THREE.PositionalAudio(this.audioListener);

    sourceNode.setNodeSource(audioBufferSourceNode);
    sourceNode.isPlaying = true;

    // XXX this should theoertically work, but it results in no audio
    // therefore we do not support volume setting for now
    /* if (volume !== 1) {
      const audioContext = this.audioManager.audioContext;
      const filterNode = audioContext.createGain();
      sourceNode.setFilter(filterNode);
    } */

    object.add(sourceNode);
    sourceNode.updateMatrixWorld();
    this.sourceNodes.add(sourceNode);

    audioBufferSourceNode.onended = () => {
      object.remove(sourceNode);
      this.sourceNodes.delete(sourceNode);
    };
  }

  getSoundSpec(audioSpec) {
    const {offset, duration} = audioSpec;
    const buffer = this.sounds.getSoundFileAudioBuffer();
    return {
      buffer,
      offset,
      duration,
    };
  }
  playSpatialSound(audioSpec, object, opts) {
    const {
      buffer,
      offset,
      duration,
    } = this.getSoundSpec(audioSpec);

    const {audioContext} = this.audioManager;
    const audioBufferSourceNode = audioContext.createBufferSource();
    audioBufferSourceNode.buffer = buffer;
    audioBufferSourceNode.start(0, offset, duration);

    this.playSpatialAudioBuffer(audioBufferSourceNode, object, opts);

    return audioBufferSourceNode;
  }
  playSpatialSoundName(name, object, opts) {
    const soundFiles = this.sounds.getSoundFiles();
    const snds = soundFiles[name];
    if (snds) {
      const sound = snds[Math.floor(Math.random() * snds.length)];
      this.playSpatialSound(sound, object, opts);
      return true;
    } else {
      debugger;
      return false;
    }
  }

  update() {
    this.audioListener.updateMatrixWorld();

    for (const sourceNode of this.sourceNodes) {
      sourceNode.updateMatrixWorld();
    }
  }
}