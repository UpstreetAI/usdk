export class AudioQueue {
  constructor(audioPlayer) {
    this.audioPlayer = audioPlayer;
    this.queue = [];
    this.streamDataBuffers = new Map();
    this.streamEndEvents = new Set();
  }

  enqueue(event) {
    const { streamId, data } = event;

    if (this.audioPlayer.isCurrentStream(streamId)) {
      this.audioPlayer.writeToCurrentStream(data);
    } else {
      if (!this.streamDataBuffers.has(streamId)) {
        this.streamDataBuffers.set(streamId, []);
      }
      this.streamDataBuffers.get(streamId).push(data);

      const isEnqueued = this.queue.some((queuedEvent) => queuedEvent.streamId === streamId);
      if (!isEnqueued) {
        this.queue.push(event);
        this.playNext();
      }
    }
  }

  handleAudioEnd(streamId) {
    if (this.audioPlayer.isCurrentStream(streamId)){
      this.audioPlayer.endCurrentStream();
    } else if (this.streamDataBuffers.has(streamId)) {
      this.streamEndEvents.add(streamId);
    } else if (this.audioPlayer.isCurrentStream(streamId)) {
      this.audioPlayer.endCurrentStream();
    }
  }

  async playNext() {
    if (this.audioPlayer.isPlaying) {
      return;
    }

    const event = this.queue.shift();
    if (event) {
      const { playerId, streamId, mimeType } = event;
      this.audioPlayer.setCurrentStream(playerId, streamId, mimeType);

      const bufferedData = this.streamDataBuffers.get(streamId);
      const hasAudioStreamEnded = this.streamEndEvents.has(streamId);
      await this.audioPlayer.playCurrentStream(bufferedData,hasAudioStreamEnded);

      this.streamDataBuffers.delete(streamId);

      if (this.streamEndEvents.has(streamId)) {
        this.streamEndEvents.delete(streamId);
        this.audioPlayer.endCurrentStream();
      }

      this.playNext();
    }
  }
}
