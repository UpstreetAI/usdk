// import React, {useState, useEffect, useRef} from 'react';
// import classnames from 'classnames';
// import dioramaManager from '../../../packages/engine/diorama/diorama-manager.js';
// import {RpgText} from '../rpg-text/RpgText.jsx';
// import styles from './CharacterHups.module.css';
// import {chatTextSpeed} from '../../../packages/engine/constants.js';
// import {playersManager} from '../../../packages/engine/players-manager.js';
import {
  createPlayerDiorama,
} from '../../diorama/diorama-system.js';
// import canvasRegistry from '../../canvas-registry/canvas-registry.js';

//

class HupRenderer extends EventTarget {
  constructor({
    hup,
    width,
    height,
    engineRenderer,
    lightingManager,
  }) {
    super();

    this.hup = hup;
    this.engineRenderer = engineRenderer;
    this.lightingManager = lightingManager;

    this.canvas = null;

    const character = this.hup.parent.character;
    const diorama = createPlayerDiorama({
      target: character,
      objects: [
        character.avatar.avatarQuality.scene,
      ],
      grassBackground: true,

      engineRenderer,
      lightingManager,
    });
    this.diorama = diorama;

    // const hupVoiceStart = e => {
    //   this.dispatchEvent(new MessageEvent('voicestart', {
    //     data: e.data,
    //   }));
    // };
    // hup.addEventListener('voicestart', hupVoiceStart);
    // const hupVoiceEnd = e => {
    //   this.dispatchEvent(new MessageEvent('voiceend', {
    //     data: e.data,
    //   }));
    // };
    // hup.addEventListener('voiceend', hupVoiceEnd);

    this.destroy = () => {
      diorama.destroy();

      // this.chatDioramas.delete(character);

      // hup.removeEventListener('update', hupUpdate);

      // hup.removeEventListener('voicestart', hupVoiceStart);
      // hup.removeEventListener('voiceend', hupVoiceEnd);
    };

    /* const voicestart = e => {
      console.log('got voice', e);
    };
    this.hup.addEventListener('voicestart', voicestart);
    const destroy = e => {
      console.log('destroy', e);
    };
    this.hup.addEventListener('destroy', destroy);
    
    return () => {
      this.hup.removeEventListener('voicestart', voicestart);
      this.hup.removeEventListener('destroy', destroy);
    }; */
  }
  bindCanvas(canvas) {
    this.canvas = canvas;
    this.diorama.addCanvas(canvas);
  }
  // getImageBitmap() {
  //   return this.canvas.transferToImageBitmap();
  // }
  update(timestamp, timeDiff) {
    this.diorama.update(timestamp, timeDiff);
  }
}

//

export class HupsManager extends EventTarget {
  constructor({
    voiceQueueManager,
    engineRenderer,
    lightingManager,
    // ioBus,
  }) {
    super();
    
    if (!voiceQueueManager || !engineRenderer || !lightingManager /*|| !g*/) {
      console.warn('missing args', {
        voiceQueueManager,
        engineRenderer,
        lightingManager,
        // ioBus,
      });
      debugger;
    }
    this.voiceQueueManager = voiceQueueManager;
    this.engineRenderer = engineRenderer;
    this.lightingManager = lightingManager;
    // this.ioBus = ioBus;

    this.enabled = true;

    this.hupRenderers = [];

    // this.#listen();
  }
  /* #listen() {
    this.ioBus.addEventListener('message', e => {
      const {
        type,
        args
      } = e.data;
      if (type === 'cameraMode') {
        const {
          mode,
        } = args;
        this.enabled = mode === 'normal';
      }
    });
  } */
  async voice(fn) {
    await this.voiceQueueManager.waitForVoiceTurn(fn);
  }
  addCharacterHup(character, hup, {
    width,
    height,
  }) {
    // dispatch event
    const playerSpec = character.getPlayerSpec();
    const {
      name: characterName,
    } = playerSpec;
    const {
      hupId,
      fullText,
      emote,
    } = hup;
    /* this.ioBus.sendMessage('hupAdd', {
      hupId,
      characterName,
      fullText,
      emote,
    }); */

    // handle voice timing
    hup.addEventListener('voicestart', e => {
      const {
        message,
        fullText,
        emote,
      } = e.data;
      if (emote === undefined) {
        debugger;
      }

      this.dispatchEvent(new MessageEvent('voicestart', {
        data: {
          character,
          message,
          emote,
        },
      }));

      /* this.ioBus.sendMessage('hupVoiceStart', {
        hupId,
        characterName,
        message,
        fullText,
        emote,
      }); */
    });
    hup.addEventListener('voiceend', e => {
      const {
        message,
      } = e.data;

      this.dispatchEvent(new MessageEvent('voiceend', {
        data: {
          hupId,
          character,
          characterName,
          message,
          fullText,
          emote,
        },
      }));
    });

    // rendering
    if (this.enabled) {
      const {
        engineRenderer,
        lightingManager,
      } = this;
      const hupRenderer = new HupRenderer({
        hup,
        width,
        height,
        engineRenderer,
        lightingManager,
      });
      this.hupRenderers.push(hupRenderer);

      // bind canvas
      (async () => {
        const defaultHupSize = 256;
        const pixelRatio = window.devicePixelRatio;
        const width = defaultHupSize * pixelRatio;
        const height = defaultHupSize * pixelRatio;

        /* const offscreenCanvas = await this.ioBus.request('registerCanvas', {
          width,
          height,
          canvasId: hupId,
        });
        hupRenderer.bindCanvas(offscreenCanvas); */
      })();
    }
  }
  removeCharacterHup(character, hup) {
    // dispatch event
    const {
      hupId,
    } = hup;
    // this.ioBus.postMessage('hupRemove', {
    //   hupId,
    // });
    // this.ioBus.sendMessage('hupRemove', {
    //   hupId,
    // });

    // rendering
    if (this.enabled) {
      // const oldLength = this.hupRenderers.length;

      const index = this.hupRenderers.findIndex(hupRenderer => hupRenderer.hup === hup);
      if (index === -1) {
        console.warn('hup not found', hup);
        debugger;
      }
      // const oldHupRenderers = this.hupRenderers.slice();
      // const oldLength2 = oldHupRenderers.length;
      const hupRenderer = this.hupRenderers.splice(index, 1)[0];

      // console.log('remove hup', hup, this.hupRenderers.length, oldHupRenderers, oldLength, oldLength2, index);
      // if (oldLength > 2 && this.hupRenderers.length === 0) {
      //   debugger;
      // }

      hupRenderer.destroy();
      hup.destroy();
    }
  }
  /* updateCharacterHupPosition(character, hup, position3D) {
    const {
      hupId,
    } = hup;
    const position = [
      (position3D.x + 1) / 2,
      1 - (position3D.y + 1) / 2,
      -position3D.z,
    ];
    this.ioBus.sendMessage('hupPositionUpdate', {
      hupId,
      position,
    });
  } */
  update(timestamp, timeDiff) {
    if (this.enabled) {
      for (let i = 0; i < this.hupRenderers.length; i++) {
        const hupRenderer = this.hupRenderers[i];
        
        const {
          hup,
        } = hupRenderer;
        const {
          hupId,
        } = hup;

        hupRenderer.update(timestamp, timeDiff);
      }
    }
  }
}