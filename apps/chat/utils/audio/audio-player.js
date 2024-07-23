export class QueueAudioPlayer {
    constructor(audioContext, ensureAudioStream) {
      this.audioContext = audioContext;
      this.ensureAudioStream = ensureAudioStream;
      this.isPlaying = false;
      this.currentStream = null;
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
  }
  