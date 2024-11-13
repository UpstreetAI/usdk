import * as THREE from 'three';
// import {
//   getRenderer,
// } from './renderer.js';
// import metaversefile from 'metaversefile';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();

const localQuaternion = new THREE.Quaternion();
const localQuaternion2 = new THREE.Quaternion();
const localQuaternion3 = new THREE.Quaternion();

const localMatrix = new THREE.Matrix4();

const localEuler = new THREE.Euler();

const localArray = [];
const localArray2 = [];
const localArray3 = [];
const localArray4 = [];
const handBones = {
  "wrist": 0,

  "thumb-metacarpal": 1,
  "thumb-phalanx-proximal": 2,
  "thumb-phalanx-distal": 3,
  "thumb-tip": 4,

  // "index-finger-metacarpal": null,
  "index-finger-phalanx-proximal": 5,
  "index-finger-phalanx-intermediate": 6,
  "index-finger-phalanx-distal": 7,
  "index-finger-tip": 8,

  // "middle-finger-metacarpal": null,
  "middle-finger-phalanx-proximal": 9,
  "middle-finger-phalanx-intermediate": 10,
  "middle-finger-phalanx-distal": 11,
  "middle-finger-tip": 12,

  // "ring-finger-metacarpal": null,
  "ring-finger-phalanx-proximal": 13,
  "ring-finger-phalanx-intermediate": 14,
  "ring-finger-phalanx-distal": 15,
  "ring-finger-tip": 16,

  // "pinky-finger-metacarpal": null,
  "pinky-finger-phalanx-proximal": 17,
  "pinky-finger-phalanx-intermediate": 18,
  "pinky-finger-phalanx-distal": 19,
  "pinky-finger-tip": 20,
};
const handBoneNames = Object.keys(handBones);
const localHandFloat32Array = new Float32Array(handBoneNames.length * 16);
const makeHandLandmarks = () => Array(handBoneNames.length)
  .fill(null)
  .map(() => new THREE.Vector3());
const localHandLandmarks = makeHandLandmarks();
const localHandLandmarks2 = makeHandLandmarks();

// const backVector = new THREE.Vector3(0, 0, 1);
// const upVector = new THREE.Vector3(0, 1, 0);
// const rightVector = new THREE.Vector3(1, 0, 0);

//

class CacheEntry {
  constructor(value, lastChangedTime) {
    this.value = value;
    this.lastChangedTime = lastChangedTime;
  }
}
/* class UvMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: `\
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.);
        }
      `,
      fragmentShader: `\
        varying vec2 vUv;

        void main() {
          gl_FragColor = vec4(vUv, 0., 1.);
        }
      `,
    });
  }
} */

// const meshMaterial = new THREE.MeshPhongMaterial({
//   color: 0xCCCCCC,
// });
const meshMaterial = new THREE.MeshNormalMaterial({
  side: THREE.DoubleSide,
});
const planeMaterial = new THREE.MeshNormalMaterial({
  side: THREE.DoubleSide,
});

const makeShapeGeometry = (polygon) => {
  // make the shape geometry
  const shape = new THREE.Shape();
  for (let i = 0; i < polygon.length; i++) {
    const point = polygon[i];
    if (i === 0) {
      shape.moveTo(point.x, point.z);
    } else {
      shape.lineTo(point.x, point.z);
    }
  }
  const firstPoint = polygon[0];
  shape.lineTo(firstPoint.x, firstPoint.z);
  // extrude the flat plane shape geometry
  const geometry = new THREE.ExtrudeBufferGeometry(shape, {
    depth: 0,
    bevelEnabled: false,
  });
  geometry.rotateX(-Math.PI/2);
  return geometry;
};

export class XRManager extends THREE.Object3D {
  constructor({
    engineRenderer,
    cameraManager,
  }) {
    super();

    if (!engineRenderer || !cameraManager /*|| !ioBus*/) {
      console.warn('xr manager missing args', {
        engineRenderer,
        cameraManager,
      });
      debugger;
      throw new Error('missing args');
    }

    this.engineRenderer = engineRenderer;
    this.cameraManager = cameraManager;

    this.meshes = [];
    this.planes = [];
  }
  static getXrAvatarPose(renderer) {
    let leftGamepadPosition, leftGamepadQuaternion, leftGamepadPointer, leftGamepadGrip, leftGamepadEnabled;
    let rightGamepadPosition, rightGamepadQuaternion, rightGamepadPointer, rightGamepadGrip, rightGamepadEnabled;

    // const {renderer} = this.engineRenderer;
    const session = renderer.xr.getSession();
    const referenceSpace = renderer.xr.getReferenceSpace();
    const frame = renderer.xr.getFrame();
    // if (session) {
      let inputSources = Array.from(session.inputSources);
      inputSources = ['right', 'left']
        .map(handedness => inputSources.find(inputSource => inputSource.handedness === handedness));

      const leftHandLandmarks = localHandLandmarks;
      const rightHandLandmarks = localHandLandmarks2;

      // console.log('got hands', Array.from(session.inputSources).map(source => ({
      //   profiles: source?.profiles,
      //   handedness: source?.handedness,
      //   hand: source?.hand,
      // })));

      // console.log('input source', inputSources);

      let pose;
      if (inputSources[0] && (pose = frame.getPose(inputSources[0].gripSpace, referenceSpace))) {
        localMatrix.fromArray(pose.transform.matrix)
          .decompose(localVector2, localQuaternion2, localVector3);
        // if (inputSources[0].profiles.includes('oculus-touch-v2')) {
        //   localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(1, 0, 0), -Math.PI*0.5));
        // } else if (!inputSources[0].profiles.includes('oculus-hand')) {
        //   localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(1, 0, 0), -Math.PI));
        // } else {
        //   localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(0, 0, 1), Math.PI*0.5)).multiply(localQuaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.2));
        // }
        localQuaternion2
          .multiply(
            localQuaternion3.setFromEuler(
              localEuler.set(
                -1 * Math.PI, // Z
                0 * Math.PI, // Y
                0 * Math.PI, // Y
                'YXZ'
              )
            )
          )
        leftGamepadPosition = localVector2.toArray(localArray);
        leftGamepadQuaternion = localQuaternion2.toArray(localArray2);

        const {gamepad} = inputSources[0];
        if (gamepad && gamepad.buttons.length >= 2) {
          const {buttons} = gamepad;
          leftGamepadPointer = buttons[0].value;
          leftGamepadGrip = buttons[1].value;
        } else {
          leftGamepadPointer = 0;
          leftGamepadGrip = 0;
        }
        leftGamepadEnabled = true;

        if (inputSources[0].hand) {
          const transforms = localHandFloat32Array;
          const jointSpaces = handBoneNames.map(name =>
            inputSources[0].hand.get(name)
          );
          if (frame.fillPoses(
            jointSpaces,
            renderer.xr.getReferenceSpace(),
            transforms,
          )) {
            for (let i = 0; i < handBoneNames.length; i++) {
              // const name = handBoneNames[i];
              // const index = handBones[name];
              localMatrix.fromArray(transforms, i * 16)
                .decompose(leftHandLandmarks[i], localQuaternion, localVector2);
            }
          }
        }
      } else {
        leftGamepadEnabled = false;
      }

      if (inputSources[1] && (pose = frame.getPose(inputSources[1].gripSpace, referenceSpace))) {
        localMatrix.fromArray(pose.transform.matrix)
          .decompose(localVector2, localQuaternion2, localVector3);
        // if (inputSources[1].profiles.includes('oculus-touch-v2')) {
        //   localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(1, 0, 0), -Math.PI*0.5));
        // } else if (!inputSources[1].profiles.includes('oculus-hand')) {
        //   localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(1, 0, 0), -Math.PI));
        // } else {
        //   localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(0, 0, 1), -Math.PI*0.5)).multiply(localQuaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.2));
        // }
        localQuaternion2
          .multiply(
            localQuaternion3.setFromEuler(
              localEuler.set(
                1 * Math.PI, // Z
                0 * Math.PI, // Y
                0 * Math.PI, // Y
                'YXZ'
              )
            )
          )
        rightGamepadPosition = localVector2.toArray(localArray3);
        rightGamepadQuaternion = localQuaternion2.toArray(localArray4);

        const {gamepad} = inputSources[1];
        if (gamepad && gamepad.buttons.length >= 2) {
          const {buttons} = gamepad;
          rightGamepadPointer = buttons[0].value;
          rightGamepadGrip = buttons[1].value;
        } else {
          rightGamepadPointer = 0;
          rightGamepadGrip = 0;
        }
        rightGamepadEnabled = true;

        if (inputSources[1].hand) {
          const transforms = localHandFloat32Array;
          const jointSpaces = handBoneNames.map(name => inputSources[0].hand.get(name));
          if (frame.fillPoses(
            jointSpaces,
            renderer.xr.getReferenceSpace(),
            transforms,
          )) {
            for (let i = 0; i < handBoneNames.length; i++) {
              const name = handBoneNames[i];
              const index = handBones[name];
              localMatrix.fromArray(transforms, i * 16)
                .decompose(rightHandLandmarks[i], localQuaternion, localVector2);
            }
          }
        }
      } else {
        rightGamepadEnabled = false;
      }

      // const handOffsetScale = localPlayer.avatar ? localPlayer.avatar.height / 1.5 : 1;
      const handOffsetScale = 1;
      const leftHandOffset = new THREE.Vector3(0.2, -0.2, -0.4);
      const rightHandOffset = new THREE.Vector3(-0.2, -0.2, -0.4);
      if (!leftGamepadPosition) {
        leftGamepadPosition = localVector2.copy(localVector)
          .add(localVector3.copy(leftHandOffset).multiplyScalar(handOffsetScale).applyQuaternion(localQuaternion))
          .toArray();
        leftGamepadQuaternion = localQuaternion.toArray();
        leftGamepadPointer = 0;
        leftGamepadGrip = 0;
        leftGamepadEnabled = false;
      }
      if (!rightGamepadPosition) {
        rightGamepadPosition = localVector2.copy(localVector)
          .add(localVector3.copy(rightHandOffset).multiplyScalar(handOffsetScale).applyQuaternion(localQuaternion))
          .toArray();
        rightGamepadQuaternion = localQuaternion.toArray();
        rightGamepadPointer = 0;
        rightGamepadGrip = 0;
        rightGamepadEnabled = false;
      }

      pose = frame.getViewerPose(referenceSpace);
      localMatrix.fromArray(pose.transform.matrix)
        .decompose(localVector2, localQuaternion2, localVector3);
      let playerPosition = localVector2.toArray();
      let playerRotation = localQuaternion2.toArray();

      return [
        [playerPosition, playerRotation],
        [leftGamepadPosition, leftGamepadQuaternion, leftGamepadPointer, leftGamepadGrip, leftGamepadEnabled],
        [rightGamepadPosition, rightGamepadQuaternion, rightGamepadPointer, rightGamepadGrip, rightGamepadEnabled],
        [leftHandLandmarks, rightHandLandmarks],
      ];
    // }
  }
  static getXrMeshes(session, referenceSpace, frame) {
    return Array.from(frame.detectedMeshes.values());
  }
  static getXrPlanes(session, referenceSpace, frame) {
    return Array.from(frame.detectedPlanes.values());
  }
  static getXrDepth(renderer, session, referenceSpace, frame) {
    const pose = frame.getViewerPose(referenceSpace);
    const views = pose.views;
    for (let i = 0; i < views.length; i++) {
      const xrWebGLBinding = renderer.xr.getBinding();
      const depthInfo = xrWebGLBinding.getDepthInformation(view);
      const uvTransform = depthInfo.normDepthBufferFromNormView.matrix;
      const texture = depthInfo.texture;
      const rawValueToMeters = depthInfo.rawValueToMeters;
    }
  }
  /* #injectRigInput(frame) {
    debugger;

    console.log('inject rig 1');
    let leftGamepadPosition, leftGamepadQuaternion, leftGamepadPointer, leftGamepadGrip, leftGamepadEnabled;
    let rightGamepadPosition, rightGamepadQuaternion, rightGamepadPointer, rightGamepadGrip, rightGamepadEnabled;

    const localPlayer = this.playersManager.getLocalPlayer();
    const {renderer} = this.engineRenderer;
    const session = renderer.xr.getSession();
    console.log('inject rig 2', !!session);
    if (session && localPlayer.avatar) {
      let inputSources = Array.from(session.inputSources);
      inputSources = ['right', 'left']
        .map(handedness => inputSources.find(inputSource => inputSource.handedness === handedness));
      
      console.log('inject rig 3', inputSources.length);

      let pose;
      if (inputSources[0] && (pose = frame.getPose(inputSources[0].gripSpace, renderer.xr.getReferenceSpace()))) {
        localMatrix.fromArray(pose.transform.matrix)
          .decompose(localVector2, localQuaternion2, localVector3);
        if (inputSources[0].profiles.includes('oculus-touch-v2')) {
          localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(1, 0, 0), -Math.PI*0.5));
        } else if (!inputSources[0].profiles.includes('oculus-hand')) {
          localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(1, 0, 0), -Math.PI));
        } else {
          localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(0, 0, 1), Math.PI*0.5)).multiply(localQuaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.2));
        }
        leftGamepadPosition = localVector2.toArray(localArray);
        leftGamepadQuaternion = localQuaternion2.toArray(localArray2);

        const {gamepad} = inputSources[0];
        if (gamepad && gamepad.buttons.length >= 2) {
          const {buttons} = gamepad;
          leftGamepadPointer = buttons[0].value;
          leftGamepadGrip = buttons[1].value;
        } else {
          leftGamepadPointer = 0;
          leftGamepadGrip = 0;
        }
        leftGamepadEnabled = true;
      } else {
        leftGamepadEnabled = false;
      }

      console.log('inject rig 4');

      if (inputSources[1] && (pose = frame.getPose(inputSources[1].gripSpace, renderer.xr.getReferenceSpace()))) {
        localMatrix.fromArray(pose.transform.matrix)
          .decompose(localVector2, localQuaternion2, localVector3);
        if (inputSources[1].profiles.includes('oculus-touch-v2')) {
          localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(1, 0, 0), -Math.PI*0.5));
        } else if (!inputSources[1].profiles.includes('oculus-hand')) {
          localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(1, 0, 0), -Math.PI));
        } else {
          localQuaternion2.multiply(localQuaternion3.setFromAxisAngle(localVector3.set(0, 0, 1), -Math.PI*0.5)).multiply(localQuaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.2));
        }
        rightGamepadPosition = localVector2.toArray(localArray3);
        rightGamepadQuaternion = localQuaternion2.toArray(localArray4);

        const {gamepad} = inputSources[1];
        if (gamepad && gamepad.buttons.length >= 2) {
          const {buttons} = gamepad;
          rightGamepadPointer = buttons[0].value;
          rightGamepadGrip = buttons[1].value;
        } else {
          rightGamepadPointer = 0;
          rightGamepadGrip = 0;
        }
        rightGamepadEnabled = true;
      } else {
        rightGamepadEnabled = false;
      }

      console.log('inject rig 5');

      const handOffsetScale = localPlayer.avatar ? localPlayer.avatar.height / 1.5 : 1;
      const leftHandOffset = new THREE.Vector3(0.2, -0.2, -0.4);
      const rightHandOffset = new THREE.Vector3(-0.2, -0.2, -0.4);
      if (!leftGamepadPosition) {
        leftGamepadPosition = localVector2.copy(localVector)
          .add(localVector3.copy(leftHandOffset).multiplyScalar(handOffsetScale).applyQuaternion(localQuaternion))
          .toArray();
        leftGamepadQuaternion = localQuaternion.toArray();
        leftGamepadPointer = 0;
        leftGamepadGrip = 0;
        leftGamepadEnabled = false;
      }
      if (!rightGamepadPosition) {
        rightGamepadPosition = localVector2.copy(localVector)
          .add(localVector3.copy(rightHandOffset).multiplyScalar(handOffsetScale).applyQuaternion(localQuaternion))
          .toArray();
        rightGamepadQuaternion = localQuaternion.toArray();
        rightGamepadPointer = 0;
        rightGamepadGrip = 0;
        rightGamepadEnabled = false;
      }

      console.log('inject rig 6');

      pose = frame.getViewerPose(renderer.xr.getReferenceSpace());
      localMatrix.fromArray(pose.transform.matrix)
        .decompose(localVector2, localQuaternion2, localVector3);
      let playerPosition = localVector2.toArray();
      let playerRotation = localQuaternion2.toArray();

      console.log('inject rig 7');

      return [
        [playerPosition, playerRotation],
        [leftGamepadPosition, leftGamepadQuaternion, leftGamepadPointer, leftGamepadGrip, leftGamepadEnabled],
        [rightGamepadPosition, rightGamepadQuaternion, rightGamepadPointer, rightGamepadGrip, rightGamepadEnabled],
      ];

      // localPlayer.avatar.setLocalAvatarPose([
      //   [playerPosition, playerRotation],
      //   [leftGamepadPosition, leftGamepadQuaternion, leftGamepadPointer, leftGamepadGrip, leftGamepadEnabled],
      //   [rightGamepadPosition, rightGamepadQuaternion, rightGamepadPointer, rightGamepadGrip, rightGamepadEnabled],
      // ]);

      console.log('inject rig 8');
    }
  } */
  async enterXr(mode) {
    let sessionMode;
    let sessionOpts;
    switch (mode) {
      case 'VR': {
        sessionMode = 'immersive-vr';
        sessionOpts = {
          requiredFeatures: [
            'local-floor',
            // 'bounded-floor',
          ],
          optionalFeatures: [
            'hand-tracking',
            'mesh-detection',
            'plane-detection',
          ],
        };
        break;
      }
      case 'AR': {
        sessionMode = 'immersive-ar';
        sessionOpts = {
          requiredFeatures: [
            'local-floor',
            // 'bounded-floor',
            'mesh-detection',
            'plane-detection',
            'hand-tracking',
            'depth-sensing',
            // 'camera-access',
          ],
          optionalFeatures: [
          ],
          depthSensing: {
          //   // usagePreference: ["gpu-optimized", "cpu-optimized"],
          //   // formatPreference: ["luminance-alpha", "float32"],
            usagePreference: 'gpu-optimized',
            formatPreference: 'luminance-alpha',
          }
        };
        break;
      }
    }

    let session = null;
    try {
      console.log('try session 1', {sessionMode, sessionOpts});
      session = await navigator.xr.requestSession(sessionMode, sessionOpts);
      console.log('try session 2', {session});
    } catch (err) {
      try {
        console.log('try session 3', {sessionMode});
        session = await navigator.xr.requestSession(sessionMode);
        console.log('try session 4', {session});
      } catch (err) {
        console.warn(err);
      }
    }
    console.log('try request session', session);
    if (session) {
      // Called when we've successfully acquired a XRSession. In response we
      // will set up the necessary session state and kick off the frame loop.
      const onSessionStarted = async (session) => {
        console.log('on session started 1', session, this.playersManager);

        // const localPlayer = this.playersManager.getLocalPlayer();
        // localPlayer.enterXr();
        session.addEventListener('end', onSessionEnded);

        console.log('on session started 2', session);

        // Get a frame of reference, which is required for querying poses.
        /* session.requestReferenceSpace('local').then((refSpace) => {
          // Inform the session that we're ready to begin drawing.
          session.requestAnimationFrame(onXRFrame);
        }).catch(err => {
          console.warn(err);
        }); */

        // console.log('on session started 3', session);
      };

      // Called either when the user has explicitly ended the session (like in
      // onEndSession()) or when the UA has ended the session for any reason.
      // At this point the session object is no longer usable and should be
      // discarded.
      const onSessionEnded = (e) => {
        // const localPlayer = this.playersManager.getLocalPlayer();
        // localPlayer.exitXr();
        session.removeEventListener('end', onSessionEnded);

        this.dispatchEvent({
          type: 'sessionend',
        })
      };

      console.log('outer on session started 1');
      onSessionStarted(session);
      console.log('outer on session started 2');
      const {renderer} = this.engineRenderer;
      // const referenceSpaceTypes = ['local-floor', 'bounded-floor', 'viewer'];
      const referenceSpaceTypes = ['local-floor', 'bounded-floor', 'local'];
      for (const referenceSpaceType of referenceSpaceTypes) {
        try {
          renderer.xr.setReferenceSpaceType(referenceSpaceType);
          await renderer.xr.setSession(session);
          console.log('session ok', {referenceSpaceType});
          break;
        } catch(err) {
          console.warn(err, {
            referenceSpaceType,
          });
        }
      }
    }
  }
  exitXr() {
    const {renderer} = this.engineRenderer;
    const session = renderer.xr.getSession();
    if (session) {
      session.end();
    } else {
      throw new Error('not in xr session');
    }
  }
  update() {
    const {renderer} = this.engineRenderer;
    const session = renderer.xr.getSession();
    if (session) {
      // update meshes
      const meshes = XRManager.getXrMeshes(session, renderer.xr.getReferenceSpace(), renderer.xr.getFrame());
      for (const mesh of meshes) {
        const entry = this.meshes.find(m => m.value.mesh === mesh);
        if (!entry) {
          const geometry = new THREE.BufferGeometry();
          const {
            vertices,
            indices,
            meshSpace,
          } = mesh;
          geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          geometry.setIndex(new THREE.BufferAttribute(indices, 1));
          geometry.computeVertexNormals();
          const material = meshMaterial;
          const object = new THREE.Mesh(geometry, material);

          const frame = renderer.xr.getFrame();
          const pose = frame.getPose(meshSpace, renderer.xr.getReferenceSpace());
          const {
            transform,
          } = pose;
          object.matrix.fromArray(transform.matrix)
            .decompose(object.position, object.quaternion, object.scale);

          this.add(object);
          object.updateMatrixWorld();

          const o = {
            mesh,
            object,
          };
          // console.log('create mesh', mesh);
          const entry = new CacheEntry(o, mesh.lastChangedTime);
          this.meshes.push(entry);
        } else {
          if (mesh.lastChangedTime !== entry.lastChangedTime) {
            const geometry = new THREE.BufferGeometry();
            const {
              vertices,
              indices,
              meshSpace,
            } = mesh;
            // console.log('update mesh', mesh);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.setIndex(new THREE.BufferAttribute(indices, 1));
            geometry.computeVertexNormals();

            entry.value.object.geometry.dispose();
            entry.value.object.geometry = geometry;

            const frame = renderer.xr.getFrame();
            const pose = frame.getPose(meshSpace, renderer.xr.getReferenceSpace());
            const {
              transform,
            } = pose;
            entry.value.object.matrix.fromArray(transform.matrix)
              .decompose(entry.value.object.position, entry.value.object.quaternion, entry.value.object.scale);
            entry.value.object.updateMatrixWorld();

            entry.lastChangedTime = mesh.lastChangedTime;
          }
        }
      }
      for (const entry of this.meshes) {
        const mesh = entry.value.mesh;
        if (!meshes.some(m => m === mesh)) {
          this.remove(entry.value.object);
          this.meshes.splice(this.meshes.indexOf(entry), 1);
        }
      }

      // update planes
      const planes = XRManager.getXrPlanes(session, renderer.xr.getReferenceSpace(), renderer.xr.getFrame());
      for (const plane of planes) {
        const entry  = this.planes.find(p => p.value.plane === plane);
        if (!entry) {
          const {
            polygon,
            planeSpace,
          } = plane;

          const geometry = makeShapeGeometry(polygon);
          const material = planeMaterial;
          const object = new THREE.Mesh(geometry, material);

          const frame = renderer.xr.getFrame();
          const pose = frame.getPose(planeSpace, renderer.xr.getReferenceSpace());
          const {
            transform,
          } = pose;
          object.matrix.fromArray(transform.matrix)
            .decompose(object.position, object.quaternion, object.scale);

          this.add(object);
          object.updateMatrixWorld();

          const o = {
            plane,
            object,
          };
          // console.log('create plane', plane);
          const entry = new CacheEntry(o, plane.lastChangedTime);
          this.planes.push(entry);
        } else {
          if (plane.lastChangedTime !== entry.lastChangedTime) {
            const {
              polygon,
              planeSpace,
            } = plane;
            // console.log('update plane', plane);
            const geometry = makeShapeGeometry(polygon);
            geometry.computeVertexNormals();

            entry.value.object.geometry.dispose();
            entry.value.object.geometry = geometry;

            const frame = renderer.xr.getFrame();
            const pose = frame.getPose(planeSpace, renderer.xr.getReferenceSpace());
            const {
              transform,
            } = pose;
            entry.value.object.matrix.fromArray(transform.matrix)
              .decompose(entry.value.object.position, entry.value.object.quaternion, entry.value.object.scale);
            entry.value.object.updateMatrixWorld();

            entry.lastChangedTime = plane.lastChangedTime;
          }
        }
      }
      for (const entry of this.planes) {
        const plane = entry.value.plane;
        if (!planes.some(p => p === plane)) {
          this.remove(entry.value.object);
          this.planes.splice(this.planes.indexOf(entry), 1);
        }
      }

      // if (meshes.length > 0 || planes.length > 0) {
      //   console.log('got meshes', {
      //     meshes,
      //     planes,
      //   });
      // }
    }
  }
};