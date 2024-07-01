import { UPDATE_METHODS } from "./update-types.mjs";
import {
  // createWs,
  // makePromise,
  // makeId,
  parseUpdateObject,
  serializeMessage,
} from './util.mjs';

class LockRealm {
  constructor({
    lockName,
  }) {
    this.lockName = lockName;
    this.queue = [];
    this.currentLockedSession = null;
  }
  lock({
    session,
  }) {
    if (!this.currentLockedSession) {
      this.currentLockedSession = session;

      // reply to the session that we are locked
      const m = new MessageEvent('lockResponse', {
        data: {
          playerId: session.playerId,
          lockName: this.lockName,
        },
      });
      session.webSocket.send(serializeMessage(m));
    } else {
      this.queue.push(session);
    }
  }
  unlock({
    session,
  }) {
    if (this.currentLockedSession === session) {
      this.currentLockedSession = null;

      if (this.queue.length > 0) {
        const nextSession = this.queue.shift();
        this.lock({
          session: nextSession,
        });
      }
    } else {
      this.queue = this.queue.filter(s => s !== session);
    }
  }
}

export class NetworkedLockClient extends EventTarget {
  static handlesMethod(method) {
    return [
      UPDATE_METHODS.LOCK_REQUEST, // client -> server
      UPDATE_METHODS.LOCK_RESPONSE, // server -> client
      UPDATE_METHODS.LOCK_RELEASE, // client -> server
    ].includes(method);
  }

  ws = null; // client
  locks = new Map(); // server; string -> LockRealm
  constructor() {
    super();
  }

  // client request lock
  async lock(lockName, {
    signal,
  }) {
    // send the lock
    const m = new MessageEvent('lockRequest', {
      data: {
        lockName,
      },
    });
    this.ws.send(serializeMessage(m));

    // when the signal aborts,send the release
    signal.addEventListener('abort', (e) => {
      const m = new MessageEvent('lockRelease', {
        data: {
          lockName,
        },
      });
      this.ws.send(serializeMessage(m));
    });

    // wait for the unlock
    await new Promise((resolve, reject) => {
      const onmessage = (e) => {
        if (e.data instanceof ArrayBuffer && e.data.byteLength > 0) {
          const updateBuffer = e.data;
          const uint8Array = new Uint8Array(updateBuffer);
          const updateObject = parseUpdateObject(uint8Array);

          const {method, args} = updateObject;
          if (method === UPDATE_METHODS.LOCK_RESPONSE) {
            const [_lockName] = args;
            if (_lockName === lockName) {
              resolve();
              cleanup();
            }
          }
        }
      };
      this.ws.addEventListener('message', onmessage);

      // const onabort = (e) => {
      //   resolve();
      //   cleanup();
      // };
      // signal.addEventListener('abort', onabort);

      const cleanup = () => {
        this.ws.removeEventListener('message', onmessage);
        // signal.removeEventListener('abort', onabort);
      };
    });
  }

  // server force unlock on disconnect
  ensureLockRealm() {
    let lockRealm = this.locks.get(lockName);
    if (!lockRealm) {
      lockRealm = new LockRealm();
      this.locks.set(lockName, lockRealm);
    }
    return lockRealm;
  }
  serverLock(session, lockName) {
    const lockRealm = this.ensureLockRealm(lockName);
    lockRealm.lock({
      session,
    });
  }
  serverUnlock(session, lockName) {
    const lockRealm = this.ensureLockRealm(lockName);
    lockRealm.unlock({
      session,
    });
  }
  serverUnlockSession(session) {
    for (const lockRealm of Array.from(this.locks)) {
      lockRealm.unlock({
        session,
      });
    }
  }

  // client connects to server
  async connect(ws) {
    this.ws = ws;

    const _waitForOpen = async () => {
      await new Promise((resolve, reject) => {
        resolve = (resolve => () => {
          resolve();
          _cleanup();
        })(resolve);
        reject = (reject => () => {
          reject();
          _cleanup();
        })(reject);

        ws.addEventListener('open', resolve);
        ws.addEventListener('error', reject);

        const _cleanup = () => {
          ws.removeEventListener('open', resolve);
          ws.removeEventListener('error', reject);
        };
      });
    };
    await _waitForOpen();
  }

  // server handles message
  handle(e) {
    const { type } = e;
    const { session, lockName } = e.data;
    if (!playerId || !lockName) {
      throw new Error('lock client message missing args: ' + JSON.stringify(e.data));
    }
    switch (type) {
      case 'lockRequest': {
        this.serverLock(session, lockName);
        break;
      }
      case 'lockResponse': {
        throw new Error('server should not receive lockResponse');
      }
      case 'lockRelease': {
        this.serverUnlock(session, lockName);
        break;
      }
      default: {
        throw new Error('unrecognized lock client message type: ' + type);
      }
    }
  }
}