import { resample } from './resample.mjs';
import { formatSamples } from './format.mjs';
import { QueueManager } from 'queue-manager';

export const makeMp3Decoder = (MPEGDecoder) =>
class WsMp3Decoder extends EventTarget {
  constructor() {
    super();

    const mp3decoder = new MPEGDecoder();
    const queueManager = new QueueManager();

    this.handlemessage = e => {
      const {
        sampleRate: globalSampleRate,
        format,
      } = e.data;
      this.handlemessage = async e => {
        await queueManager.waitForTurn(async () => {
          // console.log('wait for decoder ready 1');
          await mp3decoder.ready;
          // console.log('wait for decoder ready 2');

          if (e.data) {
            const mp3Data = e.data;
            // console.log('decode data 1', mp3Data);
            const result = mp3decoder.decode(mp3Data);
            // console.log('decode data 2', result);
            const {channelData, samplesDecoded, sampleRate: localSampleRate} = result;
            if (samplesDecoded > 0) {
              const firstChannelData = channelData[0];
              // console.log('resampling 1');
              const resampled = localSampleRate === globalSampleRate ?
                firstChannelData
              :
                resample(firstChannelData, localSampleRate, globalSampleRate);
              // console.log('resampling 2', format);
              const formatted = formatSamples(resampled, format, 'f32');
              // console.log('formatted', formatted);
              this.dispatchMessage({
                data: formatted,
                timestamp: 0, // fake
                duration: 1, // fake
              }, [formatted.buffer]);
            }
          } else {
            // const data = mp3decoder.flush();
            // this.dispatchMessage({
            //   data,
            //   timestamp: 0, // fake
            //   duration: 1, // fake
            // }, [data.buffer]);
      
            this.dispatchMessage({
              data: null,
              timestamp: 0, // fake
              duration: 1, // fake
            });
      
            this.close();
          }
        });
      };
    };
  }
  postMessage(data, transferList) {
    // console.log('mp3 decoder postMessage', data);
    this.handlemessage({
      data,
      transferList,
    });
  }
  dispatchMessage(data, transferList) {
    this.dispatchEvent(new MessageEvent('message', {
      data,
      transferList,
    }));
  }
  close() {
    this.dispatchEvent(new MessageEvent('close', {
      data: null,
    }));
  }
}