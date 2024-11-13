/*
this file contains the story beat triggers (battles, victory, game over, etc.)
*/

import {
  Critic,
} from '../lore/critic.js';
import {
  Choicer,
} from '../lore/choicer.js';

//

/* function makeSwirlPass() {
  const renderer = getRenderer();
  const size = renderer.getSize(localVector2D)
    .multiplyScalar(renderer.getPixelRatio());
  const resolution = size;
  const swirlPass = new SwirlPass(rootScene, camera, resolution.x, resolution.y);
  return swirlPass;
}
let swirlPass = null;
const _startSwirl = () => {
  if (!swirlPass) {
    swirlPass = makeSwirlPass();
    renderSettingsManager.addExtraPass(swirlPass);

    this.sounds.playSoundName('battleTransition');
    musicManager.playCurrentMusicName('battle');
  }
};
const _stopSwirl = () => {
  if (swirlPass) {
    renderSettingsManager.removeExtraPass(swirlPass);
    swirlPass = null;

    musicManager.stopCurrentMusic();
    return true;
  } else {
    return false;
  }
}; */

//

export const contentRatings = [
  'TV-Y',
  'TV-G',
  'TV-PG',
  'TV-14',
  'TV-MA',
  'Unrated',
];
export const contentRatingDefault = contentRatings[contentRatings.length - 1];

//

export const cameraModes = [
  'Cinematic',
  'Simple',
  'Free',
];
const cameraModeDefault = cameraModes[0];

export const advanceModes = [
  'Verbose',
  'Narrate',
  'Wait',
  'Auto',
];
const advanceModeDefault = advanceModes[3];

export const subtitlesModes = [
  'Box',
  'Anime',
  'Visual Novel',
  'Bubble',
  'None',
];
const subtitlesModeDefault = subtitlesModes[4];

export const choicesModes = [
  'Active',
  'Wait',
  'None',
];
const choicesModeDefault = choicesModes[0];

export const storyPresenceModes = [
  'Actor',
  'Observer',
  'Hidden',
];
const storyPresenceModeDefault = storyPresenceModes[2];

//

export const aiModelModes = [
  'openai:gpt-3.5-turbo-1106',
  'openai:gpt-4',
  'openai:gpt-4-1106-preview',

  'together:mistralai/Mixtral-8x7B-Instruct-v0.1',
  'together:mistralai/Mistral-7B-Instruct-v0.1',
  'together:mistralai/Mistral-7B-Instruct-v0.2',
  // 'together:mistralai/NousResearch/Nous-Hermes-llama-2-7b',
  'together:NousResearch/Nous-Hermes-Llama2-13b',
  'together:Open-Orca/Mistral-7B-OpenOrca',
  'together:teknium/OpenHermes-2-Mistral-7B',
  'together:teknium/OpenHermes-2p5-Mistral-7B',
  'NousResearch/Nous-Hermes-2-Yi-34B',
  'together:Gryphe/MythoMax-L2-13b',
];
const aiModelModeDefault = aiModelModes[0];

//

/* export const storyCameraShots = [
  "establishing shot",
  "master shot",
  "wide shot",
  "full shot",
  "medium shot",
  "medium close up shot",
  "close up shot",
  "extreme close up shot",
];
export const storyCameraFrames = [
  "single shot",
  "two shot",
  "crowd shot",
  "over the shoulder shot",
  "point of view shot",
  "insert shot",
];
export const storyCameraAngles = [
  "low angle",
  "high angle",
  "overhead angle",
  "dutch angle",
  "eye level",
  "shoulder level",
  "knee level",
  "ground level",
]; */

//

const fuzzyEmotionMappings = {
  "alert": "alert",
  "angry": "angry",
  "embarrassed": "embarrassed",
  "headNod": "headNod",
  "headShake": "headShake",
  "sad": "sad",
  "surprise": "surprise",
  "victory": "victory",
  "surprised": "surprise",
  "happy": "victory",
  "sorrow": "sad",
  "joy": "victory",
  "confused": "alert",
};
export const getFuzzyEmotionMapping = emotionName => fuzzyEmotionMappings[emotionName];

//

class StoryCamera extends EventTarget {
  constructor({
    worldClient,
    autoCameraManager,
    storyManager,
  }) {
    super();

    if (!worldClient || !autoCameraManager || !storyManager) {
      console.warn('missing args', {
        worldClient,
        autoCameraManager,
        storyManager,
      });
      throw new Error('missing args');
    }

    this.worldClient = worldClient;
    this.autoCameraManager = autoCameraManager;
    this.storyManager = storyManager;

    this.autoCamera = null;

    this.#listen();
  }

  #listen() {
    // bind world client
    this.worldClient.addEventListener('settingsupdate', e => {
      const {
        settings,
        oldSettings,
      } = e.data;
      const cameraMode = settings?.cameraMode ?? cameraModeDefault;
      const oldCameraAdvance = oldSettings?.cameraMode ?? cameraModeDefault;

      if (!cameraMode !== oldCameraAdvance) {
        this.dispatchEvent(new MessageEvent('modechange', {
          data: {
            mode: cameraMode,
          },
        }));
      }
    });

    // bind conversation
    {
      let conversationCleanup = null;
      const bindConversation = (conversation) => {
        if (conversationCleanup) {
          conversationCleanup();
          conversationCleanup = null;
        }

        if (conversation) {
          const {
            engine,
            engineRenderer,
          } = this.storyManager;
          const {
            camera,
          } = engineRenderer;
          const autoCamera = this.autoCameraManager.createAutoCamera({
            camera,
          });
          this.autoCamera = autoCamera;

          const messageplay = e => {
            const {
              message,
            } = e.data;
            if (message.isMajor(engine)) {
              const bindings = message.getBindings();
              this.autoCameraManager.addBindings(bindings);

              autoCamera.tick();
            }
          };
          conversation.addEventListener('messageplay', messageplay);

          const close = e => {
            this.autoCameraManager.clearBindings();

            bindConversation(null);
          };
          conversation.addEventListener('close', close);

          conversationCleanup = () => {
            conversation.removeEventListener('messageplay', onmessage);
            conversation.removeEventListener('close', close);
          };
        }
      };
      const conversation = this.storyManager.getConversation();
      if (conversation) {
        bindConversation(conversation);
      }
      const onconversationstart = e => {
        bindConversation(e.data.conversation);
      };
      this.storyManager.addEventListener('conversationstart', onconversationstart);
    }

    // bind app manager name change
    // {
    //   const appmanagernamechange = e => {
    //     const {
    //       appManagerName,
    //     } = e.data;
    //     this.autoCameraManager.setAppManagerName(appManagerName);
    //   };
    //   this.storyManager.addEventListener('appmanagernamechange', appmanagernamechange);
    // }
  }

  getMode() {
    return this.worldClient.getSettings()?.cameraMode ?? cameraModes[0];
  }
  getModeIndex() {
    return cameraModes.indexOf(this.getMode());
  }
  setMode(cameraMode) {
    let settings = this.worldClient.getSettings();
    settings = {
      ...settings,
      cameraMode,
    };
    this.worldClient.setSettings(settings);
  }

  getCameraControllerFn() {
    const mode = this.getMode();
    switch (mode) {
      case 'Cinematic': {
        let animation = null;
        let cameraSeed = '';

        const _updateAnimation = () => {
          for (;;) {
            animation = this.autoCamera.createCinematicAnimation();
            cameraSeed = this.autoCamera.getSeed();

            if (animation.isValid()) {
              break;
            } else {
              this.autoCamera.tick();
            }
          }
        };

        return (now) => {
          if (this.autoCamera) {
            if (animation === null) {
              _updateAnimation();
            }
            const newCameraSeed = this.autoCamera.getSeed();
            if (newCameraSeed !== cameraSeed) {
              _updateAnimation();
            }

            animation.update(now);
          }
        };
      }
      case 'Simple': {
        let animation = null;
        let cameraSeed = '';

        const _updateAnimation = () => {
          for (;;) {
            animation = this.autoCamera.createSimpleAnimation();
            cameraSeed = this.autoCamera.getSeed();

            if (animation.isValid()) {
              break;
            } else {
              this.autoCamera.tick();
            }
          }
        };

        return (now) => {
          if (this.autoCamera) {
            if (animation === null) {
              _updateAnimation();
            }
            const newCameraSeed = this.autoCamera.getSeed();
            if (newCameraSeed !== cameraSeed) {
              _updateAnimation();
            }

            animation.update(now);
          }
        };
      }
      case 'Free': {
        return () => {
          // nothing
        };
      }
      default: {
        throw new Error('invalid camera mode: ' + mode);
      }
    }
  }
}

class StoryAdvance extends EventTarget {
  constructor({
    worldClient,
  }) {
    super();

    if (!worldClient) {
      console.warn('missing args', {
        worldClient,
      });
      throw new Error('missing args');
    }

    this.worldClient = worldClient;

    this.#listen();
  }

  #listen() {
    // bind world client
    this.worldClient.addEventListener('settingsupdate', e => {
      const {
        settings,
        oldSettings,
      } = e.data;
      const advanceMode = settings?.advanceMode ?? advanceModeDefault;
      const oldAdvanceMode = oldSettings?.advanceMode ?? advanceModeDefault;

      if (advanceMode !== oldAdvanceMode) {
        this.dispatchEvent(new MessageEvent('modechange', {
          data: {
            mode: advanceMode,
          },
        }));
      }
    });
  }

  getMode() {
    return this.worldClient.getSettings()?.advanceMode ?? advanceModeDefault;
  }
  getModeIndex() {
    return advanceModes.indexOf(this.getMode());
  }
  setMode(advanceMode) {
    let settings = this.worldClient.getSettings();
    settings = {
      ...settings,
      advanceMode,
    };
    this.worldClient.setSettings(settings);
  }
}

class StorySubtitles extends EventTarget {
  constructor({
    worldClient,
  }) {
    super();

    if (!worldClient) {
      console.warn('missing args', {
        worldClient,
      });
      throw new Error('missing args');
    }

    this.worldClient = worldClient;

    this.#listen();
  }

  #listen() {
    // bind world client
    this.worldClient.addEventListener('settingsupdate', e => {
      const {
        settings,
        oldSettings,
      } = e.data;
      const subtitlesMode = settings?.subtitlesMode ?? subtitlesModeDefault;
      const oldSubtitlesMode = oldSettings?.subtitlesMode ?? subtitlesModeDefault;

      if (subtitlesMode !== oldSubtitlesMode) {
        this.dispatchEvent(new MessageEvent('modechange', {
          data: {
            mode: subtitlesMode,
          },
        }));
      }
    });
  }

  getMode() {
    return this.worldClient.getSettings()?.subtitlesMode ?? subtitlesModeDefault;
  }
  getModeIndex() {
    return subtitlesModes.indexOf(this.getMode());
  }
  setMode(subtitlesMode) {
    let settings = this.worldClient.getSettings();
    settings = {
      ...settings,
      subtitlesMode,
    };
    this.worldClient.setSettings(settings);
  }
}

/* class StoryChoices extends EventTarget {
  constructor({
    worldClient,
  }) {
    super();

    if (!worldClient) {
      console.warn('missing args', {
        worldClient,
      });
      throw new Error('missing args');
    }

    this.worldClient = worldClient;

    this.#listen();
  }

  #listen() {
    // bind world client
    this.worldClient.addEventListener('settingsupdate', e => {
      const {
        settings,
        oldSettings,
      } = e.data;
      const choicesMode = settings?.choicesMode ?? choicesModeDefault;
      const oldChoicesMode = oldSettings?.choicesMode ?? choicesModeDefault;

      if (choicesMode !== oldChoicesMode) {
        this.dispatchEvent(new MessageEvent('modechange', {
          data: {
            mode: choicesMode,
          },
        }));
      }
    });
  }

  getMode() {
    return this.worldClient.getSettings()?.choicesMode ?? choicesModeDefault;
  }
  getModeIndex() {
    return choicesModes.indexOf(this.getMode());
  }
  setMode(choicesMode) {
    let settings = this.worldClient.getSettings();
    settings = {
      ...settings,
      choicesMode,
    };
    this.worldClient.setSettings(settings);
  }
} */

class StoryPresence extends EventTarget {
  constructor({
    worldClient,
  }) {
    super();

    if (!worldClient) {
      console.warn('missing args', {
        worldClient,
      });
      throw new Error('missing args');
    }

    this.worldClient = worldClient;

    // this.mode = storyPresenceModeDefault;

    this.#listen();
  }

  #listen() {
    // bind world client
    this.worldClient.addEventListener('settingsupdate', e => {
      const {
        settings,
        oldSettings,
      } = e.data;
      const presenceMode = settings?.presenceMode ?? storyPresenceModeDefault;
      const oldPresenceMode = oldSettings?.presenceMode ?? storyPresenceModeDefault;

      if (presenceMode !== oldPresenceMode) {
        this.dispatchEvent(new MessageEvent('modechange', {
          data: {
            mode: presenceMode,
          },
        }));
      }
    });
  }

  getMode() {
    return this.worldClient.getSettings()?.presenceMode ?? storyPresenceModeDefault;
  }
  getModeIndex() {
    return storyPresenceModes.indexOf(this.getMode());
  }
  setMode(mode) {
    let settings = this.worldClient.getSettings();
    settings = {
      ...settings,
      presenceMode: mode,
    };
    this.worldClient.setSettings(settings);
  }
}

//

class StoryAiModel extends EventTarget {
  constructor() {
    super();

    this.mode = aiModelModeDefault;
  }
  getMode() {
    return this.mode;
  }
  getModeIndex() {
    return aiModelModes.indexOf(this.mode);
  }
  setMode(mode) {
    this.mode = mode;

    this.dispatchEvent(new MessageEvent('modechange', {
      data: {
        mode,
      },
    }));
  }
}

//

/* let currentFieldMusic = null;
let currentFieldMusicIndex = 0;
export const handleStoryKeyControls = async (e) => {
  switch (e.which) {
    case 48: { // 0
      await musicManager.waitForLoad();
      _stopSwirl() || _startSwirl();
      return false;
    }
    case 57: { // 9
      await musicManager.waitForLoad();
      _stopSwirl();
      if (currentFieldMusic) {
        musicManager.stopCurrentMusic();
        currentFieldMusic = null;
      } else {
        const fieldMusicName = fieldMusicNames[currentFieldMusicIndex];
        currentFieldMusicIndex = (currentFieldMusicIndex + 1) % fieldMusicNames.length;
        currentFieldMusic = musicManager.playCurrentMusic(fieldMusicName, {
          repeat: true,
        });
      }
      return false;
    }
    case 189: { // -
      await musicManager.waitForLoad();
      _stopSwirl();
      musicManager.playCurrentMusic('victory', {
        repeat: true,
      });
      return false;
    }
    case 187: { // =
      await musicManager.waitForLoad();

      _stopSwirl();
      musicManager.playCurrentMusic('gameOver', {
        repeat: true,
      });
      return false;
    }
  }

  return true;

}; */

export class StoryManager extends EventTarget {
  constructor({
    context,
    engine,
    // localStorageManager,
    engineRenderer,
    cameraManager,
    autoCameraManager,
    // aiClient,
    // appManagerContext,
    emoteManager,
    playersManager,
    npcManager,
    chatManager,
    voiceQueueManager,
    interactionManager,
    zTargetingManager,
    worldClient,
    worldManager,
    loreManager,
    physicsTracker,
    sounds,
  }) {
    super();

    if (!context || !engine || !engineRenderer || !cameraManager || !autoCameraManager || !emoteManager || !playersManager || !npcManager || !chatManager || !voiceQueueManager || !interactionManager || !zTargetingManager || !worldClient || !worldManager || !loreManager || !physicsTracker || !sounds) {
      console.warn('missing args', {context, engine, engineRenderer, cameraManager, autoCameraManager, emoteManager, playersManager, npcManager, chatManager, voiceQueueManager, interactionManager, zTargetingManager, worldManager, loreManager, physicsTracker, sounds});
      throw new Error('missing args');
    }

    this.context = context;
    this.engine = engine;
    // this.localStorageManager = localStorageManager;
    this.engineRenderer = engineRenderer;
    this.cameraManager = cameraManager;
    this.autoCameraManager = autoCameraManager;
    // this.aiClient = aiClient;
    // this.appManagerContext = appManagerContext;
    this.emoteManager = emoteManager;
    this.playersManager = playersManager;
    this.npcManager = npcManager;
    this.chatManager = chatManager;
    this.voiceQueueManager = voiceQueueManager;
    this.interactionManager = interactionManager;
    this.zTargetingManager = zTargetingManager;
    this.worldClient = worldClient;
    this.worldManager = worldManager;
    this.loreManager = loreManager;
    this.physicsTracker = physicsTracker;
    this.sounds = sounds;

    //

    this.storyCamera = new StoryCamera({
      worldClient: this.worldClient,
      autoCameraManager: this.autoCameraManager,
      storyManager: this,
    });
    this.storyAdvance = new StoryAdvance({
      worldClient: this.worldClient,
    });
    this.storySubtitles = new StorySubtitles({
      worldClient: this.worldClient,
    });
    // this.storyChoices = new StoryChoices({
    //   worldClient: this.worldClient,
    // });
    this.storyPresence = new StoryPresence({
      worldClient: this.worldClient,
    });

    //

    this.storyAiModel = new StoryAiModel();

    //

    this.appManagerName = null;

    //

    this.#listen();

    //

    /* globalThis.testConversation = async () => {
      // const conversation = this.startConversation();
      const conversation = new Conversation({
        engine: this.engine,
      });
      const completer = this.#getStoryCompleter();
      // this.dispatchEvent(new MessageEvent('completerstart', {
      //   data: {
      //     completer,
      //   },
      // }));
      const completion = this.#getCompletion(completer, {
        preload: false,
      });
      const messages = await arrayFromGenerator(completion);
      const s = messages.map(m => m.getContent()).join('\n');
      // return s;
      console.log(s);
    }; */
  }
  #currentConversation = null;
  #currentCritic = null;

  #setConversation(conversation) {
    // destroy old conversation
    if (this.#currentConversation) {
      this.#currentConversation.stopExecute();
      this.#currentConversation.stopPreload();
      this.#currentConversation.close();
      this.#currentConversation = null;
    }

    // set new conversation
    this.#currentConversation = conversation;
    this.dispatchEvent(new MessageEvent('conversationchange', {
      data: {
        conversation,
      },
    }));

    if (conversation) {
      // bind message executer -> chat manager
      conversation.addEventListener('messageplay', e => {
        this.chatManager.addMessage(e.data.message);
      });

      // wait for close
      conversation.addEventListener('close', () => {
        this.#setConversation(null);
      }, {once: true});
    }
  }

  #setCritic(critic) {
    this.#currentCritic = critic;
    this.dispatchEvent(new MessageEvent('criticchange', {
      data: {
        critic,
      },
    }));
  }

  #getAllPlayers() {
    const {
      playersManager,
      npcManager,
    } = this;

    const allPlayers = playersManager.getAllPlayers()
      .concat(
        Array.from(npcManager.npcPlayers)
      );
    return allPlayers;
  }

  setAppManagerName(appManagerName) {
    this.appManagerName = appManagerName;

    this.dispatchEvent(new MessageEvent('appmanagernamechange', {
      data: {
        appManagerName,
      },
    }));
  }

  getConversationStarter({
    localPlayerId,
    app,
    physicsId,
  }) {
    const {
      appType,
    } = app;
    switch (appType) {
      case 'vrm': {
        const allPlayers = this.#getAllPlayers();
        const allPlayerAppSpecs = allPlayers.map(player => {
          return {
            player,
            apps: Array.from(player.appManager.apps.values()),
          };
        });
        const player = allPlayerAppSpecs.find(playerSpec => {
          const {
            apps,
          } = playerSpec;
          return apps.includes(app);
        })?.player ?? null;
        if (player) {
          const {playerId} = player;
          const starter = {
            object: player.avatar.modelBones.Head,
            startFn: async ({completer}) => {
              return await completer.getInspectPlayerMessage({
                localPlayerId,
                playerId,
              });
            },
          };
          return starter;
        } else {
          console.warn('no player associated with app', app);
          throw new Error('no player associated with app');
        }
      }
      case 'character360': {
        const allPlayers = this.#getAllPlayers();
        const allPlayerAppSpecs = allPlayers.map(player => {
          return {
            player,
            apps: Array.from(player.appManager.apps.values()),
          };
        });
        const player = allPlayerAppSpecs.find(playerSpec => {
          const {
            apps,
          } = playerSpec;
          return apps.includes(app);
        })?.player ?? null;
        if (player) {
          const {playerId} = player;
          const starter = {
            object: player.avatar.modelBones.Head,
            startFn: async ({completer}) => {
              return await completer.getInspectPlayerMessage({
                localPlayerId,
                playerId,
              });
            },
          };
          return starter;
        } else {
          console.warn('no player associated with app', app);
          throw new Error('no player associated with app');
        }
      }
      default: {
        // let targetSpec = app.spec;
        const {
          loreManager,
        } = this;
        const {
          engine,
        } = loreManager;
        const {
          physicsTracker,
        } = engine;
        const physicsApp = physicsTracker.getAppByPhysicsId(physicsId);
        if (!physicsApp) {
          throw new Error('no physics app');
        }
        const lore = this.loreManager.getLore();
        const targetActor = lore.getActorById(physicsApp.instanceId);
        if (!targetActor) {
          throw new Error('no target actor');
        }
        const starter = {
          object: app,
          startFn: async ({completer}) => {
            return await completer.getInspectTargetMessage({
              localPlayerId,
              targetActor,
            });
          },
        };
        return starter;
      }
    }
  }
  #getCritic({
    conversation,
  }) {
    const critic = new Critic({
      model: this.storyAiModel.getMode(),
      loreManager: this.loreManager,
    });
    conversation.addEventListener('messageplay', e => {
      const {
        message,
      } = e.data;
      critic.addMessage(message);
      critic.tick({
        includeLocalPlayer: this.storyPresence.getMode() === 'Actor',
      });
    });
    return critic;
  }

  async completeChoices({
    signal,
  }) {
    const messages = this.chatManager.getMessages().slice();
    const choicer = new Choicer();
    const choices = await choicer.complete({
      messages,
      signal,
    });
    return choices;
  }

  startConversation(conversation) {
    this.#setConversation(conversation);
    this.dispatchEvent(new MessageEvent('conversationstart', {
      data: {
        conversation,
      },
    }));
  }
  stopConversation() {
    if (this.#currentConversation) {
      // console.log('stop conversation');

      this.sounds.playSoundName('menuNext');

      this.#currentConversation.close();
    } else {
      console.log('no conversation to stop')
    }
  }
  /* async inspectPhysicsId(physicsId) {
    if (!this.#currentConversation) {
      // play sound
      this.sounds.playSoundName('menuSelect');

      // locals
      const localPlayer = this.playersManager.getLocalPlayer();
      const localPlayerId = localPlayer.playerId;

      const [
        app,
        targetObject,
      ] = this.physicsTracker.getPairByPhysicsId(physicsId);

      // get conversation starter
      const starter = this.getConversationStarter({
        localPlayerId,
        app,
        physicsId,
      });

      // add local player actions
      {
        const targetPosition = targetObject.position;
        const bbox2 = targetObject.physicsMesh ?
          new THREE.Box3()
            .setFromBufferAttribute(targetObject.physicsMesh.geometry.attributes.position)
            .applyMatrix4(targetObject.physicsMesh.matrixWorld)
        :
          null;

        const timestamp = performance.now();
        localPlayer.characterBehavior.clearWaypointActions();
        localPlayer.characterBehavior.addWaypointAction(
          targetPosition,
          timestamp,
          {
            boundingBox: bbox2,
          },
        );
      }

      // add possible remote player actions
      {
        // const npcPlayer = this.npcManager.getNpcByVrmApp(app);
        const npcPlayer = app.player;
        if (npcPlayer) {
          const timestamp = performance.now();
          npcPlayer.characterBehavior.addFaceTowardAction(
            // localPlayer.avatar.modelBones.Head.position,
            localPlayer.position,
            timestamp,
          );
        }
      }

      // start conversation
      const conversation = this.startConversation();
      const messages = await starter.startFn({
        completer: this.#getStoryCompleter(),
      });
      messages.queueMessages(conversation);
    } else {
      throw new Error('already in a conversation!');
    }
  } */
  /* async inspectSelf() {
    debugger;

    if (!this.#currentConversation) {
      // set camera
      // this.cameraManager.setFocus(false);

      // this.cameraManager.lastTarget = null;
      // this.cameraManager.setDynamicTarget();

      // play sound
      this.sounds.playSoundName('menuSelect');

      // initialize conversation
      // this.startConversation(({conversation}) => conversation.inspectSelf());
      this.startConversation();
      await this.#currentConversation.inspectSelf();
    } else {
      throw new Error('already in a conversation!');
    }
  } */

  #listen() {
    let worldCleanup = null;
    const bindWorld = (worldId) => {
      if (worldCleanup) {
        worldCleanup();
        worldCleanup = null;
      }

      // bind name/description update
      const name = {
        value: this.worldClient.getName(),
      };
      this.loreManager.addName(name);
      this.worldClient.addEventListener('namechange', e => {
        name.value = e.data.name;
      });
      const description = {
        value: this.worldClient.getDescription(),
      };
      this.loreManager.addDescription(description);
      this.worldClient.addEventListener('descriptionchange', e => {
        description.value = e.data.description;
      });
      this.loreManager.setContentRating(this.worldClient.getSettings()?.contentRating ?? contentRatingDefault);
      this.worldClient.addEventListener('settingschange', e => {
        const {
          settings,
        } = e.data;
        const contentRating = settings?.contentRating ?? contentRatingDefault;
        loreManager.setContentRating(contentRating);
      });

      // bind settings
      // const name = this.worldManager.getName();
      // const description = this.worldManager.getDescription();
      // const setting = {
      //   name,
      //   description,
      // };
      // this.loreManager.addSetting(setting);

      // const namechange = e => {
      //   setting.name = e.data.name;
      // };
      // this.worldManager.addEventListener('namechange', namechange);
      // const descriptionchange = e => {
      //   setting.description = e.data.description;
      // };
      // this.worldManager.addEventListener('descriptionchange', descriptionchange);

      /* // bind locations
      const locations = [
        {
          "name": "Enchanted Tech Forest",
          "description": "A forest where technology and magic intertwine. Bioluminescent plants and high-tech structures coexist, creating a unique ecosystem. In the heart of the forest lies a treehouse, crafted from living trees and advanced materials, serving as a hub for magical research."
        },
        {
          "name": "Floating Arcane Market",
          "description": "An interstellar market that defies gravity, floating amidst the clouds of a gas giant. Merchants from various dimensions sell enchanted artifacts and futuristic gadgets. The market is a labyrinth of stalls and shops, bustling with creatures of all kinds, trading in a symphony of languages and barter systems."
        },
        {
          "name": "Ruins of the Forgotten",
          "description": "Ancient ruins on a barren planet, where remnants of a once-great civilization merge with timeless magic. The structures are a blend of stone and unknown metallic alloys, covered in mystical runes. The air is filled with the echoes of a lost era, inviting explorers to uncover its secrets."
        },
        {
          "name": "Celestial Observatory",
          "description": "An observatory located on an asteroid, orbiting a vibrant nebula. It's a fusion of astral magic and space-age technology, used for studying the cosmos. The facility is equipped with telescopes and enchantment arrays, attracting both astronomers and sorcerers seeking to understand the universe."
        },
        {
          "name": "Subterranean Crystal Lab",
          "description": "Hidden beneath the surface, this laboratory is carved into a vast crystal cavern. The walls are lined with glowing crystals that pulsate with magical energy. Advanced scientific equipment is integrated seamlessly with ancient enchantment circles, creating a space where science and sorcery converge to unlock new mysteries."
        },
      ];
      // const locationNames = locations.map(l => l.name);
      for (const location of locations) {
        // const setting = {
        //   name: location.name,
        //   description: location.description,
        // };
        this.loreManager.addLocation(location);
      } */

      worldCleanup = () => {
        // for (const location of locations) {
        //   this.loreManager.removeLocation(location);
        // }
        this.loreManager.removeName(name);
        this.loreManager.removeDescription(description);

        // this.worldManager.removeEventListener('namechange', namechange);
        // this.worldManager.removeEventListener('descriptionchange', descriptionchange);
      };
    };
    const worldload = async e => {
      bindWorld(e.data.worldId);
    };
    this.worldClient.addEventListener('worldload', worldload);
    const worldId = this.worldClient.getWorldId();
    if (worldId) {
      bindWorld(worldId);
    }

    /* this.interactionManager.addEventListener('interact', async e => {
      debugger;
      throw new Error('not implemented');
      const {
        // app,
        physicsId,
      } = e;
      await this.inspectPhysicsId(physicsId);
    });

    this.zTargetingManager.addEventListener('select', async e => {
      debugger;
      throw new Error('not implemented');
      const {
        // app,
        physicsId,
      } = e;
      await this.inspectPhysicsId(physicsId);
    }); */
  }

  getConversation() {
    return this.#currentConversation;
  }
  async progressConversation() {
    this.sounds.playSoundName('menuNext');

    // console.log('progress conversation 1');
    this.#currentConversation.interruptOne();
    // console.log('progress conversation 2');
    await this.#currentConversation.executeOne();
    // console.log('progress conversation 3');
  }
  interrupt() {
    const conversation = this.getConversation();
    if (conversation) {
      conversation.clipTail();
      conversation.stopPreload();

      conversation.restartComplete();

      conversation.startPreload();
    }
  }

  /* async nextMessageAnonymous(opts) {
    const conversation = this.loreManager.createConversation({
      messages: true,
    });
    conversation.addEventListener('message', e => {
      const {
        message,
      } = e.data;
      this.#addMessage(message);
    });
    const message = await conversation.completeMessages([], opts);
    return message;
  } */

  /* useEffect(() => {
    if (engine) {
      const mousedown = async e => {
        const {
          zTargetingManager,
          // storyManager,
          playersManager,
        } = engine;
        const focusedApp = zTargetingManager.getFocusedApp();
        if (focusedApp) {
          const appManager = engine.getAppManager();
          const apps = appManager.getApps();
          const blockadelabsSkyboxApp = apps.find(a => a.appType === 'blockadelabsskybox');
          if (blockadelabsSkyboxApp) {
            const worldSpec = blockadelabsSkyboxApp.spec?.content;
            const localPlayer = playersManager.getLocalPlayer();
            const {
              playerSpec: localPlayerSpec,
            } = localPlayer;

            const aiClient = new AiClient({
              modelType: 'openai',
              modelName: 'gpt-4-0613',
            });
            const conversation = new Conversation({
              aiClient,
            });
            conversation.setWorldSpec(worldSpec);
            conversation.addPlayerSpec(localPlayerSpec);
            const remotePlayerSpecs = apps.filter(a =>
              a.appType === 'character360'
            ).map(a => a.spec.content);
            for (let i = 0; i < remotePlayerSpecs.length; i++) {
              conversation.addPlayerSpec(remotePlayerSpecs[i]);
            }

            if (remotePlayerSpecs.length > 0) {
              const parseMessage = message => {
                const argsString = message?.function_call?.arguments;
                const j = argsString ? JSON.parse(argsString) : null;
                return j;
              };

              // const remotePlayerSpec = remotePlayerSpecs[0];
              const message = await conversation.completeApp({
                localPlayerSpec,
                app: focusedApp,
              });
              const j = parseMessage(message);
              console.log('first message', message, j);
              globalThis.nextMessage = async () => {
                // const argsString = message?.function_call?.arguments;
                // const j = argsString ? JSON.parse(argsString) : null;
                const message = await conversation.nextMessage();
                const j = parseMessage(message);
                console.log('next message', message, j, conversation.getMessages());
              };
            } else {
              console.warn('no remote player specs', apps);
            }
          } else {
            console.warn('no skybox app', apps);
          }
        }
      };
      globalThis.addEventListener('mousedown', mousedown);

      return () => {
        globalThis.removeEventListener('mousedown', mousedown);
      };
    }
  }, [engine]); */
}

/* story.listenHack = () => {
  (typeof window !== 'undefined') && window.document.addEventListener('click', async e => {
    if (this.cameraManager.pointerLockEle`ment) {
      if (e.button === 0 && (this.cameraManager.focus && zTargeting.focusTargetReticle)) {
        const app = metaversefile.getAppByPhysicsId(zTargeting.focusTargetReticle.physicsId);

        if (app) {
          const {appType} = app;

          // cameraManager.setFocus(false);
          // zTargeting.focusTargetReticle = null;
          sounds.playSoundName('menuSelect');

          this.cameraManager.setFocus(false);
          this.cameraManager.setDynamicTarget();

          (async () => {
            const aiScene = metaversefile.useLoreAIScene();
            if (appType === 'npc') {
              const {name, description} = app.getLoreSpec();
              const remotePlayer = npcManager.getNpcByApp(app);

              if (remotePlayer) {
                const {
                  value: comment,
                  done,
                } = await aiScene.generateSelectCharacterComment(name, description);

                _startConversation(comment, remotePlayer, done);
              } else {
                console.warn('no player associated with app', app);
              }
            } else {
              const {name, description} = app;
              const comment = await aiScene.generateSelectTargetComment(name, description);
              const fakePlayer = {
                avatar: {
                  modelBones: {
                    Head: app,
                  },
                },
              };
              _startConversation(comment, fakePlayer, true);
            }
          })();
        } else {
          console.warn('could not find app for physics id', zTargeting.focusTargetReticle.physicsId);
        }
      } else if (e.button === 0 && currentConversation) {
        if (!currentConversation.progressing) {
          currentConversation.progress();

          sounds.playSoundName('menuNext');
        }
      }
    }
  });
}; */
