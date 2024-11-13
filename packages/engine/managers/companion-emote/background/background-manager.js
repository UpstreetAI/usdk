import * as THREE from 'three';

// import faceposes from '../../emote/faceposes.json';
import emotes from '../emotes.json';

import { canvasDimensions } from '../../../constants/companion-constants.js';

import backgroundFx from '../../../background-fx/background-fx.js';
import {OutlineBgFxMesh} from '../../../background-fx/OutlineBgFx.js';
import {NoiseBgFxMesh} from '../../../background-fx/NoiseBgFx.js';
import {PoisonBgFxMesh} from '../../../background-fx/PoisonBgFx.js';
import {SmokeBgFxMesh} from '../../../background-fx/SmokeBgFx.js';
import {GlyphBgFxMesh} from '../../../background-fx/GlyphBgFx.js';
import {DotsBgFxMesh} from '../../../background-fx/DotsBgFx.js';
import {LightningBgFxMesh} from '../../../background-fx/LightningBgFx.js';
import {RadialBgFxMesh} from '../../../background-fx/RadialBgFx.js';
import {GrassBgFxMesh} from '../../../background-fx/GrassBgFx.js';
import {RainBgFxMesh} from '../../../background-fx/RainBgFx.js';

import {SpriteBgFx} from '../../../background-fx/SpriteBgFx.js';
import {spriteInfos} from './constants.js';

//

const initEmotesObject = (o, n) => {
  for (const emote of emotes) {
    o[emote.name] = n;
  }
  return o;
};

//

export default class BackgroundManager {
  constructor(camera, renderer, scene, player) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    this.player = player;
    
    const [width, height] = canvasDimensions;
    this.width = width;
    this.height = height;

    this.currentMesh = null;

    this.#initBgMeshes();
  }

  setUpManager(camera, renderer, scene, player) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    this.player = player;

    this.scene.add(this.outlineMesh);
    this.scene.add(this.noiseMesh);
    this.scene.add(this.poisonMesh);
    this.scene.add(this.smokeMesh);
    this.scene.add(this.glyphMesh);
    this.scene.add(this.dotsMesh);
    this.scene.add(this.lightningMesh);
    this.scene.add(this.radialMesh);
    this.scene.add(this.grassMesh);
    this.scene.add(this.rainMesh);
    this.scene.add(this.spriteMesh);
  }

  #initBgMeshes() {
    const engineRenderer = {renderer: this.renderer}
    const meshOpts = {
      engineRenderer,
    };
    this.outlineMesh = new OutlineBgFxMesh();
    // this.scene.add(this.outlineMesh);
    this.outlineMesh.visible = false;

    this.noiseMesh = new NoiseBgFxMesh(meshOpts);
    // this.scene.add(this.noiseMesh);
    this.noiseMesh.visible = false;

    this.poisonMesh = new PoisonBgFxMesh(meshOpts);
    // this.scene.add(this.poisonMesh);
    this.poisonMesh.visible = false;

    this.smokeMesh = new SmokeBgFxMesh(meshOpts);
    // this.scene.add(this.smokeMesh);
    this.smokeMesh.visible = false;

    this.glyphMesh = new GlyphBgFxMesh();
    // this.scene.add(this.glyphMesh);
    this.glyphMesh.visible = false;

    this.dotsMesh = new DotsBgFxMesh();
    // this.scene.add(this.dotsMesh);
    this.dotsMesh.visible = false;

    this.lightningMesh = new LightningBgFxMesh();
    // this.scene.add(this.lightningMesh);
    this.lightningMesh.visible = false;

    this.radialMesh = new RadialBgFxMesh();
    // this.scene.add(this.radialMesh);
    this.radialMesh.visible = false;

    this.grassMesh = new GrassBgFxMesh();
    // this.scene.add(this.grassMesh);
    this.grassMesh.visible = false;

    this.rainMesh = new RainBgFxMesh();
    // this.scene.add(this.rainMesh);
    this.rainMesh.visible = false;

    this.spriteMesh = new SpriteBgFx();
    this.spriteMesh.animationRepeated = false;
    // this.scene.add(this.spriteMesh);
    this.spriteMesh.visible = false;

    //

    this.emotionMeshes = initEmotesObject({}, null);
    this.emotionMeshes.angry = this.spriteMesh;
    this.emotionMeshes.sad = this.spriteMesh;
    this.emotionMeshes.embarrassed = this.spriteMesh;
    this.emotionMeshes.confused = this.spriteMesh;
    this.emotionMeshes.surprise = this.spriteMesh;
    this.emotionMeshes.victory = this.spriteMesh;
    this.emotionMeshes.excited = this.dotsMesh;
    this.emotionMeshes.searching = this.rainMesh;
    this.emotionMeshes.typing = this.rainMesh;

    this.counts = initEmotesObject({}, 0);
  }

  addEmotion(emotion) {
    if (this.counts[emotion] === undefined) {
      debugger;
    }

    const startEmotion = emotion => {
      if (this.currentMesh) {
        this.currentMesh.visible = false;
        this.currentMesh = null;
      }

      const setSprite = (type) => {
        this.spriteMesh.animationRepeated = spriteInfos[type].repeated;
        this.spriteMesh.width = spriteInfos[type].width;
        this.spriteMesh.height = spriteInfos[type].height;
        this.spriteMesh.frames = spriteInfos[type].frames;
        this.spriteMesh.material.uniforms.frameSize.value.set(this.spriteMesh.width, this.spriteMesh.height);
        this.spriteMesh.index = 0;
      }

      switch (emotion) {
        case 'agree': {
          console.log(emotion)
          break;
        }
        case 'angry': {
          this.spriteMesh.material.uniforms.spriteSheetTexture.value = this.spriteMesh.textures.fireTexture;
          setSprite('fireTexture');
          break;
        }
        case 'apologetic': {
          console.log(emotion)
          break;
        }
        case 'confused': {
          this.spriteMesh.material.uniforms.spriteSheetTexture.value = this.spriteMesh.textures.confusedTexture;
          setSprite('confusedTexture');
          break;
        }
        case 'cry': {
          console.log(emotion)
          break;
        }
        case 'disagree': {
          // this.spriteMesh.material.uniforms.spriteSheetTexture.value = this.spriteMesh.textures.sadTexture;
          // setSprite('sadTexture');
          break;
        }
        case 'embarrassed': {
          this.spriteMesh.material.uniforms.spriteSheetTexture.value = this.spriteMesh.textures.overcastTexture2;
          setSprite('overcastTexture');
          break;
        }
        case 'excited': {
          console.log(emotion)
          break;
        }
        case 'typing':
        case 'searching': {
          console.log(emotion)
          break;
        }
        case 'sad': {
          this.spriteMesh.material.uniforms.spriteSheetTexture.value = this.spriteMesh.textures.overcastTexture;
          setSprite('overcastTexture');
          break;
        }
        case 'surprise': {
          this.spriteMesh.material.uniforms.spriteSheetTexture.value = this.spriteMesh.textures.speedlineTexture;
          setSprite('speedlineTexture');
          break;
        }
        case 'victory': {
          this.spriteMesh.material.uniforms.spriteSheetTexture.value = this.spriteMesh.textures.speedlineTexture2;
          setSprite('speedlineTexture2');
          break;
        }
        default: {
          break;
        }
      }

      const mesh = this.emotionMeshes[emotion];
      if (mesh) {
        this.currentMesh = mesh;
        this.currentMesh.visible = true;
      }
    };
    if (++this.counts[emotion] === 1) {
      startEmotion(emotion);
    }
  }

  removeEmotion(emotion) {
    if (this.counts[emotion] === undefined) {
      debugger;
    }

    // if (this.currentMesh && this.currentMesh.visible) {
    //   this.currentMesh.visible = false;
    //   this.currentMesh = null;
    // }

    const stopEmotion = emotion => {
      const mesh = this.emotionMeshes[emotion];
      if (mesh) {
        if (this.currentMesh === mesh) {
          this.currentMesh.visible = false;
          this.currentMesh = null;
        }
      }
    };
    if (--this.counts[emotion] === 0) {
      stopEmotion(emotion);
    }
  }

  setPlayer(player) {
    this.player = player;
    this.avatar = this.player.avatar;
  }

  update(timestamp, timeDiff) {
    this.outlineMesh.visible && this.outlineMesh.update(timestamp, timeDiff, this.width, this.height);
    this.noiseMesh.visible && this.noiseMesh.update(timestamp, timeDiff, this.width, this.height);
    this.poisonMesh.visible && this.poisonMesh.update(timestamp, timeDiff, this.width, this.height);
    this.smokeMesh.visible && this.smokeMesh.update(timestamp, timeDiff, this.width, this.height);
    this.glyphMesh.visible && this.glyphMesh.update(timestamp, timeDiff, this.width, this.height);
    this.dotsMesh.visible && this.dotsMesh.update(timestamp, timeDiff, this.width, this.height);
    this.lightningMesh.visible && this.lightningMesh.update(timestamp, timeDiff, this.width, this.height);
    this.radialMesh.visible && this.radialMesh.update(timestamp, timeDiff, this.width, this.height);
    this.grassMesh.visible && this.grassMesh.update(timestamp, timeDiff, this.width, this.height);
    this.rainMesh.visible && this.rainMesh.update(timestamp, timeDiff, this.width, this.height);


    // handle sprite sheet
    const width = this.spriteMesh.width;
    const height = this.spriteMesh.height;
    const frames = this.spriteMesh.frames;
    const index = this.spriteMesh.index;
    this.spriteMesh.material.uniforms.textureOffset.value.set(
      (index % width) * (1. / width), 
      ((height - 1) / height) - Math.floor(index / width) * (1 / height)
    );
    this.spriteMesh.index ++;
    if (this.spriteMesh.index >= frames) {
      if (this.spriteMesh.animationRepeated) {
        this.spriteMesh.index = 0;
      }
      else {
        this.spriteMesh.visible = false;
      }
    }
  }

  setBackground(type) {
    switch (type) {
      case 'outline': {
        this.currentMesh = this.outlineMesh;
        break;
      }
      case 'noise': {
        this.currentMesh = this.noiseMesh;
        break;
      }
      case 'poison': {
        this.currentMesh = this.poisonMesh;
        break;
      }
      case 'smoke': {
        this.currentMesh = this.smokeMesh;
        break;
      }
      case 'glyph': {
        this.currentMesh = this.glyphMesh;
        break;
      }
      case 'dots': {
        this.currentMesh = this.dotsMesh;
        break;
      }
      case 'lightning': {
        this.currentMesh = this.lightningMesh;
        break;
      }
      case 'radial': {
        this.currentMesh = this.radialMesh;
        break;
      }
      case 'grass': {
        this.currentMesh = this.grassMesh;
        break;
      }
      case 'rain': {
        this.currentMesh = this.rainMesh;
        break;
      }
      default: {
        break;
      }
    }
    if (this.currentMesh) {
      this.currentMesh.visible = true;
    }
      
  }

  static async waitForLoad() {
    await backgroundFx.waitForLoad();
  }
}