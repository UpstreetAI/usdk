// import {playersManager} from '../players-manager.js';
import {
  emoteAnimations,
} from '../../avatars/animationHelpers.js';
import {
  emotes,
  emoteEmotions,
} from './emotes.js';

//

export class EmoteManager {
  constructor({
    playersManager,
    // ioBus,
  }) {
    // if (!playersManager || !ioBus) {
    //   console.warn('missing', {
    //     playersManager,
    //     ioBus,
    //   });
    //   debugger;
    // }

    this.playersManager = playersManager;
    // this.ioBus = ioBus;

    /* this.ioBus.registerHandler('triggerEmote', e => {
      this.triggerEmote(e.emote);
    }); */

    this.emoteTimeouts = new Map();
  }

  /* getEmoteSpec(emoteName) {
    const emoteHardName = emoteName.replace(/Soft$/, '');
    const emote = emotes.find(emote => emote.name === emoteHardName);
    return emote;
  } */

  triggerEmote(emoteName, player = this.playersManager.getLocalPlayer()) {
    return new Promise((accept, reject) => {
      // const emoteSpec = this.getEmoteSpec(emoteName);
      // const emoteHardName = emoteSpec.name;
      const emoteHardName = emoteName.match(/^(\S*?)(?:Soft)?$/)[1];
      // const soft = /soft/i.test(emoteName);
      const emoteIndex = emotes.indexOf(emoteHardName);
      if (emoteIndex !== -1) {
        const emoteEmotion = emoteEmotions[emoteIndex];

        // clear old emote
        const oldEmoteAction = player.actionManager.getActionType('emote');
        oldEmoteAction && player.actionManager.removeAction(oldEmoteAction);
        const oldFaceposeAction = player.actionManager.getActionType('facepose');
        oldFaceposeAction && player.actionManager.removeAction(oldFaceposeAction);

        const oldEmoteTimeout = this.emoteTimeouts.get(player);
        if (oldEmoteTimeout) {
          clearTimeout(oldEmoteTimeout);
          this.emoteTimeouts.delete(player);
        }

        // add new emote
        const emoteAnimation = emoteAnimations[emoteHardName];
        if (emoteAnimation) {
          const newEmoteAction = {
            type: 'emote',
            animation: emoteName,
          };
          player.actionManager.addAction(newEmoteAction);

          const newFacePoseAction = {
            type: 'facepose',
            emotion: emoteEmotion,
          };
          player.actionManager.addAction(newFacePoseAction);

          const emoteAnimationDuration = emoteAnimation.duration;
          const newEmoteTimeout = setTimeout(() => {
            const emoteAction = player.actionManager.findAction(action => action.type === 'emote' && action.animation === emoteName);
            if (emoteAction) {
              player.actionManager.removeAction(emoteAction);
            } else {
              console.warn('missing emote action', {
                emoteAction,
                emoteName,
              });
            }
            
            const facePoseAction = player.actionManager.findAction(action => action.type === 'facepose' && action.emotion === emoteEmotion);
            if (facePoseAction) {
              player.actionManager.removeAction(facePoseAction);
            } else {
              console.warn('missing face pose action', {
                facePoseAction,
                emoteEmotion,
              });
            }

            this.emoteTimeouts.delete(player);

            accept();
          }, emoteAnimationDuration * 1000);
          this.emoteTimeouts.set(player, newEmoteTimeout);
        } else {
          console.warn('missing emote animation', {
            emoteName,
            emoteHardName,
            emoteAnimations,
          });
        }
      } else {
        console.warn('invalid emote', {
          emoteName,
          emoteHardName,
          emotes,
        });
      }
    });
  }
}
// export {
//   emotes,
// };
// const emoteManager = new EmoteManager();
// export default emoteManager;