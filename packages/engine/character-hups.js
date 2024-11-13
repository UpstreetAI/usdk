/* this is the character heads up player implementation.
it controls the animated dioramas that happen when players perform actions.
the HTML part of this code lives as part of the React app. */

import * as THREE from 'three';
import {
  characterHupSize,
} from './constants.js';

//

const deadTimeoutTime = 2000;

const localVector = new THREE.Vector3();

//

let nextHupId = 0;
class Hup extends EventTarget {
  constructor({
    type,
    parent,
  }) {
    super();
    
    this.type = type;
    this.parent = parent;
    
    this.hupId = ++nextHupId;

    this.actionIds = [];
    this.characterName = '';
    this.fullText = '';
    this.emote = null;
    this.live = false;
    this.deadTimeout = null;
  }

  static isHupAction(action) {
    return action.type === 'chat';
  }

  mergeAction(action) {
    this.fullText = action.message;
    // if (action.emote === undefined) {
    //   console.warn('missing emote', action);
    //   debugger;
    // }
    // this.emote = action.emote;

    // // XXX
    // console.log('should update the hup full text, since it was merged', {
    //   action,
    //   fullText: this.fullText,
    // });
  
    this.actionIds.push(action.actionId);

    this.clearDeadTimeout();

    this.dispatchEvent(new MessageEvent('update', {
      data: {
        // hupId: this.hupId,
        fullText: this.fullText,
      },
    }));
  }
  unmergeAction(action) {
    const index = this.actionIds.indexOf(action.actionId);
    if (index !== -1) {
      this.actionIds.splice(index, 1);
    }
  }

  async updateVoicer(message, emote) {
    // this.parent.player === metaversefile.useLocalPlayer() && console.log('emit voice start');
    this.dispatchEvent(new MessageEvent('voicequeue', {
      data: {
        // hupId: this.hupId,
        message,
      },
    }));
    const preloadedMessage = this.parent.character.voicer.preloadMessage(message);
    await this.parent.hupsManager.voice(async () => {
      if (message) {
        if (this.fullText.length > 0) {
          this.fullText += '\n';
        }
        this.fullText += message;
      }
      this.emote = emote ?? null;

      this.dispatchEvent(new MessageEvent('voicestart', {
        data: {
          // hupId: this.hupId,
          message,
          fullText: this.fullText,
          emote: this.emote,
        },
      }));
      const result = await this.parent.character.voicer.start(preloadedMessage);
      
      this.dispatchEvent(new MessageEvent('voiceend', {
        data: {
          // hupId: this.hupId,
          fullText: this.fullText,
        },
      }));

      return result;
    });
  }

  clearDeadTimeout() {
    if (this.deadTimeout) {
      clearTimeout(this.deadTimeout);
      this.deadTimeout = null;
    }
  }

  startDeadTimeout() {
    this.clearDeadTimeout();
    this.deadTimeout = setTimeout(() => {
      this.dispatchEvent(new MessageEvent('deadtimeout'));
    }, deadTimeoutTime);
  }

  destroy() {
    this.dispatchEvent(new MessageEvent('destroy'));
  }
}
export class CharacterHups extends EventTarget {
  constructor({
    character,
    engineRenderer,
    hupsManager,
    // voiceTurnManager,
  }) {
    super();

    // if (!character || !engineRenderer || !hupsManager) {
    //   console.warn('invalid arguments', {
    //     character,
    //     engineRenderer,
    //     hupsManager,
    //   });
    //   // throw new Error('invalid arguments');
    //   debugger;
    // }

    this.character = character;
    this.hupsManager = hupsManager;
    // this.voiceTurnManager = voiceTurnManager;
    this.engineRenderer = engineRenderer;

    this.hups = [];

    this.character.actionManager.addEventListener('actionadded', async e => {
      const {action} = e.data;
      const {
        type,
        // actionId,
      } = action;

      const oldHup = this.hups.find(hup => hup.type === type);
      if (oldHup) {
        oldHup.mergeAction(action);
        oldHup.updateVoicer(action.message, action.emote);
      } else if (Hup.isHupAction(action) && character.avatar) {
        const newHup = new Hup({
          type: action.type,
          parent: this,
        });
        newHup.mergeAction(action);
        let pendingVoices = 0;
        newHup.addEventListener('voicequeue', () => {
          pendingVoices++;
          newHup.clearDeadTimeout();
        });
        newHup.addEventListener('voiceend', () => {
          if (--pendingVoices === 0) {
            newHup.startDeadTimeout();
          }
        });
        newHup.addEventListener('deadtimeout', () => {
          _cleanup();
        });
        this.hups.push(newHup);
        if (character.isRemotePlayer) {
          character.matrixWorld.makeRotationFromQuaternion(character.quaternion);
          character.matrixWorld.setPosition(...character.position.toArray());
        }

        this.hupsManager.addCharacterHup(character, newHup, {
          width: characterHupSize,
          height: characterHupSize,
        });
        newHup.updateVoicer(action.message, action.emote);

        // frame update position loop
        const _recurse = () => {
          frame = requestAnimationFrame(_recurse);

          // project the position onto the screen
          const {
            camera,
          } = this.engineRenderer;
          const screenPosition = localVector.copy(character.position);
          screenPosition.y += 0.2;
          screenPosition
            .project(camera);
          this.hupsManager.updateCharacterHupPosition(character, newHup, screenPosition);
        };
        let frame = requestAnimationFrame(_recurse);

        const _cleanup = () => {
          const index = this.hups.indexOf(newHup);
          this.hups.splice(index, 1);

          this.hupsManager.removeCharacterHup(character, newHup);

          cancelAnimationFrame(frame);
        };
      }
    });
    this.character.actionManager.addEventListener('actionremoved', e => {
      const {action} = e.data;
      const {actionId} = action;

      const oldHup = this.hups.find(hup => hup.actionIds.includes(actionId));
      if (oldHup) {
        oldHup.unmergeAction(action);
      }
    });
  }

  /* addChatHupAction(text, emotions) {
    this.character.addAction({
      type: 'chat',
      text,
    });
  } */

  destroy() {
    for (const hup in this.hups) {
      hup.destroy();
    }
  }
}