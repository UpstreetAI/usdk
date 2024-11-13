import {
  RuntimeMessage,
} from '../../runtime-message.ts';
import StoryMessageRuntime from './story-message-runtime.jsx';

export class StoryMessage extends RuntimeMessage {
  constructor(opts) {
    super({
      ...opts,
      messageRuntime: StoryMessageRuntime,
    });
  }
  static fromRaw(raw) {
    return new StoryMessage({
      raw,
    });
  }
}