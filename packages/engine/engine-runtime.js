/*
this file contains the engine runtime state.
it includes all state except the initial initialization arguments.
*/

import * as THREE from 'three';
import {
  AudioManager,
} from './audio/audio-manager.js';
import {
  Sounds,
} from './sounds.js';
import {
  Voices,
} from './voices.js';
import {
  AiClient,
} from './clients/ai-client.js';
import {
  ImportManager,
} from '../app-runtime/import-manager.js';
import {
  PlayersManager,
} from './players-manager.js';
import {
  EnvironmentManager,
} from './environment/environment-manager.js';
import {
  CameraManager,
} from './camera-manager.js';
import {
  HistoryManager,
} from './managers/history/history-manager.js';
import {
  RenderedLoreManager,
} from './managers/lore/lore-manager.js';
import {
  AssetCache,
} from './managers/asset-cache/asset-cache.js';
import {
  SfxManager,
} from './managers/sfx-manager/sfx-manager.js';
import {
  WorldManager,
} from './managers/world/world-manager.js';
import {
  PointerLockManager,
} from './managers/pointer-lock/pointer-lock-manager.js';
import {
  CharacterSelectManager,
} from './characterselect-manager.js';
import {
  PartyManager,
} from './party-manager.js';
import {
  EmoteManager,
} from './managers/emote/emote-manager.js';
import {
  IoManager,
} from './managers/io/io-manager.js';
import {
  AppManagerContext,
} from './app-manager-context.js';
import {
  AppTracker,
} from './managers/app-tracker/app-tracker.js';
import {
  AutoCameraManager,
} from './managers/auto-camera/auto-camera-manager.js';
import {
  SpawnManager,
} from './spawn-manager.js';
import {
  AutoSpawnManager,
} from './managers/auto-spawn/auto-spawn-manager.js';
import {
  LightingManager,
} from './managers/lighting/lighting-manager.js';
import {
  SkyManager,
} from './managers/environment/skybox/sky-manager.js';
import {
  GameManager,
} from './game.js';
import {
  Multiplayer,
} from './realms/multiplayer.js';
import {
  SpriteLoader,
} from './spriting.js';
import {
  TextureAtlasLoader,
} from './atlasing.js';

import physicsManager from './physics/physics-manager.js';
import {
  NpcManager,
} from './npc-manager.js';
import {
  MobManager,
} from './managers/mob/mob-manager.js';
import {
  HupsManager,
} from './managers/hups/hups-manager.js';
import {
  ZTargetingManager,
} from './managers/z-targeting/z-targeting-manager.js';
import {
  CameraTargetingManager,
} from './managers/camera-targeting/camera-targeting-manager.js';
import {
  PostProcessing,
} from './post-processing.js';
import {
  LoadoutManager,
} from './loadout-manager.js';
import {
  WidgetManager,
} from './managers/widget/widget-manager.js';
import {
  TransformControlsManager,
} from './managers/transform-controls/transform-controls.js';
// import {
//   RenderSettingsManager,
// } from './managers/rendersettings/rendersettings-manager.js';
import {
  MusicManager,
} from './music-manager.js';
import {
  RaycastManager,
} from './raycast-manager.js';
import {
  InteractionManager,
} from './interaction-manager.js';
import {
  BackgroundFx,
} from './background-fx/background-fx.js';
import {
  HitManager,
} from './managers/interaction/hit-manager.js';
// import {
//   makeDefaultPerspectiveCamera,
// } from './renderer-utils.js';
import {
  MicrophoneManager,
} from './managers/microphone/microphone-manager.js';
import {
  EmbodimentManager,
} from './managers/embodiment/embodiment-manager.js';
import {
  EngineAppContextFactory,
} from '../app-runtime/engine-app-context-factory.js';
import {
  ChatManager,
} from './managers/chat/chat-manager.js';
import {
  MemoriesManager,
} from './managers/memories/memories-manager.js';
import {
  DropManager,
} from './managers/drop/drop-manager.js';
import {
  LandManager,
} from './managers/land/land-manager.js';
import {
  QueueManager,
} from './managers/queue/queue-manager.js';
import {
  TempManager,
} from './temp-manager.js';
import {
  FrameTracker,
} from './frame-tracker.js';
import {
  ComponentUiTracker,
} from './component-ui-tracker.js';
import {
  PhysicsTracker,
} from './physics/physics-tracker.js';
import {
  StoryManager,
  subtitlesModes,
} from './managers/story/story-manager.js';
import {
  EngineRenderer,
} from './renderers/engine-renderer.js';
import {
  DomRenderer,
} from './managers/dom-renderer/dom-renderer.js';
// import {
//   LiveChatManager,
// } from './managers/livechat/livechat-manager.js';
import {
  ParticleSystemManager,
} from './managers/particle-system/particle-system-manager.js';
import {
  PictureInPictureManager,
} from './managers/picture-in-picture/PictureInPictureManager.js';
import {
  RelationshipsManager,
} from './managers/relationships/relationships-manager.js';
import {
  PresenceManager,
} from './managers/presence/presence-manager.js';
import {
  getAudioContext,
  disposeUnmuteAudioContextHandle,
} from './audio-context.js';
// import {
//   FloorManager,
// } from './managers/floor/floor-manager.js';
// import {
//   LoadingManager,
// } from './managers/loading/loading-manager.js';
// import {
//   StoryModeManager,
// } from './managers/story-mode/story-mode-manager.js';

import {
  XRManager,
} from './managers/xr/xr-manager.js';

import { 
  NotificationsManager
} from './managers/notifications/notifications-manager.js';

import mobile from 'is-mobile';
//

export class EngineRuntime {
  #canvas;
  #context;
  #engine;

  constructor({
    canvas,
    context,
    engine,
  }) {
    // members
    this.#canvas = canvas;
    this.#context = context;
    this.#engine = engine;

    // locals
    const {
      loadingManager,
    } = context;

    this.audioContext = getAudioContext();
    this.audioManager = new AudioManager({
      audioContext: this.audioContext,
    });
    this.sounds = new Sounds({
      audioManager: this.audioManager,
      loadingManager,
    });
    this.voices = new Voices();
    this.aiClient = new AiClient();

    // this.camera = makeDefaultPerspectiveCamera();
    this.engineRenderer = new EngineRenderer();
    this.postProcessing = new PostProcessing({
      engineRenderer: this.engineRenderer,
      // cameraManager,
      // playersManager,
    });
    this.domRenderer = new DomRenderer({
      engine: this.#engine,
    });

    this.historyManager = new HistoryManager();

    this.engineAppContextFactory = new EngineAppContextFactory({
      engine: this.#engine,
    });
    this.importManager = new ImportManager({
      engineAppContextFactory: this.engineAppContextFactory,
      loadingManager,
    });
    this.appManagerContext = new AppManagerContext({
      importManager: this.importManager,
      appContextFactory: this.engineAppContextFactory,
    });

    this.tempManager = new TempManager();
    // this.router = new Router();
    this.frameTracker = new FrameTracker();
    this.componentUiTracker = new ComponentUiTracker();

    this.sfxManager = new SfxManager({
      engineRenderer: this.engineRenderer,
      audioManager: this.audioManager,
      sounds: this.sounds,
    });

    this.lightingManager = new LightingManager();
    this.skyManager = new SkyManager({
      lightingManager: this.lightingManager,
    });
    this.environmentManager = new EnvironmentManager({
      engineRenderer: this.engineRenderer,
    });

    this.physicsTracker = new PhysicsTracker({
      physicsManager: physicsManager,
    });

    this.voiceQueueManager = new QueueManager();
    this.hupsManager = new HupsManager({
      voiceQueueManager: this.voiceQueueManager,
      engineRenderer: this.engineRenderer,
      lightingManager: this.lightingManager,
      // ioBus: this.ioBus,
    });

    this.playersManager = new PlayersManager({
      audioManager: this.audioManager,
      sounds: this.sounds,
      voices: this.voices,
      physicsTracker: this.physicsTracker,
      engineRenderer: this.engineRenderer,
      environmentManager: this.environmentManager,
      hupsManager: this.hupsManager,
      importManager: this.importManager,
      appContextFactory: this.engineAppContextFactory,
      sfxManager: this.sfxManager,
      engine: this.#engine,
    });

    this.chatMemoriesManager = new MemoriesManager({
      supabaseClient: this.#context.supabaseClient,
      schema: {
        tableName: 'ai_chat',
        // nameKey: 'world_id',
        matchRawFn: 'match_ai_chat',
        matchNameFn: 'match_ai_chat_name',
      },
    });
    this.characterMemoriesManager = new MemoriesManager({
      supabaseClient: this.#context.supabaseClient,
      schema: {
        tableName: 'ai_memories',
        // nameKey: 'name',
        matchRawFn: 'match_ai_memories',
        matchNameFn: 'match_ai_memories_name',
      },
    });
    this.chatManager = new ChatManager({
      playersManager: this.playersManager,
      audioManager: this.audioManager,
      voiceQueueManager: this.voiceQueueManager,
      supabaseClient: this.#context.supabaseClient,
      chatMemoriesManager: this.chatMemoriesManager,
      characterMemoriesManager: this.characterMemoriesManager,
    });
    this.loreManager = new RenderedLoreManager({
      context,
      engine: this.#engine,
      aiClient: this.aiClient,
      engineRenderer: this.engineRenderer,
      physicsTracker: this.physicsTracker,
      playersManager: this.playersManager,
      chatManager: this.chatManager,
      characterMemoriesManager: this.characterMemoriesManager,
      appManagerContext: this.appManagerContext,
    });
    this.assetCache = new AssetCache();

    this.dropManager = new DropManager();

    this.pointerLockManager = new PointerLockManager({
      engine: this.#engine,
      // ioBus: this.ioBus,
    });
    this.cameraManager = new CameraManager({
      engine: this.#engine,
      engineRenderer: this.engineRenderer,
      postProcessing: this.postProcessing,
      playersManager: this.playersManager,
      pointerLockManager: this.pointerLockManager,
      appManagerContext: this.appManagerContext,
      // ioBus: this.ioBus,
    });

    this.spawnManager = new SpawnManager({
      engineRenderer: this.engineRenderer,
      cameraManager: this.cameraManager,
      playersManager: this.playersManager,
    });
    this.autoSpawnManager = new AutoSpawnManager({
      appManagerContext: this.appManagerContext,
      spawnManager: this.spawnManager,
      physicsTracker: this.physicsTracker,
    });

    this.characterSelectManager = new CharacterSelectManager();

    this.spriteLoader = new SpriteLoader({
      engineRenderer: this.engineRenderer,
      importManager: this.importManager,
      physicsTracker: this.physicsTracker,
    });
    this.textureAtlasLoader = new TextureAtlasLoader();

    this.raycastManager = new RaycastManager({
      engineRenderer: this.engineRenderer,
      cameraManager: this.cameraManager,
      world: this.world,
      physicsTracker: this.physicsTracker,
    });
    this.zTargetingManager = new ZTargetingManager({
      engineRenderer: this.engineRenderer,
      cameraManager: this.cameraManager,
      playersManager: this.playersManager,
      physicsTracker: this.physicsTracker,
      sounds: this.sounds,
    });
    this.cameraTargetingManager = new CameraTargetingManager({
      engineRenderer: this.engineRenderer,
      cameraManager: this.cameraManager,
      playersManager: this.playersManager,
      physicsTracker: this.physicsTracker,
    });

    this.appTracker = new AppTracker({
      appManagerContext: this.appManagerContext,
    });
    this.autoCameraManager = new AutoCameraManager({
      engineRenderer: this.engineRenderer,
      playersManager: this.playersManager,
      postProcessing: this.postProcessing,
      // appTracker: this.appTracker,
      loreManager: this.loreManager,
    });

    this.partyManager = new PartyManager({
      playersManager: this.playersManager,
      characterSelectManager: this.characterSelectManager,
      importManager: this.importManager,
      loreManager: this.loreManager,
      engine: this.#engine,
    });

    this.emoteManager = new EmoteManager({
      playersManager: this.playersManager,
      // ioBus: this.ioBus,
    });

    this.hitManager = new HitManager({
      engineRenderer: this.engineRenderer,
      playersManager: this.playersManager,
      physicsTracker: this.physicsTracker,
      sounds: this.sounds,
    });
    this.npcManager = new NpcManager({
      audioManager: this.audioManager,
      sounds: this.sounds,
      voices: this.voices,
      physicsTracker: this.physicsTracker,
      engineRenderer: this.engineRenderer,
      environmentManager: this.environmentManager,
      hupsManager: this.hupsManager,
      engine: this.#engine,
      characterSelectManager: this.characterSelectManager,
      hitManager: this.hitManager,
      importManager: this.importManager,
      sfxManager: this.sfxManager,
      appContextFactory: this.engineAppContextFactory,
      loreManager: this.loreManager,
    });
    this.mobManager = new MobManager({
      playersManager: this.playersManager,
      importManager: this.importManager,
      engineAppContextFactory: this.engineAppContextFactory,
      physicsTracker: this.physicsTracker,
    });

    this.interactionManager = new InteractionManager({
      cameraManager: this.cameraManager,
      playersManager: this.playersManager,
      appManagerContext: this.appManagerContext,
      // ioManager: this.ioManager,
      engineRenderer: this.engineRenderer,
      physicsTracker: this.physicsTracker,
    });
    this.worldManager = new WorldManager({
      worldClient: this.#context.worldClient,
      appManagerContext: this.appManagerContext,
      supabaseClient: this.#context.supabaseClient,
      playersManager: this.playersManager,
      autoCameraManager: this.autoCameraManager,
      engineRenderer: this.engineRenderer,
    });

    this.storyManager = new StoryManager({
      context,
      engine: this.#engine,
      aiClient: this.aiClient,
      appTracker: this.appTracker,
      engineRenderer: this.engineRenderer,
      cameraManager: this.cameraManager,
      autoCameraManager: this.autoCameraManager,
      emoteManager: this.emoteManager,
      playersManager: this.playersManager,
      npcManager: this.npcManager,
      chatManager: this.chatManager,
      voiceQueueManager: this.voiceQueueManager,
      interactionManager: this.interactionManager,
      zTargetingManager: this.zTargetingManager,
      worldClient: this.#context.worldClient,
      worldManager: this.worldManager,
      loreManager: this.loreManager,
      physicsTracker: this.physicsTracker,
      sounds: this.sounds,
    });

    this.isMobile = mobile();
    if (!this.isMobile) {
      this.storyManager.storySubtitles.setMode(subtitlesModes[1]);
    }

    this.ioManager = new IoManager({
      engine: this.#engine,
      cameraManager: this.cameraManager,
      pointerLockManager: this.pointerLockManager,
      raycastManager: this.raycastManager,
      engineRenderer: this.engineRenderer,
      playersManager: this.playersManager,
      storyManager: this.storyManager,
      zTargetingManager: this.zTargetingManager,
      // ioBus: this.ioBus,
    });

    this.landManager = new LandManager({
      engineRenderer: this.engineRenderer,
      cameraManager: this.cameraManager,
      playersManager: this.playersManager,
      appManagerContext: this.appManagerContext,
      appTracker: this.appTracker,
    });

    this.loadoutManager = new LoadoutManager({
      engineRenderer: this.engineRenderer,
      playersManager: this.playersManager,
    });
    this.widgetManager = new WidgetManager();
    this.transformControlsManager = new TransformControlsManager({
      engineRenderer: this.engineRenderer,
      physicsTracker: this.physicsTracker,
      appManagerContext: this.appManagerContext,
      raycastManager: this.raycastManager,
    });
    this.musicManager = new MusicManager({
      audioManager: this.audioManager,
    });
    // this.renderSettingsManager = new RenderSettingsManager({
    //   postProcessing: this.postProcessing,
    // });
    this.backgroundFx = new BackgroundFx();

    this.microphoneManager = new MicrophoneManager();
    this.xrManager = new XRManager({
      engineRenderer: this.engineRenderer,
      cameraManager: this.cameraManager,
    });
    this.embodimentManager = new EmbodimentManager({
      engineRenderer: this.engineRenderer,
      audioManager: this.audioManager,
      cameraManager: this.cameraManager,
      playersManager: this.playersManager,
      chatManager: this.chatManager,
      voiceQueueManager: this.voiceQueueManager,
      xrManager: this.xrManager,
      tempManager: this.tempManager,
    });

    // this.liveChatManager = new LiveChatManager({
    //   ioBus: this.ioBus,
    //   playersManager: this.playersManager,
    //   sceneManager: this.sceneManager,
    //   npcManager: this.npcManager,
    //   chatManager: this.chatManager,
    //   cameraManager: this.cameraManager,
    //   hupsManager: this.hupsManager,
    //   zTargetingManager: this.zTargetingManager,
    // });

    this.game = new GameManager({
      engineRenderer: this.engineRenderer,
      ioManager: this.ioManager,
      cameraManager: this.cameraManager,
      playersManager: this.playersManager,
      loadoutManager: this.loadoutManager,
      interactionManager: this.interactionManager,
      raycastManager: this.raycastManager,
      storyManager: this.storyManager,
      appManagerContext: this.appManagerContext,
      hitManager: this.hitManager,
      dropManager: this.dropManager,
      sounds: this.sounds,
      zTargetingManager: this.zTargetingManager,
    });

    this.particleSystemManager = new ParticleSystemManager({
      camera: this.camera,
    });

    this.pictureInPictureManager = new PictureInPictureManager({
      engineRenderer: this.engineRenderer,
      tempManager: this.tempManager,
    });

    this.relationshipsManager = new RelationshipsManager({
      supabaseClient: this.#context.supabaseClient,
    });
    this.presenceManager = new PresenceManager({
      supabaseClient: this.#context.supabaseClient,
      playersManager: this.playersManager,
    });

    this.notificationsManager = new NotificationsManager({
      chatManager: this.chatManager,
      relationshipsManager: this.relationshipsManager,
    });

    // this.floorManager = new FloorManager({
    //   physicsTracker: this.physicsTracker,
    // });

    // bind scene
    const _addSceneObjects = () => {
      const {scene} = this.engineRenderer;

      scene.add(this.playersManager);
      this.playersManager.updateMatrixWorld();

      scene.add(this.npcManager);
      this.npcManager.updateMatrixWorld();

      scene.add(this.mobManager);
      this.mobManager.updateMatrixWorld();

      scene.add(this.zTargetingManager);
      this.zTargetingManager.updateMatrixWorld();

      scene.add(this.cameraTargetingManager);
      this.cameraTargetingManager.updateMatrixWorld();

      scene.add(this.loreManager);
      this.loreManager.updateMatrixWorld();

      scene.add(this.xrManager);
      this.xrManager.updateMatrixWorld();

      // scene.add(this.realmManager);
      // this.realmManager.updateMatrixWorld();

      scene.add(this.interactionManager);
      this.interactionManager.updateMatrixWorld();

      // scene.add(this.liveChatManager);
      // this.liveChatManager.updateMatrixWorld();

      // scene.add(this.storyModeManager);
      // this.storyModeManager.updateMatrixWorld();
    };
    _addSceneObjects();
  }

  #loadPromise = null;
  waitForLoad() {
    if (!this.#loadPromise) {
      // trigger audio manager to resume if it can
      this.audioManager.waitForStart();

      this.#loadPromise = (async () => {
        await Promise.all([
          this.sounds.waitForLoad(),
          // this.floorManager.waitForLoad(),
          this.landManager.waitForLoad(),
        ]);
      })();
    }
    return this.#loadPromise;
  }

  getCanvas() {
    return this.engineRenderer.renderer.domElement;
  }
  setCanvas(canvas) {
    this.engineRenderer.setCanvas(canvas);
  }

  createMultiplayer() {
    return new Multiplayer({
      playersManager: this.playersManager,
      spawnManager: this.spawnManager,
      engine: this,
      characterSelectManager: this.characterSelectManager,
      audioManager: this.audioManager,
      embodimentManager: this.embodimentManager,
      physicsTracker: this.physicsTracker,
      importManager: this.importManager,
      appContextFactory: this.engineAppContextFactory,
    });
  }

  render(timestamp, timeDiff, frame) {
    this.engineRenderer.render();
  }

  async spawn() {
    await this.spawnManager.spawn();
  }

  start() {
    const {renderer, camera} = this.engineRenderer;

    let lastTimestamp = performance.now();
    const animate = (timestamp, frame) => {
      timestamp = timestamp ?? performance.now();
      const timeDiff = timestamp - lastTimestamp;
      const timeDiffCapped = Math.min(Math.max(timeDiff, 0), 100);

      const _pre = () => {
        const {renderer} = this.engineRenderer;
        const session = renderer.xr.getSession();
        // const referenceSpace = renderer.xr.getReferenceSpace();
        const xrAvatarPose = session && XRManager.getXrAvatarPose(renderer);
        this.xrManager.update();

        this.ioManager.update(timeDiffCapped, xrAvatarPose);

        const physicsScene = physicsManager.getScene();
        // if (this.contentLoaded /* && physicsScene.getPhysicsEnabled() */) {
          physicsScene.simulatePhysics(timeDiffCapped);
          physicsScene.getTriggerEvents();
          // npcAiManager.update(timestamp, timeDiffCapped);
          // npcManager.updatePhysics(timestamp, timeDiffCapped);
        // }

        this.playersManager.updateAvatars(timestamp, timeDiffCapped, camera, session, xrAvatarPose);
        this.npcManager.updateAvatars(timestamp, timeDiffCapped);
        // npcManager.updateAvatar(timestamp, timeDiffCapped);
        // this.playersManager.updateRemotePlayers(timestamp, timeDiffCapped);
        this.mobManager.update(timestamp, timeDiffCapped);

        this.landManager.update(timestamp, timeDiffCapped);
        this.widgetManager.update(timestamp, timeDiffCapped);
        this.transformControlsManager.update(timestamp, timeDiffCapped);

        this.frameTracker.update(timestamp, timeDiffCapped);
        // this.domRenderer.update(timestamp, timeDiffCapped);

        // transformControls.update();
        this.raycastManager.update(timestamp, timeDiffCapped);
        this.zTargetingManager.update(timestamp, timeDiffCapped);
        this.cameraTargetingManager.update(timestamp, timeDiffCapped);
        this.game.update(timestamp, timeDiffCapped);
        this.interactionManager.update(timestamp, timeDiffCapped);

        // const rootRealm = this.realmManager.getRootRealm();
        // rootRealm.appManager.tick(timestamp, timeDiffCapped, frame);

        // this.mobManager.update(timestamp, timeDiffCapped);
        // this.hpManager.update(timestamp, timeDiffCapped); // XXX unlock this
        // questManager.update(timestamp, timeDiffCapped);
        this.particleSystemManager.update(timestamp, timeDiffCapped);

        this.hupsManager.update(timestamp, timeDiffCapped);
        this.loreManager.update(timestamp, timeDiffCapped);
        this.sfxManager.update(timestamp, timeDiffCapped);

        this.cameraManager.updatePost(timestamp, timeDiffCapped);
        this.ioManager.updatePost();

        this.tempManager.reset();

        lastTimestamp = timestamp;
      };
      _pre();

      // render scenes
      // this.dioramaManager.update(timestamp, timeDiffCapped);
      this.loadoutManager.update(timestamp, timeDiffCapped);

      {
        // const popRenderSettings = this.renderSettingsManager.push(
        //   this.engineRenderer.rootScene,
        //   undefined,
        //   {
        //     postProcessing: this.postProcessing,
        //   }
        // );

        this.pictureInPictureManager.render();

        this.render(timestamp, timeDiffCapped, frame);

        // popRenderSettings();
      }

      // console.log('frame end');
    }
    renderer.setAnimationLoop(animate);

    // _startHacks(this);
  }
  stop() {
    this.engineRenderer.renderer && this.engineRenderer.renderer.setAnimationLoop(null);
  }

  destroy() {
    this.stop();

    // this.realmManager.destroy();
    this.pointerLockManager.destroy();
    // this.floorManager.destroy();

    this.engineRenderer.renderer && this.engineRenderer.renderer.dispose();

    this.appManagerContext.destroy();

    this.notificationsManager.destroy();

    // Dispose unmute handle of audio context
    disposeUnmuteAudioContextHandle()
  }
}

/* const _startHacks = webaverse => {
  const localPlayer = playersManager.getLocalPlayer();
  const vpdAnimations = Avatar.getAnimations().filter(animation => animation.name.endsWith('.vpd'));

  // Press } to debug current state in console.
  (typeof window !== 'undefined') && window.addEventListener('keydown', event => {
    if (event.key === '}') {
      console.log('>>>>> current state');
      console.log(universe.state);
      console.log('>>>>> scene');
      console.log(scene);
      console.log('>>>>> local player');
      console.log(localPlayer);
      console.log('>>>>> remote players');
      console.log(playersManager.getRemotePlayers());
    }
  });

  const lastEmotionKey = {
    key: -1,
    timestamp: 0,
  };
  let emotionIndex = -1;
  let poseAnimationIndex = -1;
  const _emotionKey = key => {
    const timestamp = performance.now();
    if ((timestamp - lastEmotionKey.timestamp) < 1000) {
      const key1 = lastEmotionKey.key;
      const key2 = key;
      emotionIndex = (key1 * 10) + key2;

      lastEmotionKey.key = -1;
      lastEmotionKey.timestamp = 0;
    } else {
      lastEmotionKey.key = key;
      lastEmotionKey.timestamp = timestamp;
    }
  };
  const _updateFacePose = () => {
    const oldFacePoseActionIndex = localPlayer.findActionIndex(action => action.type === 'facepose' && /^emotion-/.test(action.emotion));
    if (oldFacePoseActionIndex !== -1) {
      localPlayer.removeActionIndex(oldFacePoseActionIndex);
    }
    if (emotionIndex !== -1) {
      const emoteAction = {
        type: 'facepose',
        emotion: `emotion-${emotionIndex}`,
        value: 1,
      };
      localPlayer.addAction(emoteAction);
    }
  };
  const _updatePose = () => {
    localPlayer.removeAction('pose');
    if (poseAnimationIndex !== -1) {
      const animation = vpdAnimations[poseAnimationIndex];
      const poseAction = {
        type: 'pose',
        animation: animation.name,
      };
      localPlayer.addAction(poseAction);
    }
  };
  webaverse.titleCardHack = false;
  // let haloMeshApp = null;
  (typeof window !== 'undefined') && window.addEventListener('keydown', e => {
    if (e.which === 46) { // .
      emotionIndex = -1;
      _updateFacePose();
    } else if (e.which === 107) { // +
      poseAnimationIndex++;
      poseAnimationIndex = Math.min(Math.max(poseAnimationIndex, -1), vpdAnimations.length - 1);
      _updatePose();

      // _ensureMikuModel();
      // _updateMikuModel();
    } else if (e.which === 109) { // -
      poseAnimationIndex--;
      poseAnimationIndex = Math.min(Math.max(poseAnimationIndex, -1), vpdAnimations.length - 1);
      _updatePose();

      // _ensureMikuModel();
      // _updateMikuModel();
    } else if (e.which === 106) { // *
      webaverse.titleCardHack = !webaverse.titleCardHack;
      webaverse.dispatchEvent(new MessageEvent('titlecardhackchange', {
        data: {
          titleCardHack: webaverse.titleCardHack,
        },
      }));
    } else if (e.code === 'Home') { // home
      const quality = settingsManager.adjustCharacterQuality(-1);
      game.setAvatarQuality(quality);
    } else if (e.code === 'End') { // end
      const quality = settingsManager.adjustCharacterQuality(1);
      game.setAvatarQuality(quality);
    } else {
      const match = e.code.match(/^Numpad([0-9])$/);
      if (match) {
        const key = parseInt(match[1], 10);
        _emotionKey(key);
        _updateFacePose();
      }
    }
  });
}; */
