import {UPDATE_METHODS} from '../update-types.mjs';
import {handlesMethod} from './networked-video-client-utils.mjs';
import {parseUpdateObject, makeId} from '../util.mjs';
import {zbencode} from '../../../zjs/encoding.mjs';

export class NetworkedVideoClient extends EventTarget {
  constructor({
    playerId = makeId(),
  }) {
    super();

    this.playerId = playerId;

    this.ws = null;
  }

  sendVideoFrame(frame) {
    const buffer = zbencode({
      method: UPDATE_METHODS.VIDEO,
      args: [
        this.playerId,
        frame,
      ],
    });
    this.ws.send(buffer);
  }

  async connect(ws) {
    this.ws = ws;

    const _waitForOpen = () => new Promise((resolve, reject) => {
      resolve = (resolve => () => {
        resolve();
        _cleanup();
      })(resolve);
      reject = (reject => () => {
        reject();
        _cleanup();
      })(reject);

      this.ws.addEventListener('open', resolve);
      this.ws.addEventListener('error', reject);

      const _cleanup = () => {
        this.ws.removeEventListener('open', resolve);
        this.ws.removeEventListener('error', reject);
      };
    });
    await _waitForOpen();

    // console.log('irc listen');
    this.ws.addEventListener('message', e => {
      // console.log('got irc data', e.data);
      if (e?.data?.byteLength > 0) {
        const updateBuffer = e.data;
        const uint8Array = new Uint8Array(updateBuffer);
        const updateObject = parseUpdateObject(uint8Array);

        const {method /*, args */} = updateObject;
        if (handlesMethod(method)) {
          this.handleUpdateObject(updateObject);
        }
      } else {
        // debugger;
      }
    });
  }
  handleUpdateObject(updateObject) {
    const {method, args} = updateObject;
    // console.log('audio update object', {method, args});
    if (method === UPDATE_METHODS.VIDEO) {
      // console.log('got irc chat', {method, args});
      const [
        playerId,
        frame,
      ] = args;

      this.dispatchEvent(new MessageEvent('video', {
        data: {
          playerId,
          frame,
        },
      }));
    } else {
      console.warn('unhandled video method', updateObject);
    }
  }
}