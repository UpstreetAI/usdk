import * as THREE from 'three';

export default srcUrl => ctx => {
  const {
    useApp,
    useScene,
    useCleanup,
    useFrame,
    useSkyManager,
  } = ctx;

  const app = useApp();
  const skyManager = useSkyManager();

  const sphereGeometry = new THREE.SphereBufferGeometry(1000, 32, 16);
  const sphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      currentTexture: {
        value: null,
      },
      previousTexture: {
        value: null,
      },
      textureEnabled: {
        value: false
      },
      skyColor: {
        value: new THREE.Color(),
      },
      textureLerp:{
        value: 0
      }
    },
    vertexShader: `\
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `\
      uniform sampler2D currentTexture;
      uniform sampler2D previousTexture;
      uniform bool textureEnabled;
      uniform vec3 skyColor;
      varying vec2 vUv;
      uniform float textureLerp;
      void main() {
        if (textureEnabled) {
          vec4 currentSky = texture2D(currentTexture, vUv);
          vec4 previousSky = texture2D(previousTexture, vUv);
          gl_FragColor = mix(previousSky, currentSky, clamp(textureLerp, 0.0, 1.0));
        } else {
          gl_FragColor = vec4(skyColor, 1.0);
        }
        
      }
    `,
    side: THREE.BackSide,
  });
  const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial ); 
  app.add( sphere );

  app.appType = 'skydome2D';
  app.description = '';
  const skyColor = app.getComponent('color');
  const initIndex = app.getComponent('textureIndex');
  const textureUrls = app.getComponent('textures');

  const textureLoader = new THREE.TextureLoader();

  let startTransitionTime = 0;
  let transitionInterval = 0;

  if (skyColor === null && (textureUrls === null || initIndex === null)) {
    return console.error('Not proper components for skydome2D');
  }

  ctx.waitUntil((async () => {
    const textures = new Map();
    if (initIndex === null || textureUrls === null) {
      sphereMaterial.uniforms.skyColor.value.setHex(skyColor);
    } else {
      const initialTexture = await textureLoader.loadAsync(textureUrls[initIndex]);
      textures.set(initIndex, initialTexture);
      sphereMaterial.uniforms.textureEnabled.value = true;
      sphereMaterial.uniforms.currentTexture.value = initialTexture;
    }

    skyManager.addEventListener('setskydome', async(e) => {
      const { index, transition } = e.data;
      if (!textures.has(index)) {
        textures.set(index, await textureLoader.loadAsync(textureUrls[index]));
      }

      transitionInterval = transition ?? 0;
      sphereMaterial.uniforms.previousTexture.value = sphereMaterial.uniforms.currentTexture.value;
      sphereMaterial.uniforms.currentTexture.value = textures.get(index);
      sphereMaterial.uniforms.textureEnabled.value = true;
      sphereMaterial.uniforms.textureLerp.value = transitionInterval ? 0 : 1;
    });

  })());

  const bias = 0.01;

  useFrame((timestamp) => {
    if (sphereMaterial.uniforms.textureEnabled.value && sphereMaterial.uniforms.textureLerp.value < 1) {
      if (sphereMaterial.uniforms.textureLerp.value === 0) {
        startTransitionTime = timestamp - bias;
      }
      const elapsedTime = (timestamp - startTransitionTime) / 1000;
      sphereMaterial.uniforms.textureLerp.value = Math.min(elapsedTime / transitionInterval, 1);
    }
  });



  return app;
};