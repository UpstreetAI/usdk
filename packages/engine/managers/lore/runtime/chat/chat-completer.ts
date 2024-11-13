import { ChatMessage } from './chat-message.ts';
import { fetchChatCompletion } from '../../../../utils/fetch.js';
import { aiModelModes } from '../../../story/story-manager.js';
import {
  EventStreamParseStream,
  modelTypeContentFns,
} from '../../../../ai-agent/utils/event-stream-parser.js';

import { Completion } from '../../completion.js';
import type { AiMessage, CompletionGeneratorOptions } from './chat-types.ts';
import type { LoreManager } from '../../lore-manager.js';
import { sayCommandType } from '../../util.js';
import { isWithinTokenLimit } from 'gpt-tokenizer/model/gpt-3.5-turbo';

export class ChatCompleter extends EventTarget {
  constructor({
    messages = [],
    loreManager,
  }: {
    messages: AiMessage[];
    loreManager: LoreManager;
  }) {
    super();

    if (!loreManager) {
      console.error('missing arguments', {
        loreManager,
      });
    }

    this.#messages = messages;
    this.#loreManager = loreManager;
    this.bindMessage = this.bindMessage.bind(this);
  }

  #messages: AiMessage[];
  #loreManager: LoreManager;

  #getInstructions() {
    const lore = this.#loreManager.getLore();
    const actors = lore.getActors();
    const characterActors = actors.filter((a) => a.type === 'character');
    const objectActors = actors.filter((a) => a.type === 'object');

    let locationNames = lore.getLocations().map((l) => l.name);
    if (locationNames.length === 0) {
      locationNames = ['Location name'];
    }
    let characterNames = characterActors.map((a) => a.spec.name);
    if (characterNames.length === 0) {
      characterNames = ['Firstname Lastname'];
    }
    let objectNames = objectActors.map((a) => a.spec.name);
    if (objectNames.length === 0) {
      objectNames = ['Character or prop name'];
    }

    const playerCharacter = characterActors.find(a => a.object.isLocalPlayer);
    const npcCharacter = characterActors.find((a) => !a.object.isLocalPlayer);

    return [
      `Roleplay with the user. You are a virtual character in a futuristic video game, in which the user chats with an AI.`,
      `Your character's name: ${npcCharacter?.spec?.name}`,
      `Your character's bio: ${npcCharacter?.spec?.bio}`,
      `User's name: ${playerCharacter?.spec?.name}`,
      `User's bio: ${playerCharacter?.spec?.bio}`,
      `Reply as if you were your character. You must always stay in character. If you cannot reply for any reason, simply reply with a joke or another entertaining line.`,
      `Use made-up futuristic slang in your responses to give the conversation flavor.`,
    ].join('\n');
  }

  getMessages() {
    return this.#messages;
  }

  getTokenCount(message: AiMessage[]) {
    return isWithinTokenLimit(message);
  }

  #getContextMessages() {
    const tokensThreshold = 2048;
    const messages: AiMessage[] = [];

    const instructionMessage = {
      role: 'system',
      content: this.#getInstructions(),
    };
    messages.push(instructionMessage);

    let currentTokens = this.getTokenCount(messages);

    const userAssistantMessages = this.#messages.slice().reverse();

    for (const userAssistantMessage of userAssistantMessages) {
      const { role, content } = userAssistantMessage.getRaw();
      const message = {
        role,
        content,
      };
      const messageToken = this.getTokenCount([message]);
      if (currentTokens + messageToken < tokensThreshold) {
        currentTokens += messageToken;
        messages.splice(1, 0, message);
      } else {
        break;
      }
    }

    return messages;
  }

  bindMessage(message) {
    const lore = this.#loreManager.getLore();
    if (message.bindLore(lore)) {
      return true;
    } else {
      console.warn('could not bind lore to message', {
        content: message.getContent(),
        message,
        lore,
      });
      return false;
    }
  }

  async *complete({
    prompt = '',
    model = aiModelModes[1],
    limit = 1,
    signal,
  }: CompletionGeneratorOptions) {
    if (typeof limit !== 'number') {
      console.warn(`Invalid limit`, limit);
    }
    if (limit === 0) {
      console.warn(
        `Cannot generate limit = 0 messages. This call is pointless and probably a bug. Returning early.`,
      );
      return;
    }

    const match = model.match(/^(.+?):/);
    if (!match) {
      throw new Error('invalid model: ' + JSON.stringify(model));
    }
    const modelType = match[1];

    const messages = [...this.#getContextMessages()];

    if (prompt) {
      if (typeof prompt === 'string') {
        prompt = {
          role: 'user',
          content: prompt,
        };
      }
      messages.push(prompt);
    }

    const completion = new Completion({
      promptMessages: messages,
    });
    this.dispatchEvent(
      new MessageEvent('completion', {
        data: {
          completion,
        },
      }),
    );

    async function* internalGenerator(bindMessage) {
      // pipe the body to the event stream parser
      const contentFn = modelTypeContentFns[modelType];
      const eventStreamParser = new EventStreamParseStream({
        contentFn,
      });
      res.body.pipeThrough(eventStreamParser);

      // read the event stream
      let result = '';
      const parseMessages = (opts) => {
        const messages: ChatMessage[] = [];

        const r = !opts.final ? /^([\s\S]+?)\n/ : /^([\s\S]+)$/;

        let match;
        while ((match = result.match(r))) {
          const line = match[1];
          const remainderString = result.slice(match[0].length);

          // create raw message
          const id = crypto.randomUUID();
          const role = 'assistant';
          const content = line.trim();
          const rawMessage = {
            id,
            role,
            content,
            created_at: new Date().toISOString(),
            type: sayCommandType,
          };
          // create message
          const message = ChatMessage.fromRaw(rawMessage);
          // bind message

          if (bindMessage(message)) {
            messages.push(message);
            completion.addMessage(rawMessage);
          } else {
            // binding failed, so short circuit
            return {
              done: true,
              messages,
            };
          }

          result = remainderString;
        }

        return {
          done: false,
          messages,
        };
      };

      // main read loop
      const reader = eventStreamParser.readable.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (signal?.aborted) return;
        if (done) {
          break;
        } else {
          result += value;
          const { done: done2, messages: messages2 } = parseMessages({
            final: false,
          });
          for (const message of messages2) {
            yield message;
            if (signal?.aborted) return;
          }
          if (done2) {
            break;
          }
        }
      }

      // parse final messages
      if (result) {
        const { messages } = parseMessages({
          final: true,
        });
        for (const message of messages) {
          yield message;
          if (signal?.aborted) return;
        }
      }
    }

    const res = await fetchChatCompletion({
      model,
      messages,
      stream: true,
      signal,
    });
    if (res?.ok) {
      // pump the internal generator
      const generatorFn = internalGenerator(this.bindMessage);
      for (let i = 0; i < limit; i++) {
        const { done, value: message } = await generatorFn.next();
        if (!done) {
          yield message;
          if (signal?.aborted) return;
        } else {
          break;
        }
      }
    } else {
      const text = await res.text();

      console.error('fetchChatCompletion failed', {
        status: res.status,
        url: res.url,
        text,
      });
    }

    completion.end();
  }
}
