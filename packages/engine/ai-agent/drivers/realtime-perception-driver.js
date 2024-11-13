import {
  imageCaptioning,
  imageSegmentation,
  imageSegmentationMulti,
} from '../../vqa.js';
import {
  aiProxyHost,
} from '../../endpoints.js';

//

const abortError = new Error('aborted');
abortError.isAbortError = true;

//

const closeStream = stream => {
  stream.getTracks().forEach(track => {
    track.stop();
  });
};

//

export class RealtimePerceptionDriver extends EventTarget {
  constructor() {
    super();

    this.frame = null;

    this.source = null;
    this.metadata = null;

    this.enabled = true;
  }

  start() {
    const _frame = () => {
      this.frame = requestAnimationFrame(_frame);

      this.dispatchEvent(new MessageEvent('frame'));
    };
    this.frame = requestAnimationFrame(_frame);
  }

  async startStream({
    source,
    metadata,
  }) {
    this.source = source;
    this.metadata = metadata;

    let live = true;
    const stopstream = () => {
      live = false;
      this.removeEventListener('stopstream', stopstream);
    };
    this.addEventListener('stopstream', stopstream);

    let videoConstraints;
    if (typeof source.deviceId === 'string') { // media device source
      videoConstraints = {
        deviceId: source.deviceId,
      };
    } else if (typeof source.id === 'string') { // chrome media source
      videoConstraints = {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id,
        },
      };
    } else {
      throw new Error('invalid source');
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: videoConstraints,
    });
    if (live) {
      this.stream = stream;

      let frame;
      stream.destroy = () => {
        closeStream(stream);
        cancelAnimationFrame(frame);
      };

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const video = document.createElement('video');
      let videoMetadataLoaded = false;
      video.addEventListener('loadedmetadata', function() {
        videoMetadataLoaded = true;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      });
    
      // console.log('start frame loop');
      const _frameLoop = () => {
        // console.log('request video 1');
        frame = video.requestVideoFrameCallback(async (now, metadata) => {
          if (this.enabled && videoMetadataLoaded) {
            // console.log('request video 2');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const blob = await new Promise((accept, reject) => {
              canvas.toBlob(accept, 'image/jpeg', 0.8);
            });
            // console.log('request video 3');
            if (!live) return;

            const {
              imageBitmap,
              ocr,
              seg,
              ic,
              timings,
            } = await this.blobCb(blob);
            // console.log('request video 4', live);
            if (!live) return;
    
            this.dispatchEvent(new MessageEvent('perceptionupdate', {
              data: {
                imageBitmap,
                ocr,
                seg,
                ic,
                timings,
              },
            }));
            // console.log('request video 5');
          }

          _frameLoop();
          // console.log('request video 6');
        });
      };
      _frameLoop();

      const _playVideo = () => {
        video.srcObject = stream;
        video.muted = true;
        video.play();
      };
      _playVideo();

      this.dispatchEvent(new MessageEvent('startstream'));
    } else {
      closeStream(stream);
    }
  }
  stopStream() {
    if (this.stream) {
      this.stream.destroy();
      this.stream = null;

      this.source = null;
      this.metadata = null;
    }

    this.dispatchEvent(new MessageEvent('stopstream'));
  }

  setSource(source) {
    this.source = source;
  }

  async blobCb(blob) {
    const imageBitmapPromise = createImageBitmap(blob);

    const startTime = performance.now();
    const timings = {
      ocr: Infinity,
      seg: Infinity,
      ic: Infinity,
    };
    const setTiming = (key, timeDiff) => {
      timings[key] = timeDiff
    };

    const [
      imageBitmap,
      ocr,
      seg,
      ic,
    ] = await Promise.all([
      // (async () => {
      //   const imageBitmap = await imageBitmapPromise;
      //   this.dispatchEvent(new MessageEvent('perceptionframe', {
      //     data: {
      //       imageBitmap,
      //     },
      //   }));
      // })(),
      imageBitmapPromise,

      (async () => {
        const res = await fetch(`https://${aiProxyHost}/api/ocr`, {
          method: 'POST',
          body: blob,
        });

        const ocrString = await res.text();

        const endTime = performance.now();
        const timeDiff = endTime - startTime;
        setTiming('ocr', timeDiff);

        // setOcrString(ocrString);
        // this.dispatchEvent(new MessageEvent('statupdate', {
        //   data: {
        //     key: 'ocr',
        //     value: ocrString,
        //   },
        // }));
        return ocrString;
      })(),

      (async () => {
        const segmentCaptions = await imageSegmentationMulti({
          blob,
          imageBitmapPromise,
        });

        const endTime = performance.now();
        const timeDiff = endTime - startTime;
        setTiming('seg', timeDiff);

        return segmentCaptions;
      })(),

      (async () => {
        try {
          // const imageCaptionString = await imageCaptioning(blob);

          // const endTime = performance.now();
          // const timeDiff = endTime - startTime;
          // setTiming('ic', timeDiff);

          // return imageCaptionString;

          // XXX should be covered by attention
          const imageCaptionString = '';
          return imageCaptionString;
        } catch (err) {
          console.warn(err);
        }
      })(),
    ]);

    return {
      imageBitmap,
      ocr,
      seg,
      ic,
      timings,
    };
  }
}