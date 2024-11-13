import {
  StoryCompleter,
} from './story-completer.js';
import {Conversation} from '../../conversation.ts';
import {
  getCompleterGeneratorFn,
} from '../../util.js';

export class StoryConversation extends Conversation {
  constructor({
    engine,
  }) {
    super({
      engine,
    });

    //

    this.startPreload();
    this.startComplete(
      getCompleterGeneratorFn(() => {
        let messages = this.chatManager.getMessages().slice();

        const pendingMessages = this.getPendingMessages();
        messages = messages.concat(pendingMessages);

        const completer = new StoryCompleter({
          messages,
          loreManager: engine.loreManager,
          // critic: this.#currentCritic,
          // engine: this.engine,
        });
        return completer;
      })
    );

    this.executeOne();
  }
}