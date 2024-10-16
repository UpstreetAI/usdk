export const getAudioDataBuffer = audioData => {
  let channelData;
  if (audioData.copyTo) { // new api
    channelData = new Float32Array(audioData.numberOfFrames);
    audioData.copyTo(channelData, {
      planeIndex: 0,
      frameCount: audioData.numberOfFrames,
    });
  } else { // old api
    channelData = audioData.buffer.getChannelData(0);
  }
  return channelData;
};
export const getEncodedAudioChunkBuffer = encodedAudioChunk => {
  if (encodedAudioChunk.copyTo) { // new api
    const data = new Uint8Array(encodedAudioChunk.byteLength);
    encodedAudioChunk.copyTo(data);
    return data;
  } else { // old api
    return new Uint8Array(encodedAudioChunk.data);
  }
};