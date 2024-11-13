import * as THREE from 'three';
// import {
//   ChatGPTClient,
// } from './ai/chat/chatgpt.js';
// import {
//   loadImage,
//   // shuffle,
// } from '../../util.js';
import {
  StoryTeller,
  characterKeys,
} from '../../storyteller.js';
import {
  makePersonality,
  StoryTellerChatGPT,
} from '../../storyteller-chatgpt.js';

import {split} from 'sentence-splitter';

//

import physicsManager from '../../physics/physics-manager.js';
export class LiveChatManager extends THREE.Object3D {
  constructor({
    // iframe,
    // plugins = [],
    ioBus,
    playersManager,
    sceneManager,
    npcManager,
    chatManager,
    cameraManager,
    hupsManager,
    zTargetingManager,
  }) {
    super();

    this.ioBus = ioBus;
    this.playersManager = playersManager;
    this.sceneManager = sceneManager;
    this.npcManager = npcManager;
    this.chatManager = chatManager;
    this.cameraManager = cameraManager;
    this.hupsManager = hupsManager;
    this.zTargetingManager = zTargetingManager;
    // console.log('set hups manager', hupsManager, hupsManager.addEventListener);
    // if (!hupsManager) {
    //   debugger;
    // }

    this.enabled = false;

    zTargetingManager.addEventListener('select', e => {
      const {
        app,
      } = e;

      const playerSpec = app?.npc?.playerSpec;
      console.log('lock player spec', playerSpec);

      const characterName = playerSpec?.name ?? '';
      const player = Array.from(this.npcManager.npcPlayers.values()).find(p => {
        return p.name === characterName;
      }) ?? null;
      console.log('got player', player);
    });

    window.addEventListener('keydown', e => {
      if (e.key === '6') {
        // console.log('sweep 1');
        const physicsScene = physicsManager.getScene(); 
        
        const localPlayer = playersManager.getLocalPlayer();
        // const quaternion = localPlayer.quaternion.clone();
        // const quaternions = Array(4).fill().map(() => quaternion;)
        const quaternions = [
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0),
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/2),
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI),
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2),
        ].map(q => {
          q.multiply(localPlayer.quaternion);
          return q;
        });
        const origins = Array(4).fill().map((_, i) => {
          const position = localPlayer.position.clone();
          const quaternion = quaternions[i];
          position.add(new THREE.Vector3(0, 0, -0.5).applyQuaternion(quaternion));
          return position;
        });
        const halfExtent = new THREE.Vector3(0.5, 0.5, 0.01);
        const halfExtents = Array(4).fill().map(() => halfExtent);
        const directions = [
          new THREE.Vector3(0, 0, -1),
          new THREE.Vector3(-1, 0, 0),
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(1, 0, 0),
        ].map(d => {
          d.applyQuaternion(localPlayer.quaternion);
          return d;
        });
        const sweepDistance = 5;
        const n = origins.length;
        
        if (!physicsScene.sweepBoxesArray) {
          debugger;
        }
        const result = physicsScene.sweepBoxesArray(
          origins,
          quaternions,
          halfExtents,
          directions,
          sweepDistance,
          n
        );
        // console.log('sweep', result.hit.join(' '));
      }
    });

    this.storyTeller = null;

    //

    // skybox cube
    const geometry = new THREE.BoxGeometry(5000, 5000, 5000);
    // const material = new THREE.MeshBasicMaterial({
    //   map: new THREE.Texture(),
    //   side: THREE.BackSide,
    // });
    // full screen mesh
    // const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tex: {
          value: new THREE.Texture(),
          needsUpdate: true,
        },
      },
      vertexShader: `\
        varying vec2 vUv;

        void main() {
          vUv = uv;

          // geometry position trick to put in the background
          // gl_Position = vec4(position.xy, 1., 1.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `\
        uniform sampler2D tex;
        varying vec2 vUv;

        void main() {
          gl_FragColor = texture2D(tex, vUv);

          if (gl_FragColor.a == 0.) {
            // gl_FragColor.rgb = vec3(0.5);
            gl_FragColor.rgb = vec3(vUv.x, vUv.y, 0.) * 0.3;
            gl_FragColor.a = 1.;
          }
        }
      `,
      side: THREE.BackSide,
    });
    this.skyboxMesh = new THREE.Mesh(geometry, material);
    // this.skyboxMesh.visible = false;
    this.skyboxMesh.frustumCulled = false;
    this.add(this.skyboxMesh);

    //

    this.#listen();
  }
  async testVoiceQueue(text) {
    debugger;

    // stack
    let currentImg = null;
    
    // chat queue
    const maxNumPendingChatLines = 4;
    let numPendingChatLines = 0;
    const chatQueue = [];
    const waitForAvailableChat = () => new Promise((accept, reject) => {
      if (numPendingChatLines < maxNumPendingChatLines) {
        numPendingChatLines++;
        // console.log('num pending up', numPendingChatLines);
        accept();
      } else {
        chatQueue.push(accept);
      }
    });
    const tickNextChat = () => {
      numPendingChatLines--;
      const next = chatQueue.shift();
      if (next) {
        numPendingChatLines++;
        // console.log('num pending same', numPendingChatLines);
        next();
      } else {
        // nothing
        // console.log('num pending down', numPendingChatLines);
      }
    };

    // image queue
    const maxNumPendingImages = 4;
    let numPendingImages = 0;
    const imageQueue = [];
    const waitForAvailableImage = () => new Promise((accept, reject) => {
      if (numPendingImages < maxNumPendingImages) {
        numPendingImages++;
        // console.log('num pending up', numPendingChatLines);
        accept();
      } else {
        imageQueue.push(accept);
      }
    });
    const tickNextImage = () => {
      numPendingImages--;
      const next = imageQueue.shift();
      if (next) {
        numPendingImages++;
        // console.log('num pending same', numPendingChatLines);
        next();
      } else {
        // nothing
        // console.log('num pending down', numPendingChatLines);
      }
    };

    // match at 2 or more instances of \n:
    const lines = text.split(/\n{2,}/).filter(line => !!line);
    // const lines = split(text).map(l => l.raw.trim()).filter(line => !!line);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const localPlayer = this.playersManager.getLocalPlayer();

      let imageMatch, textMatch;
      if (imageMatch = line.match(/^IMAGE:\s*([\s\S]*)$/)) {
        // XXX check if the line is an image line
        // e.g. - [abc][]
        // const match = line.match(/^\[(.*?)\]/);

        await waitForAvailableImage();

        const prompt = imageMatch[1];
        // console.log('got image prompt', {line, prompt});

        const prompt2 = `${prompt}, anime style, studio ghibli style`;
        const imgPromise = genImage(prompt2);
        const waitable = {
          isWaitable: true,
          async waitForLoad() {
            // console.log('load image 1', {prompt});
            const img = await imgPromise;
            // console.log('load image 2', {prompt});
            
            if (currentImg) {
              currentImg.remove();
              currentImg = null;
            }

            document.body.appendChild(img);
            currentImg = img;
          },
        };
        localPlayer.voicer.start(waitable).then(() => {
          tickNextImage();
        });
      } else if (textMatch = line.match(/^(?:TEXT:)?\s*([\s\S]*)$/)) {
        const text = textMatch[1];

        const sentences = split(text).map(l => l.raw.trim()).filter(line => !!line);
        // for (let i = 0; i < sentences.length; i++) {
        for (let i = 0; i < 2; i++) {
          const sentence = sentences[i];
          
          await waitForAvailableChat();
          
          // console.log('got sentence', {line, sentence});
          // const preloadMessage = globalThis.preloadVoiceMessage(line);
          
          const preloadMessage = localPlayer.voicer.preloadMessage(sentence);
          localPlayer.voicer.start(preloadMessage).then(() => {
            tickNextChat();
          });
        }
      } else {
        console.warn('unrecognized line', line);
      }
    }
  }
  #listen() {
    // live chat
    this.ioBus.registerHandler('toggleLiveChat', async e => {
      const {
        enabled,
        prompt,
      } = e;

      if (enabled) {
        const setting = this.sceneManager.getSceneContext();
        const characters = Array.from(this.npcManager.npcPlayers.values()).map(character => {
          const {playerSpec} = character;
          const result = {};
          for (const key of characterKeys) {
            result[key] = playerSpec[key];
          }
          return result;
        });

        const liveChatSpec = enabled ? {
          // enabled: true,
          setting,
          characters,
          prompt,
        } : null;
        await this.ioBus.request(`setLiveChat`, {
          liveChatSpec,
        });

        /* const startStoryTeller = async () => {
          const storyTeller = new StoryTeller({
            setting,
            characters,
            prompt,
            chatManager: this.chatManager,
            playersManager: this.playersManager,
            npcManager: this.npcManager,
            hupsManager: this.hupsManager,
          });
          storyTeller.addEventListener('imageUpdate', e => {
            const {
              imageBitmap,
            } = e.data;

            this.skyboxMesh.material.uniforms.tex.value.image = imageBitmap;
            this.skyboxMesh.material.uniforms.tex.value.encoding = THREE.sRGBEncoding;
            this.skyboxMesh.material.uniforms.tex.value.needsUpdate = true;
            this.skyboxMesh.material.uniforms.tex.needsUpdate = true;
          });
          const messageadd = e => {
            const {
              player,
              message,
            } = e.data;
            
            const localPlayer = this.playersManager.getLocalPlayer();
            if (player === localPlayer) {
              storyTeller.addLocalMessage(player, message.message);
            }
          };
          this.chatManager.addEventListener('messageadd', messageadd);
          storyTeller.start();
        };
        await startStoryTeller(); */

        const _startStoryTellerChatGPT = async () => {
          const storyTeller = new StoryTellerChatGPT(
            makePersonality({
              setting,
              characters,
              prompt,
            }),
            {
              playersManager: this.playersManager,
              npcManager: this.npcManager,
              hupsManager: this.hupsManager,
              chatManager: this.chatManager,
              cameraManager: this.cameraManager,
              ioBus: this.ioBus,
            },
          );
          const messageadd = e => {
            const {
              player,
              message,
            } = e.data;
            
            const localPlayer = this.playersManager.getLocalPlayer();
            if (player === localPlayer) {
              storyTeller.addLocalMessage(player, message.message);
            }
          };
          this.chatManager.addEventListener('messageadd', messageadd);
          storyTeller.start();
        };
        await _startStoryTellerChatGPT();

        this.cleanup = () => {
          storyTeller.stop();

          this.chatManager.removeEventListener('messageadd', messageadd);
        };
      } else {
        if (this.cleanup) {
          this.cleanup();
          this.cleanup = null;
        }

        await this.ioBus.request(`setLiveChat`, {
          liveChatSpec: null,
        });
      }
    });

    this.ioBus.addEventListener('message', e => {
      const {
        type,
        args,
      } = e.data;
      if (type === 'cameraMode') {
        const {
          mode,
        } = args;
        this.enabled = mode === 'cinematic';
      }
    });

    // dynamic camera targets
    this.hupsManager.addEventListener('voicestart', e => {
      // console.log('got voice start', e);

      if (this.enabled) {
        const {
          character,
        } = e.data;

        const localPlayer = this.playersManager.getLocalPlayer();
        if (character !== localPlayer) {
          this.cameraManager.setDynamicTarget(
            character.avatar.modelBones.Head,
            // this.remotePlayer?.avatar.modelBones.Head
          );
        }
      }
    });
    this.hupsManager.addEventListener('voiceend', e => {
      // console.log('got voice end', e);

      if (this.enabled) {
        const {
          character,
        } = e.data;
  
        const localPlayer = this.playersManager.getLocalPlayer();
        if (character !== localPlayer) {
          this.cameraManager.setDynamicTarget();
        }
      }
    });
    // this.cameraManager.setDynamicTarget();
  }
}