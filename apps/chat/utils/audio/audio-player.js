export class QueueAudioPlayer extends EventTarget {
    constructor(audioContext, ensureAudioStream, queuedAudioManager) {
      super();
      this.audioContext = audioContext;
      this.ensureAudioStream = ensureAudioStream;
      this.isPlaying = false;
      this.currentStream = null;
      this.parent = queuedAudioManager;
    }
  
    isCurrentStream(streamId) {
      return this.currentStream && this.currentStream.streamId === streamId;
    }
  
    writeToCurrentStream(data) {
      if (this.currentStream) {
        this.currentStream.write(data);
      }
    }
  
    setCurrentStream(playerId, streamId, mimeType) {
      this.currentStream = this.ensureAudioStream(playerId, streamId, this.audioContext, mimeType);
    }
  
    async playCurrentStream(bufferedData, hasAudioStreamEnded) {
      this.isPlaying = true;

      this.dispatchEvent(new MessageEvent('playingaudio', {
        data: {
          queuedAudioManager: this.parent,
          playerId: this.currentStream.playerId,
        },
      }));

      if (bufferedData) {
        for (const dataChunk of bufferedData) {
          this.currentStream.write(dataChunk);
        }
      }

      if (hasAudioStreamEnded){
        this.endCurrentStream();
      }else{
        await this.waitForAudioToEnd();
      }
      this.isPlaying = false;
    }
  
    waitForAudioToEnd() {
      return new Promise((resolve) => {
        this.currentStream.outputNode.port.onmessage = (event) => {
          const { method } = event.data;
          if (method === 'finish') {
            this.dispatchEvent(new MessageEvent('audiofinish'))
            this.cleanupCurrentStream();
            resolve();
          }
        };
      });
    }
  
    cleanupCurrentStream() {
      if (this.currentStream) {
        this.currentStream.outputNode.disconnect();
        this.currentStream.outputNode.port.onmessage = null;
        this.currentStream = null;
      }
    }
  
    endCurrentStream() {
      if (this.currentStream) {
        this.currentStream.end(); 
      }
    }

    skipAudioStream() {
      if (this.currentStream){
        this.currentStream.close();
      }
    }
  }
  