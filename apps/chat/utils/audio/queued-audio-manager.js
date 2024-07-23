import { QueueAudioPlayer } from './audio-player';
import { AudioQueue } from './audio-queue';

export class QueuedAudioManager {
  constructor(audioContext, ensureAudioStream) {
    this.audioPlayer = new QueueAudioPlayer(audioContext, ensureAudioStream);
    this.audioQueue = new AudioQueue(this.audioPlayer);
  }

  enqueue(event) {
    this.audioQueue.enqueue(event);
  }

  handleAudioEnd(streamId) {
    this.audioQueue.handleAudioEnd(streamId);
  }
}
  