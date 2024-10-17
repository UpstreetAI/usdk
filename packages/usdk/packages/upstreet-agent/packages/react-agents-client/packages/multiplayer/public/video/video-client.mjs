import {VideoOutput} from './video-classes.mjs';
import { makeId, makePromise } from '../util.mjs';

const type ='image/webp';
const quality = 0.;

export const createVideoSource = ({
  mediaStream,
}) => {
  // get the video stream
  const video = document.createElement('video');
  video.srcObject = mediaStream;
  // video.style.cssText = `\
  //   position: fixed;
  //   bottom: 0;
  //   right: 0;
  //   width: 300px;
  //   z-index: 1000;
  // `;
  // document.body.appendChild(video);

  // use the canvas 2d api to read the media stream and stream out the data and end events
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let live = true;
  let videoFrameRequestId;
  const handleVideoFrame = async () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // const data = imageData.data;
    // console.log('write data', data);
    // output.write(data); // Dispatch data event to the output

    // get the canvas blob
    const blob = await new Promise((accept, reject) => {
      canvas.toBlob(accept, type, quality);
    });
    // get the array buffer
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    output.write(uint8Array);

    videoFrameRequestId = video.requestVideoFrameCallback(handleVideoFrame);
  };

  video.addEventListener('loadedmetadata', () => {
    if (live) {
      console.log('got video loadedmetadata event', video.videoWidth, video.videoHeight);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.play();
      videoFrameRequestId = video.requestVideoFrameCallback(handleVideoFrame);
    }
  });

  const output = new VideoOutput();

  const id = makeId(10);

  return {
    id,
    output,
    mediaStream,
    close() {
      live = false;
      if (videoFrameRequestId) {
        video.cancelVideoFrameCallback(videoFrameRequestId);
      }
      output.end();
    },
  };
};