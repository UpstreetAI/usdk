import * as THREE from 'three';
import {
  // generateView,
  // generate360Views,
  // drawSlices,

  // angleTick,
  angleTickRadians,
  // numAngles,
  // itemSliceSize,
  // itemCanvasWidth,
  // itemCanvasHeight,
  numSlicesPerRow,
  numSlicesPerCol,
} from '../../clients/zero123-client.js';
import {emotions} from '../../managers/emote/emotions.js';
import {
  mod,
} from '../../util.js';

//

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
// const localVector2D = new THREE.Vector2();
const localQuaternion = new THREE.Quaternion();
const localEuler = new THREE.Euler();

const upVector = new THREE.Vector3(0, 1, 0);

//

export class Frame360Mesh extends THREE.Mesh {
  constructor() {
    const imgTexture = new THREE.Texture();
    // imgTexture.encoding = THREE.sRGBEncoding;
    // imgTexture.needsUpdate = true;
    
    const planeGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
    const planeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: {
          value: imgTexture,
          needsUpdate: true,
        },
        animationMap: {
          value: new THREE.Texture(),
          needsUpdate: true,
        },
        frameBox: {
          value: new THREE.Vector4(),
          needsUpdate: false,
        },
        angleIndex: {
          value: 0,
          needsUpdate: false,
        },
        animationIndex: {
          value: -1,
          needsUpdate: true,
        },
      },
      vertexShader: `\
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `\
        uniform sampler2D map;
        uniform vec4 frameBox; // x, y, w, h
        
        uniform float angleIndex;
        uniform float animationIndex;

        uniform sampler2D animationMap;

        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;

          if (angleIndex == 4. && animationIndex != -1.) {
            uv.x = frameBox.x + frameBox.z * uv.x;
            uv.y = frameBox.y + frameBox.w * uv.y;
            gl_FragColor = texture2D(animationMap, uv);
          } else {
            uv.x = frameBox.x + frameBox.z * uv.x;
            uv.y = frameBox.y + frameBox.w * uv.y;
            gl_FragColor = texture2D(map, uv);
          }

          if (gl_FragColor.a < 0.5) {
            discard;
          }
        }
      `,
      transparent: true,
    });

    super(planeGeometry, planeMaterial);

    //

    // this fixes water rendering in the procedural generation app
    this.customDepthMaterial = this.material;

    //

    this.volume = 0;
    this.emotion = '';

    //

    this.onBeforeRender = (renderer, scene, camera) => {
      if (this.parent) {
        this.parent.matrixWorld.decompose(localVector, localQuaternion, localVector2);
      } else {
        localVector.set(0, 0, 0);
        localQuaternion.identity();
        localVector2.setScalar(1);
      }
  
      localEuler.setFromQuaternion(localQuaternion, 'YXZ');
  
      localVector.sub(camera.position);
      localVector.y = 0;
      localVector.normalize();
      let angle = Math.atan2(localVector.x, localVector.z);
      angle = mod(angle - localEuler.y + Math.PI, Math.PI * 2);

      // snap to angle tick
      let angleIndex = Math.round(angle / angleTickRadians);
      angleIndex = mod(angleIndex, numSlicesPerRow * numSlicesPerCol);
  
      const indexToXy = index => {
        const x = index % numSlicesPerRow;
        const y = Math.floor(index / numSlicesPerRow);
        return [x, y];
      };

      const [x, y] = indexToXy(angleIndex);
      this.material.uniforms.frameBox.value.set(
        x / numSlicesPerRow,
        y / numSlicesPerCol,
        1 / numSlicesPerRow,
        1 / numSlicesPerCol,
      );
      this.material.uniforms.frameBox.needsUpdate = true;

      this.material.uniforms.angleIndex.value = angleIndex;
      this.material.uniforms.angleIndex.needsUpdate = true;

      //

      let animationIndex;
      // console.log('update', this.material.uniforms.animationMap.value.image, angleIndex === 4);
      if (this.material.uniforms.animationMap.value.image && angleIndex === 4) {
        if (this.emotion) {
          const emotionIndex = emotions.indexOf(this.emotion);
          animationIndex = 3 + emotionIndex;
        } else {
          animationIndex = 0;
        }

        if (this.volume > 0.1) {
          animationIndex = 1 + Math.floor(performance.now() / 1000 * 10) % 2;
        }

        // console.log('animation index', animationIndex);

        let [x, y] = indexToXy(animationIndex);
        y += 1;
        this.material.uniforms.frameBox.value.set(
          x / numSlicesPerRow,
          y / numSlicesPerCol,
          1 / numSlicesPerRow,
          1 / numSlicesPerCol,
        );
        this.material.uniforms.frameBox.needsUpdate = true;

        // console.log('set frame box', [
        //   x / numSlicesPerRow,
        //   y / numSlicesPerCol,
        //   1 / numSlicesPerRow,
        //   1 / numSlicesPerCol,
        // ]);
      } else {
        animationIndex = -1;
      }
      this.material.uniforms.animationIndex.value = animationIndex;
      this.material.uniforms.animationIndex.needsUpdate = true;

      this.quaternion.setFromAxisAngle(
        upVector,
        angleIndex * angleTickRadians,
      );
      this.updateMatrixWorld();
    };
  }
  setVolume(volume) {
    this.volume = volume;
  }
  setEmotion(emotion) {
    this.emotion = emotion;
  }
  async load({
    frame360ImageUrl,
    frameAnimationImageUrl = null,
  }) {
    const [
      img,
      animationImg,
    ] = await Promise.all([
      (async () => {
        const imgBlob = await (async () => {
          const res = await fetch(frame360ImageUrl);
          const blob = await res.blob();
          return blob;
        })();
        const img = await createImageBitmap(imgBlob, {
          imageOrientation: 'flipY',
        });
        return img;
      })(),
      (async () => {
        if (frameAnimationImageUrl) {
          const imgBlob = await (async () => {
            const res = await fetch(frameAnimationImageUrl);
            const blob = await res.blob();
            return blob;
          })();
          // const size = 512;
          const img = await createImageBitmap(imgBlob, {
            imageOrientation: 'flipY',
          });
          return img;
        } else {
          return null;
        }
      })(),
    ]);

    // set texture
    {
      this.material.uniforms.map.value.image = img;
      this.material.uniforms.map.value.needsUpdate = true;

      if (animationImg) {
        this.material.uniforms.animationMap.value.image = animationImg;
        this.material.uniforms.animationMap.value.needsUpdate = true;
      // } else {
      //   console.warn('no animation image', frameAnimationImageUrl);
      //   debugger;
      }
    }
  }
}