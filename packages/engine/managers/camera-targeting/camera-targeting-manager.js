import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import physicsManager from '../../physics/physics-manager.js';

//

const localVector = new THREE.Vector3();
// const localQuaternion = new THREE.Quaternion();
// const localEuler = new THREE.Euler();
// const localEuler2 = new THREE.Euler();

//

/* const bboxMeshGeometry = new THREE.BoxGeometry(1, 1, 1);
const bboxMeshMaterial = new THREE.MeshNormalMaterial({
  color: 0xff0000,
  opacity: 0.3,
  transparent: true,
}); */

//

const radius = 0.5;
const height = 0.2;
const radialSegments = 4;
const heightSegments = 1;
const makeConeGeometry = () => {
  const geometry = new THREE.ConeGeometry(
    radius,
    height,
    radialSegments,
    heightSegments,
  );
  geometry.rotateX(-Math.PI/2);
  geometry.rotateZ(Math.PI/4);
  geometry.scale(10, 5, 5);
  return geometry;
};
const getPyramidConvexGeometry = (() => {
  let shapeAddress = null;

  return () => {
    if (shapeAddress === null) {
      const geometry = makeConeGeometry();

      const fakeMesh = new THREE.Mesh(geometry);
      const physicsScene = physicsManager.getScene();
      const buffer = physicsScene.cookConvexGeometry(fakeMesh);
      shapeAddress = physicsScene.createConvexShape(buffer);
    }
    return shapeAddress;
  };
})();

//

const makeFakeMaterial = () => {
  const material = new THREE.MeshBasicMaterial({
    color: 0xFF0000,
    opacity: 0.2,
    transparent: true,
  });
  return material;
};

//

const targetGeometry = (() => {
  const lineWidth = 0.1;
  const lineLength = 0.5;
  const topRightForwardCornerGeometry = (() => {
    // depth
    const box1 = new THREE.BoxGeometry(lineWidth, lineWidth, lineLength)
      .translate(-lineWidth / 2, -lineWidth / 2, -lineLength / 2);
    // width
    const box2 = new THREE.BoxGeometry(lineLength, lineWidth, lineWidth)
      .translate(-lineLength / 2, -lineWidth / 2, -lineWidth / 2);
    // height
    const box3 = new THREE.BoxGeometry(lineWidth, lineLength, lineWidth)
      .translate(-lineWidth / 2, -lineLength / 2, -lineWidth / 2);
    const geometry = BufferGeometryUtils.mergeBufferGeometries([
      box1,
      box2,
      box3,
    ]);
    return geometry;
  })();

  const size = 1;
  const directionize = (geometry, direction) => {
    // translate
    geometry = geometry
      .translate(
        direction.x * size / 2,
        direction.y * size / 2,
        direction.z * size / 2,
      );
    // add direction attribute
    const directionAttribute = new Float32Array(geometry.attributes.position.array.length);
    for (let i = 0; i < directionAttribute.length; i += 3) {
      directionAttribute[i + 0] = direction.x;
      directionAttribute[i + 1] = direction.y;
      directionAttribute[i + 2] = direction.z;
    }
    geometry.setAttribute('direction', new THREE.BufferAttribute(directionAttribute, 3));
    // return
    return geometry;
  };

  // 8 corners
  const geometry = BufferGeometryUtils.mergeBufferGeometries([
    directionize(
      topRightForwardCornerGeometry.clone(),
      new THREE.Vector3(1, 1, 1)
    ),
    directionize(
      topRightForwardCornerGeometry.clone()
        .applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2)),
      new THREE.Vector3(1, 1, -1),
    ),
    directionize(
      topRightForwardCornerGeometry.clone()
        .applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI)),
      new THREE.Vector3(-1, 1, -1),
    ),
    directionize(
      topRightForwardCornerGeometry.clone()
        .applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.PI / 2)),
      new THREE.Vector3(-1, 1, 1),
    ),
    directionize(
      topRightForwardCornerGeometry.clone()
        .applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2)),
      new THREE.Vector3(1, -1, 1),
    ),
    directionize(
      topRightForwardCornerGeometry.clone()
        .applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
        .applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2)),
      new THREE.Vector3(1, -1, -1),
    ),
    directionize(
      topRightForwardCornerGeometry.clone()
        .applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
        .applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI)),
      new THREE.Vector3(-1, -1, -1),
    ),
    directionize(
      topRightForwardCornerGeometry.clone()
        .applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
        .applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.PI / 2)),
      new THREE.Vector3(-1, -1, 1),
    ),
  ]);
  return geometry;
})();
/* const targetMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
}); */
const targetMaterial = new THREE.ShaderMaterial({
  // color: 0x000000,
  uniforms: {
    size: {
      value: new THREE.Vector3(1, 1, 1),
      needsUpdate: true,
    },
  },
  vertexShader: `\
    attribute vec3 direction;
    uniform vec3 size;

    void main() {
      vec3 p = position;
      p += direction * size * 0.5;

      vec4 modelPosition = modelMatrix * vec4(p, 1.0);
      vec4 modelViewPosition = viewMatrix * modelPosition;
      gl_Position = projectionMatrix * modelViewPosition;
    }
  `,
  fragmentShader: `\
    void main() {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  `,
});

//

/* const cornersGeometry = (() => {
  const cornerGeometry = (() => {
    const width = 0.2;
    const height = 0.02;
    const depth = 0.02;

    const topLeftTop = new THREE.BoxGeometry(width, height, depth)
      .translate(width / 2, -height / 2, 0);
    const topLeftBottom = new THREE.BoxGeometry(height, width, depth)
      .translate(height / 2, -width / 2, 0);
    const geometry = BufferGeometryUtils.mergeBufferGeometries([
      topLeftTop,
      topLeftBottom,
    ]);

    // direction attribute, 2d, top left
    const direction = new Float32Array(geometry.attributes.position.array.length / 3 * 2);
    geometry.setAttribute('direction', new THREE.BufferAttribute(direction, 2));

    return geometry;
  })();
  const setDirectionFloat32Array = (direction, x, y) => {
    for (let i = 0; i < direction.length; i += 2) {
      direction[i + 0] = x;
      direction[i + 1] = y;
    }
  };
  const g1 = cornerGeometry.clone()
    .applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
  setDirectionFloat32Array(
    g1.attributes.direction.array,
    -1,
    -1
  );
  const bottomRight = cornerGeometry.clone()
    .applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI));
  setDirectionFloat32Array(
    bottomRight.attributes.direction.array,
    1,
    -1
  );
  const topLeft = cornerGeometry.clone()
    .applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
  setDirectionFloat32Array(
    topLeft.attributes.direction.array,
    1,
    1
  );
  const g4 = cornerGeometry.clone()
    // .applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
  setDirectionFloat32Array(
    g4.attributes.direction.array,
    -1,
    1
  );
  const geometry = BufferGeometryUtils.mergeBufferGeometries([
    g1,
    bottomRight,
    topLeft,
    g4,
  ]);
  return geometry;
})(); */
const makeCornersMaterial = ({
  worldSize,
}) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      size: {
        value: worldSize,
        needsUpdate: true,
      },
      quaternion: {
        value: new THREE.Vector4(),
        needsUpdate: true,
      },
    },
    vertexShader: `\
      uniform vec2 size;
      uniform vec4 quaternion;
      attribute vec2 direction;

      vec3 applyQuaternion(vec3 v, vec4 q) {
        return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
      }

      void main() {
        vec3 p = position;
        // p += applyQuaternion(vec3(direction * size * 0.5, 0.), quaternion);
        p.xy += direction * size * 0.5;

        vec4 modelPosition = modelMatrix * vec4(p, 1.0);
        // modelPosition.xyz += applyQuaternion(vec3(direction * size * 0.5, 0.), quaternion);
        vec4 modelViewPosition = viewMatrix * modelPosition;
        gl_Position = projectionMatrix * modelViewPosition;
      }
`,
    fragmentShader: `\
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
`,
    // transparent: true,
  });
};

//

export class CameraTargetingManager extends THREE.Object3D {
  constructor({
    engineRenderer,
    cameraManager,
    playersManager,
    physicsTracker,
    // sounds,
  }) {
    super();

    if (!engineRenderer || !cameraManager || !playersManager || !physicsTracker /* || !sounds*/) {
      debugger;
    }
    this.engineRenderer = engineRenderer;
    this.cameraManager = cameraManager;
    this.playersManager = playersManager;
    this.physicsTracker = physicsTracker;

    /* {
      const coneMesh = new THREE.Mesh(
        makeConeGeometry(),
        makeFakeMaterial(),
      );
      engineRenderer.scene.add(coneMesh);
      coneMesh.updateMatrixWorld();
      this.coneMesh = coneMesh;
    } */

    /* {
      const targetMesh = new THREE.Mesh(
        targetGeometry,
        targetMaterial,
      );
      engineRenderer.scene.add(targetMesh);
      targetMesh.updateMatrixWorld();
      this.targetMesh = targetMesh;
    } */
    this.targetMeshes = [];
  }

  update(timestamp, timeDiff) {
    return;

    const {camera} = this.engineRenderer;
    // const {position, quaternion} = camera;
    const sweepDistance = 100;
    const maxHits = 1;

    const pyramidConvexGeometryAddress = getPyramidConvexGeometry();

    const physicsScene = physicsManager.getScene();
    const localPlayer = this.playersManager.getLocalPlayer();

    const pushPhysicsConfig = () => {
      let physicsObjects = this.physicsTracker.getPhysicsObjects();
      physicsObjects = physicsObjects.filter(physicsObject => {
        if (physicsObject.isTerrain) {
          physicsScene.disableGeometryQueries(physicsObject);
          return true;
        } else {
          return false;
        }
      });

      return () => {
        for (let i = 0; i < physicsObjects.length; i++) {
          const physicsObject = physicsObjects[i];
          physicsScene.enableGeometryQueries(physicsObject);
        }
      };
    };
    const popPhysicsConfig = pushPhysicsConfig();

    let position, quaternion;
    if (this.cameraManager.getMode() === 'firstperson') {
      position = camera.position;
      quaternion = camera.quaternion;
    } else {
      position = localPlayer.position;
      quaternion = localPlayer.quaternion;

      // localEuler.setFromQuaternion(localPlayer.quaternion, 'YXZ');
      // localEuler2.setFromQuaternion(camera.quaternion, 'YXZ');
      // localEuler.x = localEuler2.x;
      // quaternion = localQuaternion.setFromEuler(localEuler);
    }

    const direction = localVector.set(0, 0, -1)
      .applyQuaternion(quaternion);

    let result = physicsScene.sweepConvexShape(
      pyramidConvexGeometryAddress,
      position,
      quaternion,
      direction,
      sweepDistance,
      maxHits,
    );

    popPhysicsConfig();

    // filter results
    result = result.filter(r => {
      return r.objectId !== localPlayer?.characterPhysics?.characterController?.physicsId;
    });
    result = result.map(r => {
      const {
        objectId,
      } = r;

      const targetObject = this.physicsTracker.getPhysicsObjectByPhysicsId(objectId);
      return targetObject;
    });
    result = result.filter(r => !!r);

    // remove old target meshes
    for (let i = 0; i < this.targetMeshes.length; i++) {
      const targetMesh = this.targetMeshes[i];
      this.remove(targetMesh);
    }
    this.targetMeshes.length = 0;

    /* for (let i = 0; i < result.length; i++) {
      const {
        physicsId,
      } = result[i];

      const result2 = this.physicsTracker.getPairByPhysicsId(physicsId);
      const [
        app,
        targetObject,
      ] = result2;

      if (targetObject) {
        const bbox2 = targetObject.physicsMesh ?
          new THREE.Box3()
            .setFromBufferAttribute(targetObject.physicsMesh.geometry.attributes.position)
            .applyMatrix4(targetObject.physicsMesh.matrixWorld)
        :
          null;

        if (bbox2) {
          const size2 = bbox2.getSize(new THREE.Vector3());

          const targetMesh = new THREE.Mesh(
            targetGeometry,
            targetMaterial,
          );
          targetMesh.position.set(
            (bbox2.min.x + bbox2.max.x)/2,
            (bbox2.min.y + bbox2.max.y)/2,
            (bbox2.min.z + bbox2.max.z)/2,
          );
          targetMesh.material.uniforms.size.value.copy(size2);
          targetMesh.material.uniforms.size.needsUpdate = true;
          this.add(targetMesh);
          targetMesh.updateMatrixWorld();
          this.targetMeshes.push(targetMesh);
        }
      }
    } */

    /* // add new target meshes
    for (let i = 0; i < result.length; i++) {
      const {
        physicsId,
      } = result[i];

      const result2 = this.physicsTracker.getPairByPhysicsId(physicsId);
      const [
        app,
        // physicsObject: targetObject,
        targetObject,
      ] = result2;

      if (targetObject) {
        const bbox2 = targetObject.physicsMesh ?
          new THREE.Box3()
            .setFromBufferAttribute(targetObject.physicsMesh.geometry.attributes.position)
            .applyMatrix4(targetObject.physicsMesh.matrixWorld)
        :
          null;

        if (bbox2) {
          const size2 = bbox2.getSize(new THREE.Vector3());
          // mesh for the bounding box
          const bboxMesh2 = new THREE.Mesh(
            bboxMeshGeometry,
            bboxMeshMaterial,
          );
          bboxMesh2.position.set(
            (bbox2.min.x + bbox2.max.x)/2,
            (bbox2.min.y + bbox2.max.y)/2,
            (bbox2.min.z + bbox2.max.z)/2,
          );
          bboxMesh2.scale.copy(size2);
          this.add(bboxMesh2);
          bboxMesh2.updateMatrixWorld();

          this.targetMeshes.push(bboxMesh2);
        }
      }
    } */

    /* // update target mesh to match player
    {
      const playersManager = this.playersManager;
      const localPlayer = playersManager.getLocalPlayer();
      this.targetMesh.position.copy(localPlayer.position);
      this.targetMesh.quaternion.copy(localPlayer.quaternion);
      this.targetMesh.updateMatrixWorld();
    } */

    const firstObject = result[0] ?? null;
    const firstApp = firstObject ? this.physicsTracker.getAppByPhysicsId(firstObject.physicsId) : null;
    this.dispatchEvent({
      type: 'focusupdate',
      app: firstApp,
      object: firstObject,
    });
  }
}