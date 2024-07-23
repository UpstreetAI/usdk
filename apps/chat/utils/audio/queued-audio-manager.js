import { QueueAudioPlayer } from './audio-player';
import { AudioQueue } from './audio-queue';

export class QueuedAudioManager extends EventTarget {
  constructor(audioContext, ensureAudioStream, createAgentAudioSonner,clearAgentAudioSonner) {
    super();
    this.audioPlayer = new QueueAudioPlayer(audioContext, ensureAudioStream,this);
    this.audioQueue = new AudioQueue(this.audioPlayer);

    this.audioPlayer.addEventListener('playingaudio',createAgentAudioSonner)
    this.audioPlayer.addEventListener('audiofinish',clearAgentAudioSonner)
  }

  enqueue(event) {
    this.audioQueue.enqueue(event);
  }

  handleAudioEnd(streamId) {
    this.audioQueue.handleAudioEnd(streamId);
  }

  skipAudioStream(){
    this.audioPlayer.skipAudioStream();
  }
}
  