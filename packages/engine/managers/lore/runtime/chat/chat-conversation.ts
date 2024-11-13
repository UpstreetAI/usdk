import { ChatCompleter } from './chat-completer.ts';
import { Conversation } from '../../conversation.js';
import { getCompleterGeneratorFn } from '../../util.js';
import type { ChatManager } from '../../../chat/chat-manager.js';
import type { LoreManager } from '../../lore-manager.js';
import type { EmbodimentManager } from '../../../embodiment/embodiment-manager.js';
import type { QueueManager } from '../../../queue/queue-manager.js';
import type { StoryManager } from '../../../story/story-manager.js';
import type { AudioManager } from '../../../../audio/audio-manager.js';

export class ChatConversation extends Conversation {
  constructor({
    chatManager,
    loreManager,
    storyManager,
    embodimentManager,
    voiceQueueManager,
    audioManager,
  }: {
    chatManager: ChatManager;
    loreManager: LoreManager;
    storyManager: StoryManager;
    embodimentManager: EmbodimentManager;
    voiceQueueManager: QueueManager;
    audioManager: AudioManager;
  }) {
    super({
      loreManager,
      storyManager,
      embodimentManager,
      voiceQueueManager,
      audioManager,
      messageCompleteBufferLength: 0,
      messagePreloadBufferLength: 1,
    });

    this.startPreload();
    this.startComplete(
      getCompleterGeneratorFn(() => {
        console.log('begin chat generation...');

        let messages = chatManager.getMessages().slice();

        const pendingMessages = this.getPendingMessages();
        messages = messages.concat(pendingMessages);

        const completer = new ChatCompleter({
          messages,
          loreManager,
        });

        return completer;
      }),
    );
  }
}
