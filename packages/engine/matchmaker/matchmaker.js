import {
  zbencode,
  zbdecode,
} from '../../zjs/encoding.mjs';
import {
  UPDATE_METHODS,
} from '../../matchmaker/public/update-types.js';
import {
  matchmakerEndpointUrl,
} from '../endpoints.js';
import {
  makeId,
} from '../util.js';

export class Matchmaker {
  constructor({
    endpointUrl,
    playerId,
  }) {
    this.endpointUrl = endpointUrl;
    this.playerId = playerId;
  }
  async matchmake({
    timeout = Infinity,
    signal = null,
  } = {}) {
    const ws = await this.connect({
      signal,
    });

    const peerPlayerId = await new Promise((accept, reject) => {
      let playerIds = [];

      let lockedPlayerId = '';
      let lockTimeout = null;
      const update = async () => {
        if (!lockedPlayerId && playerIds.length > 0) {
          const srcPlayerId = this.playerId;
          const dstPlayerId = playerIds.splice(Math.floor(Math.random() * playerIds.length), 1)[0];
          const step0 = 0;
          const uint8Array = zbencode({
            method: UPDATE_METHODS.MESSAGE,
            args: [
              srcPlayerId,
              dstPlayerId,
              step0,
            ],
          });
          ws.send(uint8Array);

          lockedPlayerId = dstPlayerId;

          lockTimeout = setTimeout(() => {
            lockedPlayerId = '';
            update();
          }, 1000 + Math.random() * 1000);
        }
      };
      const cleanup = () => {
        clearTimeout(lockTimeout);
        clearTimeout(matchmakeTimeout);
        signal && signal.removeEventListener('abort', abort);
        ws.removeEventListener('message', message);
        ws.removeEventListener('error', error);
        ws.removeEventListener('close', close);
        // if the websocket is still open, close it
        // if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        // }
      };

      const abort = () => {
        ws.dispatchEvent(new ErrorEvent('error'));
      };
      signal && signal.addEventListener('abort', abort);

      let matchmakeTimeout = null;
      if (isFinite(timeout)) {
        matchmakeTimeout = setTimeout(() => {
          reject(new Error('matchmake timeout'));
          cleanup();
        }, timeout);
      }

      const message = e => {
        const arrayBuffer = e.data;
        // console.log('got message data 1', arrayBuffer);
        const uint8Array = new Uint8Array(arrayBuffer);
        // console.log('got message data 2', uint8Array);
        const j = zbdecode(uint8Array);
        // console.log('got message data 3', j);
        // console.log('matchmaker message', j);
        const {method, args} = j;
        switch (method) {
          case UPDATE_METHODS.NETWORK_INIT: {
            const localPlayerIds = args[0];
            for (const a of localPlayerIds) {
              if (a !== this.playerId) {
                playerIds.push(a);
              }
            }
            update();
            break;
          }
          case UPDATE_METHODS.JOIN: {
            // console.log('got join', args);
            const playerId = args[0];
            playerIds.push(playerId);
            update();
            break;
          }
          case UPDATE_METHODS.LEAVE: {
            // console.log('got leave', args);
            const playerId = args[0];
            const index = playerIds.indexOf(playerId);
            if (index !== -1) {
              playerIds.splice(index, 1);
            } /* else {
              console.warn('player id not found for leave message', playerId);
            } */
            break;
          }
          case UPDATE_METHODS.MESSAGE: {
            const [
              srcPlayerId,
              dstPlayerId, // should be me
              step,
            ] = args;
            if (dstPlayerId === this.playerId) {
              if (step === 0) {
                if (!lockedPlayerId || lockedPlayerId === srcPlayerId) {
                  // reply with step 1
                  const step1 = 1;
                  const uint8Array = zbencode({
                    method: UPDATE_METHODS.MESSAGE,
                    args: [
                      this.playerId,
                      srcPlayerId,
                      step1,
                    ],
                  });
                  ws.send(uint8Array);

                  lockedPlayerId = srcPlayerId;
                }
              } else if (step === 1) {
                if (lockedPlayerId === srcPlayerId) {
                  // reply with step 2
                  const step2 = 2;
                  const uint8Array = zbencode({
                    method: UPDATE_METHODS.MESSAGE,
                    args: [
                      this.playerId,
                      srcPlayerId,
                      step2,
                    ],
                  });
                  ws.send(uint8Array);

                  // accept the connection
                  accept(srcPlayerId);

                  // reply with sync message
                  // the server will echo it back, indicating it is safe to disconnect
                  const uint8Array2 = zbencode({
                    method: UPDATE_METHODS.SYNC,
                    args: [],
                  });
                  ws.send(uint8Array2);
                } else {
                  console.warn('got message with wrong player id', [
                    srcPlayerId,
                    lockedPlayerId,
                  ]);
                }
              } else if (step === 2) {
                if (lockedPlayerId === srcPlayerId) {
                  // accept the connection
                  accept(srcPlayerId);

                  // the peer already disconnected, so disconnect as well
                  cleanup();
                } else {
                  console.warn('got message with wrong player id', [
                    srcPlayerId,
                    lockedPlayerId,
                  ]);
                }
              } else {
                console.warn('got message with wrong step', {
                  step,
                });
              }
            } else {
              console.warn('got message with wrong player id', [
                srcPlayerId,
                this.playerId,
              ]);
            }
            break;
          }
          case UPDATE_METHODS.SYNC: {
            // we are synchronized, so close the connection
            cleanup();
            break;
          }
          default: {
            console.warn('unhandled matchmaker method', method);
            break;
          }
        }
      };
      ws.addEventListener('message', message);
      const error = err => {
        reject(err);
        cleanup();
      };
      ws.addEventListener('error', error);

      const close = e => {
        reject(new Error('matchmake websocket closed unexpectedly'));
        cleanup();
      };
      ws.addEventListener('close', close);
    });

    const roomId = [
      this.playerId,
      peerPlayerId,
    ].sort((a, b) => a.localeCompare(b)).join(':');
    const index = roomId.startsWith(this.playerId + ':') ? 0 : 1;
    return {
      roomId,
      index,
    };
  }
  connect({
    signal = null,
  } = {}) {
    return new Promise((accept, reject) => {
      const ws = new WebSocket(`${this.endpointUrl}/api/matches/chat/websocket?playerId=${this.playerId}`);
      ws.binaryType = 'arraybuffer';
      const open = () => {
        accept(ws);
        cleanup();
      };
      ws.addEventListener('open', open);
      const error = err => {
        reject(err);
        cleanup();
      };
      ws.addEventListener('error', error);

      const abort = () => {
        ws.dispatchEvent(new ErrorEvent('error'));
      };
      signal && signal.addEventListener('abort', abort);

      const cleanup = () => {
        ws.removeEventListener('open', open);
        ws.removeEventListener('error', error);
        signal && signal.removeEventListener('abort', abort);
      };
    });
  }
  static create(userID) {
    return new Matchmaker({
      endpointUrl: matchmakerEndpointUrl,
      playerId: userID,
    });
  }
}