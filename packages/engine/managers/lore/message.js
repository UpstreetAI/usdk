// import {
//   Fountain,
// } from 'fountain-js';

// import {
//   Parser,
// } from '../../ai-agent/utils/avatarml-stream-parser.js';
// import {
//   jsonParse,
// } from '../../util.js';

//

export class Message extends EventTarget {
  constructor(opts) {
    super();

    let {
      raw,
    } = opts;
    if (!raw) {
      console.warn('missing raw messsage', opts);
      debugger;
      throw new Error('missing raw message');
    }
    if (!(raw?.role && raw?.content)) {
      console.warn('invalid raw message', {
        opts,
        raw,
        name: raw?.name,
        content: raw?.content,
      });
      debugger;
      throw new Error('invalid raw message');
    }

    this.#raw = raw;
  }
  #raw;

  static fromRaw(raw) {
    return new Message({
      raw,
    });
  }

  getRaw() {
    return this.#raw;
  }
  getRole() {
    return this.#raw.role;
  }
  getUserId() {
    return this.#raw.user_id;
  }
  getContent() {
    return this.#raw.content;
  }

  setCreatedAt(createdAt) {
    this.#raw.created_at = createdAt;
  }
  setId(id) {
    this.#raw.id = id;
  }
}