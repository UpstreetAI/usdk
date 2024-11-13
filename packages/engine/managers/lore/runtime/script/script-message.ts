import { RuntimeMessage } from '../../runtime-message.js';
import ScriptMessageRuntime from '../chat/chat-message-runtime.tsx';

export class ScriptMessage extends RuntimeMessage {
  constructor(opts) {
    super({
      ...opts,
      messageRuntime: ScriptMessageRuntime,
    });
  }
  static fromRaw(raw) {
    return new ScriptMessage({
      raw,
    });
  }
}
