import * as THREE from 'three';
import loaders from '../../loaders.js';

//

const size = 0.5;
const scale = 0.3;
const r = 0.3;
const da = 0;
const di = 0.1;
const q90 = new THREE.Quaternion()
  .setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 1, 0)
  );
  
const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
// const localVector4 = new THREE.Vector3();
// const localQuaternion = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();

//

const arrowGeometry = new THREE.PlaneBufferGeometry(size, size)
  .applyMatrix4(
    new THREE.Matrix4()
      .makeRotationFromQuaternion(
        new THREE.Quaternion()
          .setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)
      )
  );

//

const makeKtx2TexGetter = (u, consFn) => {
  let tex;
  return async ({
    ktx2Loader,
  }) => {
    if (!tex) {
      tex = await new Promise((accept, reject) => {
        ktx2Loader.load(u, tex => {
          // console.log('needs update 1', tex, tex.needsUpdate);
          // tex.needsUpdate = true;
          accept(tex);
        }, () => {
          // console.log( 'onProgress' );
        }, reject);
      });
      consFn && consFn(tex);
    }
    // console.log('got tex', tex);
    return tex;
  };
};
/* const makePngTexGetter = (u, consFn) => {
  let tex;
  return async ({
    ktx2Loader,
  }) => {
    if (!tex) {
      tex = await new Promise((accept, reject) => {
        const tex = new THREE.Texture();
        const img = new Image();
        img.onload = () => {
          tex.image = img;
          tex.needsUpdate = true;
          // document.body.appendChild(img);
          // console.log('got image', img);
          accept(tex);
        };
        img.onerror = reject;
        img.crossOrigin = 'Anonymous';
        img.src = u;
      });
      consFn && consFn(tex);
    }
    return tex;
  };
}; */
const getArrowTex = makeKtx2TexGetter(`${import.meta.url.replace(/(\/)[^\/]*$/, '$1')}_Down Tap Note 16x16.png`, tex => {
  tex.magFilter = THREE.NearestFilter;
});
const getTailTex = makeKtx2TexGetter(`${import.meta.url.replace(/(\/)[^\/]*$/, '$1')}tail.png`, tex => {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
});

export class ArrowLoaderMesh extends THREE.Object3D {
  constructor() {
    super();

    // const [
    //   arrowTex,
    //   tailTex,
    // ] = await Promise.all([
    //   getArrowTex({
    //     ktx2Loader,
    //   }),
    //   getTailTex({
    //     ktx2Loader,
    //   }),
    // ]);

    const {
      ktx2Loader,
    } = loaders;
    const arrowTex = getArrowTex({
      ktx2Loader,
    });
    const tailTex = getTailTex({
      ktx2Loader,
    });

    const arrowMaterial = (() => {  
      const material = new THREE.ShaderMaterial({
        uniforms: {
          tex: {
            // type: 't',
            value: arrowTex,
            needsUpdate: true,
          },
          uTime: {
            // type: 'f',
            value: 0,
            needsUpdate: true,
          },
        },
        vertexShader: `\
          /* ${THREE.ShaderChunk.common} */
          precision highp float;
          precision highp int;
          varying vec2 vUv;
          /* ${THREE.ShaderChunk.logdepthbuf_pars_vertex} */

          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            vUv = uv;
            /* ${THREE.ShaderChunk.logdepthbuf_vertex} */
          }
        `,
        fragmentShader: `\
          precision highp float;
          precision highp int;
          #define PI 3.1415926535897932384626433832795
          uniform sampler2D tex;
          uniform float uTime;
          varying vec2 vUv;
          /* ${THREE.ShaderChunk.logdepthbuf_pars_fragment} */

          void main() {
            float t = floor(uTime * 16. * 16.);
            float x = mod(t, 16.);
            // float y = floor((uTime - x) / 16.);
            float y = 0.;
            vec2 uv = (vUv / 16.0) + vec2(x, y)/16.;
            gl_FragColor = texture2D(tex, uv);
            
            if (gl_FragColor.a < 0.9) {
              discard;
            }

            /* ${THREE.ShaderChunk.logdepthbuf_fragment} */
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        // polygonOffset: true,
        // polygonOffsetFactor: -1,
        // polygonOffsetUnits: 1,
      });
      return material;
    })();
    // globalThis.arrowMaterial = arrowMaterial;
    const tailMaterial = (() => {  
      const material = new THREE.ShaderMaterial({
        uniforms: {
          tex: {
            // type: 't',
            value: tailTex,
            needsUpdate: true,
          },
          uTime: {
            // type: 'f',
            value: 0,
            needsUpdate: true,
          },
        },
        vertexShader: `\
          /* ${THREE.ShaderChunk.common} */
          precision highp float;
          precision highp int;
          varying vec2 vUv;
          /* ${THREE.ShaderChunk.logdepthbuf_pars_vertex} */
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            vUv = uv;
            /* ${THREE.ShaderChunk.logdepthbuf_vertex} */
          }
        `,
        fragmentShader: `\
          precision highp float;
          precision highp int;
          #define PI 3.1415926535897932384626433832795
          uniform sampler2D tex;
          uniform float uTime;
          varying vec2 vUv;
          /* ${THREE.ShaderChunk.logdepthbuf_pars_fragment} */

          void main() {
            // gl_FragColor = vec4(1., 0., 0., 1.);
            gl_FragColor = texture2D(tex, vec2(vUv.x, vUv.y + uTime));
            /* ${THREE.ShaderChunk.logdepthbuf_fragment} */
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });
      return material;
    })();
    // globalThis.tailMaterial = tailMaterial;
  
    const mesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
    mesh.scale.setScalar(scale);
    mesh.frustumCulled = false;
    // mesh.visible = false;
    // console.log('got bounding box', boundingBox);
    this.add(mesh);
    mesh.updateMatrixWorld();
    this.mesh = mesh;
  
    const tailMesh = (() => {
      const width = 0.47;
      // const height = width*1245/576;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(2 * 3 * 64);
      const positionsAttribute = new THREE.BufferAttribute(positions, 3);
      geometry.setAttribute('position', positionsAttribute);
      const uvs = new Float32Array(positions.length/3*2);
      const uvsAttribute = new THREE.BufferAttribute(uvs, 2);
      geometry.setAttribute('uv', uvsAttribute);
      const indices = new Uint16Array(positions.length/3);
      const indexAttribute = new THREE.BufferAttribute(indices, 1);
      geometry.setIndex(indexAttribute);
      // let positionIndex = 0;
      // let indexIndex = 0;
      // let maxIndexIndex = 0;

      const tailMesh = new THREE.Mesh(geometry, tailMaterial);
      // tailMesh.position.y = -height/2;
      // tailMesh.drawMode = THREE.TriangleStripDrawMode;
      tailMesh.frustumCulled = false;
      /* tailMesh.update = () => {
        localVector.copy(mesh.position)
          .add(
            localVector2.set(-width*scale/2, 0, 0)
              .applyQuaternion(mesh.quaternion)
            )
          .toArray(positions, positionIndex);
        positionIndex += 3;
        localVector.copy(mesh.position)
          .add(
            localVector2.set(width*scale/2, 0, 0)
              .applyQuaternion(mesh.quaternion)
            )
          .toArray(positions, positionIndex);
        positionIndex += 3;
  
        for (let i = positionIndex/3 - 2; i < positionIndex/3; i++) {
          if (i % 2 === 0) {
            indices[indexIndex++] = i;
            indices[indexIndex++] = i+1;
            indices[indexIndex++] = i+2;
          } else {
            indices[indexIndex++] = i+2;
            indices[indexIndex++] = i+1;
            indices[indexIndex++] = i;
          }
        }
        
        positionsAttribute.needsUpdate = true;
        indexAttribute.needsUpdate = true;
        
        // maxPositionIndex = Math.max(positionIndex, maxPositionIndex);
        maxIndexIndex = Math.max(indexIndex, maxIndexIndex);
        geometry.setDrawRange(0, maxIndexIndex);
        positionIndex = positionIndex % positions.length;
      }; */
      const points = [];
      let index = 0;
      tailMesh.update = () => {
        const p = mesh.position.clone();
        const q = mesh.quaternion.clone();
        points.push({
          position: p,
          quaternion: q,
          index: index++,
        });
        while (points.length > 32) {
          points.shift();
        }
        
        if (points.length >= 2) {
          let positionIndex = 0;
          let uvIndex = 0;
          let indexIndex = 0;
          for (let i = points.length-1; i >= 0; i--) {
            const {position, quaternion, index} = points[i];
            localVector.copy(position)
              .add(
                localVector2.set(-width*scale/2, 0, 0)
                  .applyQuaternion(quaternion)
                )
              .toArray(positions, positionIndex);
            positionIndex += 3;
            localVector.copy(position)
              .add(
                localVector2.set(width*scale/2, 0, 0)
                  .applyQuaternion(quaternion)
                )
              .toArray(positions, positionIndex);
            positionIndex += 3;
            
            if (i % 2 === 0) {
              indices[indexIndex++] = i;
              indices[indexIndex++] = i+1;
              indices[indexIndex++] = i+2;
            } else {
              indices[indexIndex++] = i+2;
              indices[indexIndex++] = i+1;
              indices[indexIndex++] = i;
            }
            
            const y = -index * 0.2;
            uvs[uvIndex++] = 0;
            uvs[uvIndex++] = y;
            uvs[uvIndex++] = 1;
            uvs[uvIndex++] = y;
          }
          positionsAttribute.needsUpdate = true;
          uvsAttribute.needsUpdate = true;
          indexAttribute.needsUpdate = true;
          geometry.setDrawRange(0, indexIndex);
        }
      };
      return tailMesh;
    })();
    this.add(tailMesh);
    tailMesh.updateMatrixWorld();
    this.tailMesh = tailMesh;

    //
  
    this.azimuth = Math.PI/2;
    this.inclination = 1;
    this.lastPosition = new THREE.Vector3(0, 0, 1);
  }
  update() {
    mesh.position.set(
      r * Math.cos(this.azimuth) * Math.sin(this.inclination),
      r * Math.sin(this.azimuth) * Math.sin(this.inclination),
      r * Math.cos(this.inclination)
    );

    this.mesh.quaternion.setFromRotationMatrix(
      localMatrix.lookAt(
        this.lastPosition,
        this.mesh.position,
        localVector3.copy(this.mesh.position)
          .multiplyScalar(-1)
      )
    ).multiply(q90);
    this.lastPosition.copy(this.mesh.position);
    this.mesh.updateMatrixWorld();

    const timeFactor = 10 * 1000;
    this.mesh.material.uniforms.uTime.value = (timestamp % timeFactor) / timeFactor;
    this.mesh.material.uniforms.uTime.needsUpdate = true;


    //

    this.tailMesh.update();

    //

    this.azimuth += da;
    this.azimuth %= this.Math.PI*2;
    this.inclination += di;
    this.inclination %= Math.PI*2;
  }
  // destroy() {
  //   for (const child of [
  //     this.mesh,
  //     this.tailMesh,
  //   ]) {
  //     child.geometry.dispose();
  //     child.material.dispose();
  //   }
  // }
}