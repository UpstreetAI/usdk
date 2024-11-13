import * as THREE from 'three';
import {
  fullscreenGeometry,
  fullscreenVertexShader,
} from './common.js';

const spriteFragmentShader = `\
  uniform sampler2D spriteSheetTexture;
  uniform vec2 textureOffset;
  uniform vec2 frameSize;

  varying vec2 tex_coords;
  
  void main() {
    vec4 spriteSheet = texture2D(
      spriteSheetTexture, 
      vec2(
        tex_coords.x / frameSize.x + textureOffset.x,
        tex_coords.y / frameSize.y + textureOffset.y
      )
    );
    gl_FragColor = spriteSheet;
    
  }
`;


class SpriteBgFx extends THREE.Mesh {
  constructor() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        spriteSheetTexture: {
          value: null
        },
        textureOffset: {
          value: new THREE.Vector2()
        },
        frameSize: {
          value: new THREE.Vector2()
        }
      },
      vertexShader: fullscreenVertexShader,
      fragmentShader: spriteFragmentShader,
      depthWrite: false,
      depthTest: false,
      alphaToCoverage: true,
    });
    super(fullscreenGeometry, material);
    
    this.frustumCulled = false;
    this.textures = {};
    this.textures.speedlineTexture = SpriteBgFx.speedlineTexture;
    this.textures.fireTexture = SpriteBgFx.fireTexture;
    this.textures.overcastTexture = SpriteBgFx.overcastTexture;
    this.textures.overcastTexture2 = SpriteBgFx.overcastTexture2;
    this.textures.speedlineTexture2 = SpriteBgFx.speedlineTexture2;
    this.textures.confusedTexture = SpriteBgFx.confusedTexture;
  }

  static async waitForLoad() {
    const textureLoader = new THREE.TextureLoader();
    SpriteBgFx.speedlineTexture = textureLoader.load('/textures/emote-background/speedline4.png');
    SpriteBgFx.speedlineTexture2 = textureLoader.load('/textures/emote-background/speedline2.png');
    SpriteBgFx.fireTexture = textureLoader.load('/textures/emote-background/fire7.png');
    SpriteBgFx.overcastTexture = textureLoader.load('/textures/emote-background/overcast.jpg');
    SpriteBgFx.overcastTexture2 = textureLoader.load('/textures/emote-background/overcast4.jpg');
    SpriteBgFx.confusedTexture = textureLoader.load('/textures/emote-background/confuse.png');
  }

}

export {
  SpriteBgFx,
};