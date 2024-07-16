import * as Y from 'yjs'
import {UPDATE_METHODS} from "./update-types.mjs";
import {
  // createWs,
  // makePromise,
  // makeId,
  parseUpdateObject,
  serializeMessage,
} from './util.mjs';

export class NetworkedCrdtClient extends EventTarget {
  static handlesMethod(method) {
    return [UPDATE_METHODS.CRDT_UPDATE].includes(method);
  }

  doc = null;
  constructor({
    initialUpdate = null,
  } = {}) {
    super();

    this.doc = new Y.Doc();
    if (initialUpdate) {
      Y.applyUpdateV2(this.doc, initialUpdate, 'constructor');
    }
    this.doc.on('updateV2', (update, origin, doc) => {
      this.dispatchEvent(new MessageEvent('update', {
        data: {
          update,
          origin,
          doc,
        },
      }));
    });
  }
  getDoc() {
    return this.doc;
  }
  update(uint8Array, origin) {
    Y.applyUpdateV2(this.doc, uint8Array, origin);
  }
  getStateAsUpdate() {
    return Y.encodeStateAsUpdateV2(this.doc);
  }
  getInitialUpdateMessage() {
    const update = this.getStateAsUpdate();
    return new MessageEvent('crdtUpdate', {
      data: {
        update,
      },
    });
  }

  // client connects to server
  async connect(ws) {
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
    const _waitForInitialImport = async () => {
      await new Promise((resolve, reject) => {
        const initialMessage = e => {
          // console.log('got message', e.data);
          if (e.data instanceof ArrayBuffer && e.data.byteLength > 0) {
            const updateBuffer = e.data;
            const uint8Array = new Uint8Array(updateBuffer);
            const updateObject = parseUpdateObject(uint8Array);

            const {method, args} = updateObject;
            if (method === UPDATE_METHODS.CRDT_UPDATE) {
              const [update] = args;
              this.update(update);

              resolve();

              ws.removeEventListener('message', initialMessage);
            }
          }
        };
        ws.addEventListener('message', initialMessage);
      });
    };
    await Promise.all([
      _waitForOpen(),
      _waitForInitialImport(),
    ]);

    // console.log('irc listen');
    ws.addEventListener('message', e => {
      // if some other listener hasn't consumed the message already
      if (e?.data?.byteLength > 0) {
        const updateBuffer = e.data;
        // console.log('irc data', e.data);
        const uint8Array = new Uint8Array(updateBuffer);
        const updateObject = parseUpdateObject(uint8Array);

        const {method, args} = updateObject;
        if (method === UPDATE_METHODS.CRDT_UPDATE) {
          const [update] = args;
          this.update(update);
        }
      } else {
        // debugger;
      }
    });

    this.addEventListener('update', e => {
      const {update, origin, doc} = e.data;
      const m = new MessageEvent('crdtUpdate', {
        data: {
          update,
        },
      });
      ws.send(serializeMessage(m));
    });
  }
}