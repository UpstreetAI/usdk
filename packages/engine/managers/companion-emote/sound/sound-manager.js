import { Sounds } from "../../../sounds";
import { AudioManager } from "../../../audio/audio-manager";

export default class SoundManager {
  constructor() {
    const audioContext = new AudioContext();
    const audioManager = new AudioManager({
      audioContext,
    });
    this.sounds = new Sounds({
      audioManager,
      ioBus: null,
    });
  }
  addEmotion(emotion) {
    let soundFileName = null;
    switch (emotion) {
      case 'angry': {
        soundFileName = 'angry';
        break;
      }
      case 'confused': {
        soundFileName = 'confused';
        break;
      }
      case 'cry': {
        soundFileName = 'cry';
        break;
      }
      case 'embarrassed': {
        soundFileName = 'embarrassed';
        break;
      }
      case 'excited': {
        soundFileName = 'excited';
        break;
      }
      case 'typing': 
      case 'searching': {
        soundFileName = 'keyboard';
        break;
      }
      case 'sad': {
        soundFileName = 'sad';
        break;
      }
      case 'shocked': {
        soundFileName = 'alert';
        break;
      }
      case 'surprise': {
        soundFileName = 'surprise';
        break;
      }
      case 'victory': {
        soundFileName = 'victory';
        break;
      }
      default: {
        break;
      }
    }
    if (soundFileName) {
      const soundFiles = this.sounds.getSoundFiles();
      const regex = new RegExp(`^companionEmote/${soundFileName}.wav$`);
      const candidateAudio = soundFiles.companionEmote.find((f) => regex.test(f.name));
      if (candidateAudio) {
        this.sounds.playSound(candidateAudio);
      }
    }
    
  }
}