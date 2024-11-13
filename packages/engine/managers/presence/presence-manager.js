import { jwtDecode } from 'jwt-decode';
import { zbencode, zbdecode } from '../../../zjs/encoding.mjs';
import { presenceEndpointUrl } from '../../endpoints.js';
import { UPDATE_METHODS } from '../../../presence/public/update-types.js';
import { RelationshipsManager } from '../relationships/relationships-manager.js';
import { SupabaseClient } from '../../clients/supabase-client.js';
import { makePromise, makeId } from '../../util.js';

export class PresenceStatus {
  #userId;
  #status; // 'active', 'online', 'offline': Indicating whether both you and the friend have joined a chat room simultaneously, or indicating whether the user is onine or offline

  constructor(userId, status) {
    this.#userId = userId;
    this.#status = status;
  }

  // Getter of userId
  get userId() {
    return this.#userId;
  }

  // Getter of status
  get status() {
    return this.#status;
  }

  // Setter of status
  set status(status) {
    this.#status = status;
  }
}

const maxConnectionRetries = 5;
export class PresenceManager extends EventTarget {
  #presenceStatuses = new Map();
  #connectionRetires = 0;
  #localRoomId = null;
  constructor({ supabaseClient, playersManager, autoLogin = true } = {}) {
    super();

    this.supabaseClient = supabaseClient;
    this.playersManager = playersManager;

    this.calls = new Map();

    autoLogin && this.#listenForLogin();

    // globalThis.presenceManager = this;
  }

  get presenceStatuses() {
    return new Map(this.#presenceStatuses);
  }

  #listenForLogin() {
    // initial connect
    const jwt = this.supabaseClient.getSupabaseJwt();
    jwt && this.connect(jwt);

    // listen for change
    this.supabaseClient.addEventListener('profileupdate', (e) => {
      const { profile } = e.data;

      if (profile.loaded) {
        const jwt = this.supabaseClient.getSupabaseJwt();
        this.connect(jwt);
      }
    });
  }

  async connect(jwt, { signal = null } = {}) {
    this.playerId =
      this.supabaseClient?.profile?.sessionUserId ?? jwtDecode(jwt).id;
    if (!this.playerId && jwtDecode(jwt).role !== 'authenticated') {
      console.warn('failed to get player id from jwt', {jwt});
      debugger;
      throw new Error('failed to get player id from jwt: ' + JSON.stringify(jwt));
    }

    const ws = new WebSocket(
      `${presenceEndpointUrl}/api/presence/websocket?jwt=${jwt}`,
    );
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      this.#connectionRetires = 0;
      console.log('websocket for presence connected', ws.readyState);
    };
    ws.onerror = (e) => {
      console.error('websocket for presence error', e);
    };
    ws.onclose = (e) => {
      console.log('websocket for presence closed, retrying connection', e);
      this.#connectionRetires++;
      if (this.#connectionRetires < maxConnectionRetries) {
        this.connect(jwt);
      }
    };
    const message = (e) => {
      const uint8Array = new Uint8Array(e.data);
      const j = zbdecode(uint8Array);
      const { method, args } = j;
      // console.log('got presence server message', {
      //   method,
      //   args,
      // });
      switch (method) {
        case UPDATE_METHODS.PRESENCE_INIT: {
          let [statuses] = args;
          console.log('got presence initial statuses', {
            args,
            statuses,
          });

          // Saving friend's statuses as presence status
          for (const { id, online } of statuses) {
            this.#presenceStatuses.set(
              id,
              new PresenceStatus(id, online ? 'online' : 'offline'),
            );
          }

          this.dispatchEvent(
            new MessageEvent('statusesupdate', {
              data: {
                statuses,
              },
            }),
          );
          break;
        }
        case UPDATE_METHODS.PRESENCE_JOIN: {
          // console.log('got presence join', args);
          const [userId] = args;
          const presenceStatus = this.#presenceStatuses.get(userId);

          if (presenceStatus) {
            // Change friend's status as online
            presenceStatus.status = 'online';
            this.dispatchEvent(
              new MessageEvent('statusupdate', {
                data: {
                  statuses: [presenceStatus],
                },
              }),
            );
          } else {
            console.warn('got presence join for unknown user', userId);
          }
          break;
        }
        case UPDATE_METHODS.PRESENCE_LEAVE: {
          // console.log('got presence leave', args);
          const [userId] = args;
          const presenceStatus = this.#presenceStatuses.get(userId);
          console.log("user went offline:", userId);

          if (presenceStatus) {
            // Change friend's status as offline
            presenceStatus.status = 'offline';
            this.dispatchEvent(
              new MessageEvent('statusupdate', {
                data: {
                  statuses: [presenceStatus],
                },
              }),
            );

            const tempRoomId = this.#generateRoomId(userId);
            this.dispatchEvent(
              new MessageEvent('call_request_end', {
                data: {
                  roomId: tempRoomId,
                  is_local: this.#localRoomId !== null,
                },
              }),
            );
            if (this.#localRoomId === tempRoomId) {
              this.#localRoomId = null;
            }
          } else {
            console.warn('got presence leave for unknown user', userId);
          }
          break;
        }
        case UPDATE_METHODS.CALL_REQUEST_START: {
          const roomId = args[2];
          const requesterId = args[0];

          const localPlayer = this.playersManager.getLocalPlayer();
          const playerSpec = localPlayer.playerSpec;

          this.ws.send(
            zbencode({
              method: UPDATE_METHODS.CALL_ANSWER,
              args: [this.playerId, requesterId, roomId, playerSpec]
            })
          );

          this.dispatchEvent(
            new MessageEvent('call_request_start', {
              data: {
                roomId: roomId,
              },
            }),
          );

          break;
        }
        case UPDATE_METHODS.CALL_REQUEST_END: {
          // TODO Update presence status based on the call end
          const [srcPlayerId, dstPlayerId, roomId] = args;

          this.dispatchEvent(
            new MessageEvent('call_request_end', {
              data: {
                roomId: roomId,
                is_local: this.#localRoomId !== null,
              },
            }),
          );
          if (this.#localRoomId === roomId) {
            this.#localRoomId = null;
          }
          break;
        }
        case UPDATE_METHODS.CALL_ANSWER: {
          const [srcPlayerId, dstPlayerId, roomId, playerSpec] = args;
          const index = this.#getIndexByRoomId(roomId);

          this.dispatchEvent(
            new MessageEvent('call_request_player_spec', {
              data: {
                roomId: roomId,
                index,
                playerSpec,
              },
            })
          );
          break;
        }
      }
    };
    ws.addEventListener('message', message);

    const abort = () => {
      this.dispatchEvent(new ErrorEvent('error'));
    };
    signal && signal.addEventListener('abort', abort);

    await new Promise((accept, reject) => {
      const open = () => {
        accept(ws);
        cleanup();
      };
      ws.addEventListener('open', open);
      const error = (err) => {
        reject(err);
        cleanup();
      };
      ws.addEventListener('error', error);

      const cleanup = () => {
        ws.removeEventListener('open', open);
        ws.removeEventListener('error', error);
        signal && signal.removeEventListener('abort', abort);
      };
    });
    this.ws = ws;
  }
   
  requestCall(playerId, firstCall = true) {
    const roomId = this.#generateRoomId(playerId);
    if (this.#localRoomId === roomId) {
      return;
    }
    const presenceStatus = this.#presenceStatuses.get(playerId);
    this.#localRoomId = roomId;

    if (firstCall) {
      this.ws.send(
        zbencode({
          method: UPDATE_METHODS.CALL_REQUEST_START,
          args: [this.playerId, playerId, roomId],
        }),
      );
    }

    if (presenceStatus) {
      // Change interlocutor's status as active
      presenceStatus.status = 'active';
      this.dispatchEvent(
        new MessageEvent('statusupdate', {
          data: {
            statuses: [presenceStatus],
          },
        }),
      );
    }

    const index = this.#getIndexByRoomId(roomId);
    return { roomId, index };
  }

  disconnectFromCall = (roomId) => {
    if (!roomId) {
      return;
    }

    this.#localRoomId = null;
    const remotePlayerId = this.#getDstPlayerId(roomId);
    const presenceStatus = this.#presenceStatuses.get(remotePlayerId);
    if (presenceStatus) {
      // Change interlocutor's status as online
      presenceStatus.status = 'online';
      this.dispatchEvent(
        new MessageEvent('statusupdate', {
          data: {
            statuses: [presenceStatus],
          },
        }),
      );
    }
  }

  /**
   * Generate room id
   * @param {*} dstPlayerId
   * @returns
   */
  #generateRoomId(dstPlayerId) {
    const roomId = [this.playerId, dstPlayerId]
      .sort((a, b) => a.localeCompare(b))
      .join(':');

    return roomId;
  }

  #getDstPlayerId(roomId) {
    const [playerId1, playerId2] = roomId.split(':');
    // Assuming this.playerId is available in your class
    const dstPlayerId = playerId1 === this.playerId ? playerId2 : playerId1;
    return dstPlayerId;
  }

  /**
   * Get player index from room id
   * @param {*} roomId
   * @returns
   */
  #getIndexByRoomId(roomId) {
    return roomId.startsWith(this.playerId + ':') ? 0 : 1;
  }
}

//

const initializeTests = async () => {
  const getAnonJwt = async () => {
    const id = crypto.randomUUID();
    // curl -X POST -H "Content-Type: application/json" -d '{"id": "lol"}' https://metamask.upstreet.ai/anon
    const res = await fetch('https://metamask.upstreet.ai/anon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    });
    const jwtString = await res.json();
    return jwtString;
  };
  const [jwt1, jwt2] = await Promise.all([getAnonJwt(), getAnonJwt()]);
  const userId1 = jwtDecode(jwt1).id;
  const userId2 = jwtDecode(jwt2).id;
  console.log('got jwts', {
    jwt1,
    jwt2,
    userId1,
    userId2,
  });

  // connect relationship managers
  const supabaseClient1 = new SupabaseClient({
    jwt: jwt1,
  });
  const relationshipsManager1 = new RelationshipsManager({
    supabaseClient: supabaseClient1,
    autoLogin: false,
  });
  const supabaseClient2 = new SupabaseClient({
    jwt: jwt2,
  });
  const relationshipsManager2 = new RelationshipsManager({
    supabaseClient: supabaseClient2,
    autoLogin: false,
  });
  await Promise.all([
    relationshipsManager1.connect(userId1),
    relationshipsManager2.connect(userId2),
  ]);
  console.log('connected relationship managers', {
    relationshipsManager1,
    relationshipsManager2,
  });

  // connect presence managers
  const presenceManager1 = new PresenceManager({
    supabaseClient: supabaseClient1,
    autoLogin: false,
  });
  const presenceManager2 = new PresenceManager(
    {
      supabaseClient: supabaseClient2,
      autoLogin: false,
    },
    {
      listen: false,
    },
  );
  await Promise.all([
    presenceManager1.connect(jwt1),
    presenceManager2.connect(jwt2),
  ]);

  return {
    relationshipsManager1,
    relationshipsManager2,
    presenceManager1,
    presenceManager2,
    userId1,
    userId2,
    jwt1,
    jwt2,
  };
};
globalThis.testPresence = async () => {
  const {
    relationshipsManager1,
    relationshipsManager2,
    presenceManager1,
    presenceManager2,
    jwt1,
    jwt2,
    userId1,
    userId2,
  } = await initializeTests();

  const friend1 = await relationshipsManager1.addFriend(userId2);
  console.log('added friend', {
    friend1,
    userId1,
    userId2,
  });

  const friend2 = await relationshipsManager2.acceptFriend(userId1);
  console.log('accepted friend', {
    friend2,
  });

  const blocked = await relationshipsManager1.block(userId2);
  console.log('blocked', {
    blocked,
  });

  const removed = await relationshipsManager1.removeFriend(userId2);
  console.log('removed', {
    removed,
  });
};
globalThis.testPresence2 = async () => {
  const {
    relationshipsManager1,
    relationshipsManager2,
    presenceManager1,
    presenceManager2,
    jwt1,
    jwt2,
    userId1,
    userId2,
  } = await initializeTests();

  const friend1 = await relationshipsManager1.addFriend(userId2);
  const friend2 = await relationshipsManager2.acceptFriend(userId1);

  console.log('call request 1');
  await Promise.all([
    presenceManager1.requestCall(userId2),
    new Promise((accept, reject) => {
      const callrequest = (e) => {
        console.log('call request 2', e);
        const {
          // callId,
          accept: accept2,
          reject: reject2,
        } = e.data;

        accept2();
        accept();

        console.log('call request 3');

        presenceManager2.removeEventListener('callrequest', callrequest);
      };
      presenceManager2.addEventListener('callrequest', callrequest);
    }),
  ]);
  console.log('call request 4');

  const blocked = await relationshipsManager1.block(userId2);
  console.log('blocked', {
    blocked,
  });

  const removed = await relationshipsManager1.removeFriend(userId2);
  console.log('removed', {
    removed,
  });
};
