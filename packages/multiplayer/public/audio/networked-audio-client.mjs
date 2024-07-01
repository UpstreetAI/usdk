import {UPDATE_METHODS} from '../update-types.mjs';
import {parseUpdateObject, makeId} from '../util.mjs';
import {zbencode} from '../../../zjs/encoding.mjs';
import {handlesMethod} from './networked-audio-client-utils.mjs';

export class NetworkedAudioClient extends EventTarget {
  constructor({
    playerId = makeId(),
    // audioManager,
  }) {
    super();

    this.playerId = playerId;
    // this.audioManager = audioManager;

    this.ws = null;

    this.audioSourceCleanups = new Map(); // playerId:streamId -> function
    // this.outputAudioStreams = new Map(); // playerId:streamId -> stream
  }

  addAudioSource(audioSource) {
    // console.log('add audio source', new Error().stack);

    // add the cleanup fn
    const {
      id,
      output,
    } = audioSource;
    const cleanup = () => {
      output.removeEventListener('data', data);

      // console.log('send audio end', [
      //   this.playerId,
      //   id,
      // ]);
      this.ws.send(zbencode({
        method: UPDATE_METHODS.AUDIO_END,
        args: [
          this.playerId,
          id,
        ],
      }));
    };
    this.audioSourceCleanups.set(id, cleanup);

    const data = e => {
      // console.log('send data', [
      //   this.playerId,
      //   id,
      //   e.data,
      // ]);
      this.ws.send(zbencode({
        method: UPDATE_METHODS.AUDIO,
        args: [
          this.playerId,
          id,
          e.data,
        ],
      }));
    };
    output.addEventListener('data', data);
  }

  removeAudioSource(microphoneSource) {
    // console.log('remove audio source');
    this.audioSourceCleanups.get(microphoneSource.id)();
    this.audioSourceCleanups.delete(microphoneSource.id);
  }

  async connect(ws) {
    this.ws = ws;

    await new Promise((resolve, reject) => {
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
    if (method === UPDATE_METHODS.AUDIO) {
      // console.log('got irc chat', {method, args});
      const [
        playerId,
        streamId,
        data,
      ] = args;

      this.dispatchEvent(new MessageEvent('audio', {
        data: {
          playerId,
          streamId,
          data,
        },
      }));
    } else if (method === UPDATE_METHODS.AUDIO_END) {
      const [
        playerId,
        streamId,
      ] = args;

      this.dispatchEvent(new MessageEvent('audioend', {
        data: {
          playerId,
          streamId,
        },
      }));
    } else if (method === UPDATE_METHODS.JOIN) {
      const [playerId] = args;
      this.playerIds.push(playerId);
      this.dispatchEvent(new MessageEvent('join', {
        data: {
          playerId,
        },
      }));
    } else if (method === UPDATE_METHODS.LEAVE) {
      const [playerId] = args;
      const index = this.playerIds.indexOf(playerId);
      this.playerIds.splice(index, 1);
      this.dispatchEvent(new MessageEvent('leave', {
        data: {
          playerId,
        },
      }));
    } else {
      console.warn('unhandled irc method', updateObject);
      debugger;
    }
  }
}