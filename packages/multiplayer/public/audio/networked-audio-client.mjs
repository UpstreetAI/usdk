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

  addAudioSource(playableAudioStream) {
    // console.log('add audio source', new Error().stack);

    const {
      id,
      // output,
      type,
    } = playableAudioStream;
    if (typeof id !== 'string') {
      throw new Error('audio source id must be a string');
    }
    if (typeof type !== 'string') {
      throw new Error('audio source type must be a string');
    }

    // const id = crypto.randomUUID();

    // console.log('send start', [
    //   this.playerId,
    //   id,
    //   type,
    // ]);
    this.ws.send(zbencode({
      method: UPDATE_METHODS.AUDIO_START,
      args: [
        this.playerId,
        id,
        type,
      ],
    }));

    // pump the reader
    let live = true;
    const finishPromise = (async () => {
      for await (const chunk of playableAudioStream) {
        if (live) {
          // console.log('send audio', [
          //   this.playerId,
          //   id,
          //   chunk,
          // ]);
          this.ws.send(zbencode({
            method: UPDATE_METHODS.AUDIO,
            args: [
              this.playerId,
              id,
              chunk,
            ],
          }));
        } else {
          break;
        }
      }
    })();

    // add the cleanup fn
    const cleanup = () => {
      live = false;

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

    return {
      waitForFinish: () => finishPromise,
    };
  }

  removeAudioSource(readableAudioStream) {
    // console.log('remove audio source');
    const cleanupFn = this.audioSourceCleanups.get(readableAudioStream.id);
    cleanupFn();
    this.audioSourceCleanups.delete(readableAudioStream.id);
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
    } else if (method === UPDATE_METHODS.AUDIO_START) {
      const [
        playerId,
        streamId,
        type,
      ] = args;

      this.dispatchEvent(new MessageEvent('audiostart', {
        data: {
          playerId,
          streamId,
          type,
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