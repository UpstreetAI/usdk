import React from 'react';
import classnames from 'classnames';
import {
  sayCommandType,
  normalizeName,
  fakePlayMessage,
  friendInviteCommandType,
  paymentCommandType,
  rvcCommandType,
  chatInviteCommandType,
  joinWorldCommandType,
  joinAdventureCommandType,
  openFriendListCommandType,
  addFriendCommandType,
  waitForMsCommandType,
  restartConversationAfterCommandType,
  txt2ImageCommandType,
  loadImageFromUrlCommandType,
  openPosthogSurveyCommandType,
} from '../../util.js';
import { advanceModes } from '../../../story/story-manager.js';
import { LocalPlayer } from '../../../../character-controller.js';
import { isFinished } from '../../../../util.js';
import { getAction } from './action-mapper.js';
import { generateImage } from '../../../../generate-image.js';

function parseMessage(raw) {
  let { role } = raw;
  const { content } = raw;

  if (role === 'system') {
    role = 'user';
  }
  const name = role;
  const text = content;
  if (raw.type) {
    return {
      name,
      command: raw.type,
      args: [],
      message: text,
      content: text,
    };
  } else {
    return {
      name,
      command: sayCommandType,
      args: [],
      message: text,

      content: name + '\n' + text,
    };
  }
}

function formatMessage(parsed) {
  const { command } = parsed;
  const messageType = messageTypes[command];
  if (messageType && messageType == sayCommandType) {
    return messageType.format(parsed);
  } else {
    return null;
  }
}

const bindLoreFn = () => (m: any, lore: any) => {
  const bindings = m.getBindings();

  let role = m.getRole();
  if (role === 'system') {
    role = 'user';
  }
  if (role === 'user') {
    const bs = lore.bindFilter((bindable) => {
      return (
        bindable.type === 'character' &&
        bindable.value.object.isLocalPlayer
      );
    });
    if (bs.length > 0) {
      bindings.addBinding(bs[0]);
      return true;
    } else {
      console.warn('failed to bind user');
      return false;
    }
  } else if (role === 'assistant') {
    const bs = lore.bindFilter((bindable) => {
      return (
        bindable.type === 'character' &&
        !bindable.value.object.isLocalPlayer
      );
    });
    if (bs.length > 0) {
      bindings.addBinding(bs[0]);
      return true;
    } else {
      console.warn('failed to bind user');
      return false;
    }
  } else {
    console.warn('unknown role: ' + role);
    return false;
  }
};

const messageTypesArray = [
  {
    name: sayCommandType,
    text({ message }) {
      return message;
    },
    render({ styles, key, message }) {
      return (
        <div className={classnames(styles.chatMessage, styles.say)} key={key}>
          <span className={styles.text}>{message}</span>
        </div>
      );
    },
    bindLore: bindLoreFn(),
    isMajor() {
      return true;
    },
    isBlocking({ message, storyManager }) {
      const { role } = message.getRaw();
      if (role == 'user') {
        return false;
      }

      const advanceModeIndex = storyManager.storyAdvance.getModeIndex();
      return advanceModeIndex < advanceModes.indexOf('Auto');
    },
    async preload({ parsed, bindings, signal }) {
      const [playerBinding] = bindings.getBindings();
      if (playerBinding.type === 'character') {
        const player = playerBinding.value.object;
        const stream = player?.voicer.getStream(parsed.message, {
          signal,
        });
        await stream.waitForLoad();
        return stream;
      } else {
        return null;
      }
    },
    format({ name, message }) {
      console.log('message format', {
        name,
        message,
      });
      return `${normalizeName(name)}\n${message}`;
    },
    async execute({ message, bindings, voiceQueueManager, embodimentManager, multiplayer, audioManager, signal }) {
      console.log(message, bindings, voiceQueueManager, signal);
      console.log('message execute', {
        message,
      });

      const [playerBinding] = bindings.getBindings();

      const player =
        playerBinding.type === 'character' ? playerBinding.value.object : null;

      if (multiplayer) {
        const stream = await message.waitForPreload();
        embodimentManager.dispatchEvent(
          new MessageEvent('chatstream', {
            data: {
              stream,
            },
          })
        );
      } 
      else {
        await audioManager.resume();
        await voiceQueueManager.waitForTurn(async () => {
          const stream = await message.waitForPreload();
          if (player && stream) {
            signal.addEventListener('abort', () => {
              console.log('executing message abort', new Error().stack);
            });

            await player.playStream(stream, {
              onStart: () => {
                console.log('voice stream onStart');
                message.dispatchEvent(
                  new MessageEvent('playStart', { data: {} }),
                );

                const action = getAction(message.getRaw().content);
                const oldEmoteAction = player.actionManager.getActionType('emote');
                oldEmoteAction && player.actionManager.removeAction(oldEmoteAction);
                if (action.animation) {
                  player.voicePack.disableEmoteAudio = true;
                  player.actionManager.addAction(action);
                }
              },
              onEnd: () => {
                console.log('voice stream onEnd');
                message.dispatchEvent(new MessageEvent('playEnd', { data: {} }));
                player.voicePack.disableEmoteAudio = false;
              },
              signal,
            });
          } else {
            await fakePlayMessage(message, {
              signal,
            });
          }
        });
      }
    },
  },
  {
    name: paymentCommandType,
    bindLore: bindLoreFn(),
    async execute({ message, chatManager }) {
      const raw = message.getRaw();
      const amount = parseInt(raw.content);

      chatManager.dispatchEvent(
        new MessageEvent('paymentRequest', {
          data: {
            amount,
          },
        }),
      );
    },
  },
  {
    name: friendInviteCommandType,
    bindLore: bindLoreFn(),
    async execute({ message, chatManager }) {
      const raw = message.getRaw();
      const target = raw.content;

      chatManager.dispatchEvent(
        new MessageEvent('friendInvite', {
          data: {
            target,
          },
        }),
      );
    },
  },
  {
    name: chatInviteCommandType,
    bindLore: bindLoreFn(),
    async execute({ message, chatManager }) {
      const raw = message.getRaw();
      const target = raw.content;

      chatManager.dispatchEvent(
        new MessageEvent('chatInvite', {
          data: {
            target,
          },
        }),
      );
    },
  },
  {
    name: rvcCommandType,
    bindLore: bindLoreFn(),
    async execute({ message, embodimentManager, chatManager }) {
      const raw = message.getRaw();
      const url = raw.content;
      const voiceId = raw.voiceId;
    },
  },
  {
    name: joinWorldCommandType,
    bindLore: bindLoreFn(),
    isBlocking() {
      return false;
    },
    async execute({ message, chatManager }) {
      const raw = message.getRaw();
      const agentId = parseInt(raw.content);
      chatManager.dispatchEvent(
        new MessageEvent('joinWorld', { data: { agentId } }),
      );
    },
  },
  {
    name: waitForMsCommandType,
    bindLore: bindLoreFn(),
    async execute({ message, chatManager }) {
      const raw = message.getRaw();
      const ms = parseInt(raw.content);
      setTimeout(() => {
        chatManager.dispatchEvent(
          new MessageEvent('scriptWaitForMs', {
            data: {},
          }),
        );
      }, ms);
    },
  },
  {
    name: restartConversationAfterCommandType,
    bindLore: bindLoreFn(),
    async execute({ message, chatManager }) {
      chatManager.dispatchEvent(
        new MessageEvent('restartConversation', {
          data: {},
        }),
      );
    },
  },
  {
    name: addFriendCommandType,
    bindLore: bindLoreFn(),
    isBlocking() {
      return false;
    },
    async execute({ message, chatManager }) {
      const { content } = message.getRaw();
      const target = content;
      chatManager.dispatchEvent(
        new MessageEvent('addFriend', {
          data: {
            target,
          },
        }),
      );
    },
  },
  {
    name: joinAdventureCommandType,
    bindLore: bindLoreFn(),
    async execute() {
      console.log('join adventure mode');
      const adventureUrl = '/adventure';
      const currentUrl = window.location.href;
      const url = new URL(adventureUrl, currentUrl);
      window.location.href = url.href;
    },
  },
  {
    name: openFriendListCommandType,
    bindLore: bindLoreFn(),
    async execute({ chatManager }) {
      chatManager.dispatchEvent(
        new MessageEvent('openFriendlist', {
          data: {},
        }),
      );
    },
  },
  {
    name: txt2ImageCommandType,
    bindLore: bindLoreFn(),
    isMajor() {
      return true;
    },
    async preload({ message, signal }) {
      const { content } = message.getRaw();
      const img = await generateImage({prompt: content, negativePrompt: "", steps:25});
      const url = URL.createObjectURL(img);
      return url; 
    },
    async execute({ message, chatManager }) {
      const promiseFinished = await isFinished(message.waitForPreload());
      if (!promiseFinished) {
        chatManager.dispatchEvent(
          new MessageEvent('showLoadingPopup', {
            data: {
              show: true,
            },
          }),
        );
      }

      const result = await message.waitForPreload();
      chatManager.dispatchEvent(
        new MessageEvent('showLoadingPopup', {
          data: {
            show: false,
          },
        }),
      );
      chatManager.dispatchEvent(
        new MessageEvent('txt2Image', {
          data: {
            url: result,
          },
        }),
      );
    },
  },
  {
    name: loadImageFromUrlCommandType,
    bindLore: bindLoreFn(),
    isMajor() {
      return true;
    },
    async preload({ message, signal }) {
      const { content } = message.getRaw();
      const path = `script_images/${content}`;
      const response = await fetch(path, { signal });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      return url;
    },
    async execute({ message, chatManager }) {
      const result = await message.waitForPreload();
      chatManager.dispatchEvent(
        new MessageEvent('txt2Image', {
          data: {
            url: result,
          },
        }),
      );
    },
  },
  {
    name: openPosthogSurveyCommandType,
    bindLore: bindLoreFn(),
    async execute({ message, chatManager }) {
      chatManager.dispatchEvent(
        new MessageEvent('openPosthogSurvey', {
          data: {},
        }),
      );
    },
  },
];

const messageTypes = (() => {
  const result = {};
  for (const messageType of messageTypesArray) {
    result[messageType.name] = messageType;
  }
  return result;
})();

const messageToReact = (m, opts) => {
  const { styles, key = null } = opts ?? {};

  const raw = m.getRaw();
  const type = raw.type;
  if (type !== sayCommandType) {
    return '';
  }

  const parsed = parseMessage(raw);
  if (!parsed) {
    console.warn('failed to parse message', raw);
    return null;
  }
  const { command } = parsed;

  const messageType = messageTypes[command];
  if (messageType) {
    const renderFn = messageType.render;
    return renderFn({
      styles,
      key,
      ...parsed,
    });
  } else {
    console.warn('unknown message type', command, parsed);
    return '';
  }
};

const messageToText = (m) => {
  const raw = m.getRaw();
  const type = raw.type;
  if (type !== sayCommandType) {
    return '';
  }

  if (raw.role === 'assistant') {
    const parsed = parseMessage(raw);
    if (!parsed) {
      console.warn('failed to parse message', raw);
      return '';
    }
    const { command } = parsed;

    const messageType = messageTypes[command];
    if (messageType) {
      if (messageType.text) {
        return messageType.text(parsed);
      } else {
        return messageType.format(parsed);
      }
    } else {
      console.warn('unknown message type', command, parsed);
      return '';
    }
  } else {
    return raw.content;
  }
};

const isBlocking = (m, storyManager) => {
  const raw = m.getRaw();
  const parsed = parseMessage(raw);
  const { command } = parsed;
  const messageType = messageTypes[command];
  if (typeof messageType.isBlocking === 'function') {
    return messageType.isBlocking({ message: m, storyManager });
  } else {
    return true;
  }
};

const isMajor = (m) => {
  const raw = m.getRaw();
  const parsed = parseMessage(raw);
  const { command } = parsed;
  const messageType = messageTypes[command];
  if (typeof messageType.isMajor === 'function') {
    return messageType.isMajor();
  }

  return false;
};

const isAction = (m) => {
  const { type } = m.getRaw();
  if (type !== sayCommandType) {
    return true;
  }

  return false;
};

const bindLore = (message, lore) => {
  const parsed = parseMessage(message.getRaw());
  const { command } = parsed;
  const messageType = messageTypes[command];
  if (messageType) {
    return messageType.bindLore(message, lore);
  } else {
    return false;
  }
};

const preload = async (m, { engine, signal }) => {
  const raw = m.getRaw();
  const parsed = parseMessage(raw);
  const { command } = parsed;
  const bindings = m.getBindings();
  const args = {
    message: m,
    parsed,
    bindings,
    engine,
    signal,
  };

  const messageType = messageTypes[command];
  let preloadResult = null;

  if (messageType && typeof messageType.preload == 'function') {
    if (messageType.preload) {
      console.log('preload 1', {
        messageType,
        args,
      });
      preloadResult = await messageType.preload(args);
      console.log('preload 2', {
        messageType,
        args,
        preloadResult,
      });
    }
  } else {
    console.warn('unknown command to preload', command);
  }

  return preloadResult;
};

const execute = async (
  m,
  { chatManager, embodimentManager, voiceQueueManager, signal, multiplayer, audioManager, },
) => {
  const raw = m.getRaw();
  const parsed = parseMessage(raw);
  const { command } = parsed;
  const bindings = m.getBindings();
  const args = {
    message: m,
    parsed,
    bindings,
    chatManager,
    embodimentManager,
    voiceQueueManager,
    signal,
    multiplayer,
    audioManager,
  };

  let promise;
  const messageType = messageTypes[command];
  if (messageType) {
    promise = messageType.execute(args);
  } else {
    console.warn('cannot execute unknown command', command);
    promise = Promise.resolve();
  }
  await promise;
};

const ChatMessageRuntime = {
  parseMessage,
  formatMessage,
  messageToReact,
  messageToText,
  isBlocking,
  isMajor,
  isAction,
  bindLore,
  preload,
  execute,
};

export default ChatMessageRuntime;
