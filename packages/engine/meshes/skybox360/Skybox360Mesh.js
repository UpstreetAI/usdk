import * as THREE from 'three';

//

const localVector = new THREE.Vector3();
const localVector2D = new THREE.Vector2();

//

const minDepth = 0;
const maxDepth = 1000;

//

function bilinearSample(depthData, uv, width, height) {
  let x = uv.x * width;
  let y = uv.y * height;
  
  let x1 = Math.floor(x);
  let y1 = Math.floor(y);

  let x2 = x1 + 1;
  let y2 = y1 + 1;
  
  // Ensure that the sample points are within the data bounds
  x1 = Math.max(0, Math.min(x1, width - 1));
  y1 = Math.max(0, Math.min(y1, height - 1));
  x2 = Math.max(0, Math.min(x2, width - 1));
  y2 = Math.max(0, Math.min(y2, height - 1));
  
  // Get the four sample points
  let q11 = depthData[y1 * width + x1];
  let q21 = depthData[y1 * width + x2];
  let q12 = depthData[y2 * width + x1];
  let q22 = depthData[y2 * width + x2];

  let r1;
  if (x2 === x1) {
    r1 = q11;
  } else {
    r1 = ((x2 - x) / (x2 - x1)) * q11 + ((x - x1) / (x2 - x1)) * q21;
  }

  let r2;
  if (x2 === x1) {
    r2 = q12;
  } else {
    r2 = ((x2 - x) / (x2 - x1)) * q12 + ((x - x1) / (x2 - x1)) * q22;
  }
  if (y2 === y1) {
    return r1;
  } else {
    return ((y2 - y) / (y2 - y1)) * r1 + ((y - y1) / (y2 - y1)) * r2;
  }
}
function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
function mod(x, y) {
  return x - y * Math.floor(x / y);
}

export class Skybox360Mesh extends THREE.Mesh {
  constructor() {
    const imgTexture = new THREE.Texture();
    
    const sphereGeometry = new THREE.SphereBufferGeometry(1, 128, 64);
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
    });

    super(sphereGeometry, sphereMaterial);
  }

  setGeometry({
    float32Array = null,
    width = 0,
    height = 0,
  } = {}) {
    const sphereGeometry = this.geometry;
    const positionAttribute = sphereGeometry.attributes.position;
    const positions = positionAttribute.array;
    const uvAttribute = sphereGeometry.attributes.uv;
    const uvs = uvAttribute.array;
    const indexAttribute = sphereGeometry.index;
    const indices = indexAttribute.array;

    {
      // for all points have the same position, make sure they have the same uv
      const positionToOriginalIndexMap = new Map();
      for (let i = 0; i < positions.length / 3; i++) {
        let x = positions[i * 3 + 0];
        let y = positions[i * 3 + 1];
        let z = positions[i * 3 + 2];
        const key = `${x},${y},${z}`;
        if (positionToOriginalIndexMap.has(key)) {
          const oldIndex = positionToOriginalIndexMap.get(key);
          localVector2D.fromArray(uvs, oldIndex * 2)
          localVector2D.toArray(uvs, i * 2);
        } else {
          positionToOriginalIndexMap.set(key, i);
        }

        // make uv based on height, not angle
        localVector2D.fromArray(uvs, i * 2);
        localVector2D.y = (y + 1) / 2;
        localVector2D.toArray(uvs, i * 2);
      }
    }

    if (float32Array) {
      for (let i = 0; i < positions.length / 3; i++) {
        const uv = localVector2D.fromArray(uvs, i * 2);
        uv.x = mod(uv.x, 1)
        uv.y = clamp(1 - uv.y, 0, 1);
        let depth = bilinearSample(float32Array, uv, width, height);
        depth = 1 / depth;
        depth = clamp(depth, minDepth, maxDepth);

        localVector.fromArray(positions, i * 3)
        if (localVector.y <= -0.99) {
          localVector.x = 0;
          localVector.y = -1;
          localVector.z = 0;
        } else if (localVector.y >= 0.99) {
          localVector.x = 0;
          localVector.y = 1;
          localVector.z = 0;
        }
        // normalize in the xz direction
        // const xzLength = Math.sqrt(localVector.x * localVector.x + localVector.z * localVector.z);
        // if (xzLength > 0) {
        //   localVector.x /= xzLength;
        //   localVector.z /= xzLength;
        // }
        localVector.multiplyScalar(depth);

        // localVector.x *= depth;
        // localVector.z *= depth;
        // localVector.y *= 3;

        // localVector2D.set(localVector.x, localVector.z)
        //   .normalize()
        //   .multiplyScalar(depth);
        // localVector.x = localVector2D.x;
        // localVector.z = localVector2D.y;

        // if (localVector.y < 1.0e-3) {
        //   localVector.y = 1.0e-3;
        // }

        localVector
          .toArray(positions, i * 3);
      }
    }
    // reverse triangles
    for (let i = 0; i < indices.length / 3; i++) {
      const a = indices[i * 3 + 0];
      const b = indices[i * 3 + 1];
      const c = indices[i * 3 + 2];
      indices[i * 3 + 0] = c;
      indices[i * 3 + 1] = b;
      indices[i * 3 + 2] = a;
    }

    positionAttribute.needsUpdate = true;
    uvAttribute.needsUpdate = true;
    indexAttribute.needsUpdate = true;
  }

  async load ({
    img,
    depthMap,
  }) {
    const {width, height} = depthMap;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(depthMap, 0, 0);

    // read the depth from grey scale
    const imageData = ctx.getImageData(0, 0, width, height);
    const {data} = imageData;
    const arrayBuffer = new ArrayBuffer(width * height * Float32Array.BYTES_PER_ELEMENT);
    const float32Array = new Float32Array(arrayBuffer);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i + 0];
      // const g = data[i + 1];
      // const b = data[i + 2];
      // const a = data[i + 3];
      let rawDepth = r / 255;
      const j = i / 4;
      float32Array[j] = rawDepth;
    }

    // set texture
    {
      this.material.uniforms.map.value.image = img;
      this.material.uniforms.map.value.needsUpdate = true;
    }
    // set geometry
    {
      const float32Array = new Float32Array(arrayBuffer);
      this.setGeometry({
        float32Array,
        width,
        height,
      });
    }
  }
}