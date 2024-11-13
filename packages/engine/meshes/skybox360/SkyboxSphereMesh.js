import * as THREE from 'three';

//

// const localVector = new THREE.Vector3();
const localVector2D = new THREE.Vector2();

//

// const minDepth = 0;
// const maxDepth = 1000;

//

const radius = 1000;
export class SkyboxSphereMesh extends THREE.Mesh {
  constructor() {
    const imgTexture = new THREE.Texture();
    
    const sphereGeometry = new THREE.SphereBufferGeometry(radius, 128, 64);
    const sphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: {
          value: imgTexture,
          needsUpdate: true,
        },
        highlightImage: {
          value: (() => {
            const t = new THREE.Texture();
            // t.flipY = false;
            return t;
          })(),
          needsUpdate: true,
        },
        highlightImageValid: {
          value: 0,
          needsUpdate: true,
        },
      },
      vertexShader: `\
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // set the position of the current vertex
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `\
        uniform sampler2D map;

        uniform sampler2D highlightImage;
        uniform float highlightImageValid;

        varying vec2 vUv;

        void main() {
          gl_FragColor = texture2D(map, vUv);

          if (highlightImageValid > 0.5) {
            float r = texture2D(highlightImage, vUv).r;
            if (r > 0.5) {
              gl_FragColor.b += 0.3;
            }
          }
        }
      `,
      side: THREE.BackSide,
    });

    super(sphereGeometry, sphereMaterial);
  }

  async load({
    // fileUrl,
    // depthMapUrl,
    img,
    // depthMapBlob,
  }) {
    // set texture
    {
      this.material.uniforms.map.value.image = img;
      this.material.uniforms.map.value.needsUpdate = true;
    }

    {
      // make uv based on height, not angle
      const positions = this.geometry.attributes.position.array;
      const uvs = this.geometry.attributes.uv.array;
      for (let i = 0; i < positions.length / 3; i++) {
        // let x = positions[i * 3 + 0];
        let y = positions[i * 3 + 1];
        // let z = positions[i * 3 + 2];

        // make uv based on height, not angle
        localVector2D.fromArray(uvs, i * 2);
        localVector2D.y = (y / radius + 1) / 2;
        localVector2D.toArray(uvs, i * 2);
      }
    }
  }
}