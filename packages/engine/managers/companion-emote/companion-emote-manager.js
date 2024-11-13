import BackgroundManager from "./background/background-manager.js";
import ParticleManager from "./particle/particle-manager.js";
import SoundManager from "./sound/sound-manager.js";
// import { emoteAnimationMapping } from "./constants.js";
import {MathUtils} from 'three';

import {
  emoteAnimations,
} from "../../avatars/animationHelpers.js";
import emotes from './emotes.json';
import faceposes from '../emote/faceposes.json';

//

class TimeTracker {
  constructor({
    startTime,
    duration,
  }) {
    this.startTime = startTime;
    this.duration = duration;
  }
  update(now) {
    return now - this.startTime >= this.duration;
  }
}

//

class MoodTracker extends TimeTracker {
  constructor({
    action,
    actionManager,
    startTime,
    duration,
  }) {
    super({
      startTime,
      duration,
    });

    this.actionManager = actionManager;
    this.action = this.actionManager.addAction(action);
  }
  finish() {
    const now = performance.now();

    this.startTime = now;
    this.duration = this.action.fadeOut ?? 0;

    this.actionManager.updateAction(this.action, {
      startTime: now,
      fadeIn: 0,
      duration: 0,
    });
  }
  stop() {
    this.actionManager.removeAction(this.action);
  }
}

//

class EmoteTracker extends TimeTracker {
  constructor({
    emoteAction,
    faceposeAction,
    actionManager,
    particleManager,
    backgroundManager,
    soundManager,
    emotionName,
    startTime,
    duration,
  }) {
    super({
      startTime,
      duration,
    });
    this.emotionName = emotionName;
    this.actionManager = actionManager;
    this.emoteAction = this.actionManager.addAction(emoteAction);
    this.faceposeAction = this.actionManager.addAction(faceposeAction);

    this.particleManager = particleManager;
    this.backgroundManager = backgroundManager;
    this.soundManager = soundManager;

    this.particleManager.addEmotion(this.emotionName);
    this.backgroundManager.addEmotion(this.emotionName);
    this.soundManager.addEmotion(this.emotionName);
  }
  stop() {
    this.actionManager.removeAction(this.emoteAction);
    this.actionManager.removeAction(this.faceposeAction);

    this.particleManager.removeEmotion(this.emotionName);
    this.backgroundManager.removeEmotion(this.emotionName);
  }
}

//

export default class CompanionEmoteManager {
  constructor(camera, renderer, scene, player) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    this.player = player;
    this.trackers = new Set();
    // this.loaded = false;
    this.#init();
  }

  #init() {
    this.backgroundManager = new BackgroundManager(this.camera, this.renderer, this.scene, this.player);
    this.particleManager = new ParticleManager(this.camera, this.renderer, this.scene, this.player);
    this.soundManager = new SoundManager();

    // await Promise.all([
    //   this.particleManager.waitForLoad(),
    //   this.backgroundManager.waitForLoad(),
    // ]);
    
    this.particleManager.setUpManager(this.camera, this.renderer, this.scene, this.player);
    this.backgroundManager.setUpManager(this.camera, this.renderer, this.scene, this.player);
  }

  getFaceposeSpec(emotion) {
    const facepose = faceposes.find(facepose => facepose.name === emotion);
    if (facepose) {
      return facepose;
    } else {
      const emote = emotes.find(emote => emote.name === emotion);
      if (emote) {
        const {
          emotion,
        } = emote;
        return faceposes.find(facepose => facepose.name === emotion);
      } else {
        return void 0;
      }
    }
  }
  getEmoteSpec(emoteName) {
    const emote = emotes.find(emote => emote.name === emoteName) ??
      emotes.find(emote => emote.emotion === emoteName);
    return emote;
  }

  setMood(mood) {
    // clear old moods
    for (const oldTracker of this.trackers) {
      if (oldTracker instanceof MoodTracker) {
        oldTracker.finish();
        this.trackers.delete(oldTracker);
      }
    }

    // add new mood
    const faceposeSpec = this.getFaceposeSpec(mood);
    if (faceposeSpec) {
      mood = faceposeSpec.name;

      const startTime = performance.now();
      const duration = MathUtils.randInt(5000, 15000); // 5s ~ 15s
      const fadeIn = 0.1;
      const fadeOut = 0.1;
      const action = {
        type: 'facepose',
        emotion: mood,
        value: 1,
        startTime,
        fadeIn,
        duration,
        fadeOut,
      };
      const moodTracker = new MoodTracker({
        action,
        actionManager: this.player.actionManager,
        startTime,
        duration,
      });
      this.trackers.add(moodTracker);

      // console.log('add tracker', moodTracker, this.trackers);
    } else {
      console.warn('no such mood: ' + mood, faceposes);
    }
  }
  
  setEmotion(emotion) {
    const emoteSpec = this.getEmoteSpec(emotion);
    // console.log('got emote spec', {
    //   animation,
    //   emoteSpec,
    // });
    if (emoteSpec) {
      const animation = emoteSpec.animation;

      // emote
      const emoteAction = {
        type: 'emote',
        animation,
      };

      // facepose
      const startTime = performance.now();
      const {
        emotion,
      } = emoteSpec;
      const emoteAnimation = emoteAnimations[animation];
      const emoteAnimationDuration = emoteAnimation.duration;
      const fadeIn = 0.1;
      const duration = Math.max(emoteAnimationDuration - fadeIn, 0);
      const fadeOut = Math.random() * 0.5;
      const faceposeAction = {
        type: 'facepose',
        emotion,
        value: 1,
        fadeIn,
        duration,
        fadeOut,
        startTime,
      };

      const totalDuration = (duration + fadeOut) * 1000;
      const emoteTracker = new EmoteTracker({
        emoteAction,
        faceposeAction,
        actionManager: this.player.actionManager,
        particleManager: this.particleManager,
        backgroundManager: this.backgroundManager,
        soundManager: this.soundManager,
        emotionName: emoteSpec.name,
        startTime,
        duration: totalDuration,
      });
      // console.log('emote tracker', {
      //   emoteAction,
      //   faceposeAction,
      //   actionManager: this.player.actionManager,
      //   particleManager: this.particleManager,
      //   backgroundManager: this.backgroundManager,

      //   startTime,
      //   duration: totalDuration,
      // });
      this.trackers.add(emoteTracker);
      
      // const totalTime = duration + fadeIn + fadeOut;
      // this.startEmotionTime = this.timestamp;
      // this.emotionDuration = totalTime * 1000;
    } else {
      console.warn('no such emotion: ' + emotion, emotes);
    }
  }
  // removeEmotion() {
  //   const oldEmoteAction = this.player.actionManager.getActionType('emote');
  //   oldEmoteAction && this.player.actionManager.removeAction(oldEmoteAction);
  //   const oldFaceposeAction = this.player.actionManager.getActionType('facepose');
  //   oldFaceposeAction && this.player.actionManager.removeAction(oldFaceposeAction);
  //   this.particleManager.removeEmotion();
  //   this.backgroundManager.removeEmotion();
  // }

  update(timestamp, timeDiff) {
    this.timestamp = timestamp;

    // if (this.emotionDuration && this.timestamp - this.startEmotionTime > this.emotionDuration) {
    //   this.removeEmotion();
    //   this.emotionDuration = null;
    // }

    for (const tracker of this.trackers.values()) {
      const isDone = tracker.update(timestamp);
      if (isDone) {
        tracker.stop();
        this.trackers.delete(tracker);
      }
    }

    this.backgroundManager && this.backgroundManager.update(timestamp, timeDiff);
    this.particleManager && this.particleManager.update(timestamp, timeDiff);
  }

  static async waitForLoad() {
    await Promise.all([
      BackgroundManager.waitForLoad(),
      ParticleManager.waitForLoad(),
    ]);
  }
}