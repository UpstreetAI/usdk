export class AudioQueue {
  constructor(audioPlayer) {
    this.audioPlayer = audioPlayer;
    this.queue = [];
    this.streamDataBuffers = new Map();
    this.streamEndEvents = new Set();
    this.isProcessing = false;
  }

  enqueue(event) {
    const { streamId, data } = event;

    if (this.audioPlayer.isCurrentStream(streamId)) {
      this.audioPlayer.writeToCurrentStream(data);
    } else {
      if (!this.streamDataBuffers.has(streamId)) {
        this.streamDataBuffers.set(streamId, []);
        this.queue.push(event);
      }
      this.streamDataBuffers.get(streamId).push(data);
    }

    if (!this.isProcessing && !this.audioPlayer.isPlaying) {
      this.processQueue();
    }
  }

  handleAudioEnd(streamId) {
    if (this.audioPlayer.isCurrentStream(streamId)) {
      this.audioPlayer.endCurrentStream();
    } else {
      this.streamEndEvents.add(streamId);
    }
    
    if (!this.isProcessing && !this.audioPlayer.isPlaying) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.audioPlayer.isPlaying) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const event = this.queue.shift();
      const { playerId, streamId, mimeType } = event;

      this.audioPlayer.setCurrentStream(playerId, streamId, mimeType);

      const bufferedData = this.streamDataBuffers.get(streamId);
      const hasAudioStreamEnded = this.streamEndEvents.has(streamId);

      await this.audioPlayer.playCurrentStream(bufferedData, hasAudioStreamEnded);

      this.streamDataBuffers.delete(streamId);
      this.streamEndEvents.delete(streamId);
    }

    this.isProcessing = false;
  }
}