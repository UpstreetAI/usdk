// note: assumes mono
export const makeOpusStream = (mediaStream, {
  audioContext,
}) => {
  const {sampleRate} = audioContext;
  const numberOfChannels = 1;
  const bitrate = 128000; // 128 kbps

  // create nodes
  const mediaSteamNode = audioContext.createMediaStreamSource(mediaStream);
  const audioWorkletNode = new AudioWorkletNode(
    audioContext,
    'ws-input-worklet'
  );
  const transformStream = new TransformStream();
  const transformStreamWriter = transformStream.writable.getWriter();

  // create the encoder
  let uint8ArrayBufferCache = null;
  const ensureBuffer = (requiredByteLength) => {
    if (uint8ArrayBufferCache === null || uint8ArrayBufferCache.byteLength < requiredByteLength) {
      uint8ArrayBufferCache = new Uint8Array(requiredByteLength);
    }
    return uint8ArrayBufferCache;
  };
  const encoder = new AudioEncoder({
    output: (encodedAudioChunk, decoderConfig) => {
      // ensure buffer
      const buffer = ensureBuffer(encodedAudioChunk.byteLength);
      // copy to buffer
      encodedAudioChunk.copyTo(buffer);
      // write buffer to stream
      transformStreamWriter.write(
        buffer.slice(0, encodedAudioChunk.byteLength)
      );
    },
    error: err => {
      console.warn(err.stack);
    },
  });
  encoder.configure({
    codec: 'opus',
    numberOfChannels,
    sampleRate,
    bitrate,
  });

  // read the output of the worklet and push it to the encoder
  let timestamp = 0;
  audioWorkletNode.port.onmessage = event => {
    const {
      data,
    } = event;

    // if (!(data instanceof Float32Array)) {
    //   debugger;
    //   console.warn('invalid data', {data});
    //   throw new Error('invalid data type');
    // }

    // create AudioData from the buffer
    const audioData = new AudioData({
      format: 'f32',
      numberOfChannels,
      numberOfFrames: data.length,
      sampleRate,
      data,
      timestamp,
    });
    encoder.encode(audioData);

    // advance the timestamp based on the sample rate and number of frames
    timestamp += data.length / sampleRate;
  };

  // connect
  mediaSteamNode.connect(audioWorkletNode);
  audioWorkletNode.connect(audioContext.destination);

  // return output stream
  const outputStream = transformStream.readable;
  outputStream.close = () => {
    // disconnect the processing pipeline
    mediaSteamNode.disconnect();
    audioWorkletNode.disconnect();
    // end the stream
    transformStreamWriter.close();
  };
  return outputStream;
}