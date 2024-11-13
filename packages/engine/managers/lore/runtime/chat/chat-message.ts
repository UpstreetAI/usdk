import { RuntimeMessage } from '../../runtime-message.js';
import ChatMessageRuntime from './chat-message-runtime.tsx';

export class ChatMessage extends RuntimeMessage {
  constructor(opts) {
    super({
      ...opts,
      messageRuntime: ChatMessageRuntime,
    });
  }
  static fromRaw(raw) {
    return new ChatMessage({
      raw,
    });
  }
}
