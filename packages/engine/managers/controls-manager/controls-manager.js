import * as THREE from 'three';
import * as BufferGeometryUtils from '../../../three/examples/jsm/utils/BufferGeometryUtils.js';
import physicsManager from '../../physics/physics-manager.js';

//

const localVector = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localEuler = new THREE.Euler();
const localVector2D = new THREE.Vector2();
const localRaycaster = new THREE.Raycaster();
const localBox = new THREE.Box3();

//

const cornersGeometry = (() => {
  const cornerGeometry = (() => {
    const width = 0.2;
    const height = 0.02;
    const depth = 0.02;

    const topLeftTop = new THREE.BoxBufferGeometry(width, height, depth)
      .translate(width / 2, -height / 2, 0);
    const topLeftBottom = new THREE.BoxBufferGeometry(height, width, depth)
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
})();
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
class CornersMesh extends THREE.Mesh {
  constructor({
    camera,
    worldSize,
  }) {
    const geometry = cornersGeometry;
    const material = makeCornersMaterial({
      worldSize,
    });
    super(geometry, material);

    this.onBeforeRender = () => {
      localEuler.setFromQuaternion(camera.quaternion, 'YXZ');
      localEuler.x = 0;
      localEuler.z = 0;
      localEuler.y += Math.PI;
      this.quaternion.setFromEuler(localEuler);
  
      material.uniforms.quaternion.value.x = this.quaternion.x;
      material.uniforms.quaternion.value.y = this.quaternion.y;
      material.uniforms.quaternion.value.z = this.quaternion.z;
      material.uniforms.quaternion.value.w = this.quaternion.w;
      material.uniforms.quaternion.needsUpdate = true;
    };
  }
}

//

export class ControlsManager extends EventTarget {
  constructor({
    engineRenderer,
    physicsTracker,
    cameraManager,
  }) {
    super();

    this.engineRenderer = engineRenderer;
    this.physicsTracker = physicsTracker;
    this.cameraManager = cameraManager;

    this.mode = 'firstperson';
    this.highlightedPoint = null;
    this.highlightedApp = null;
    this.selectedPoint = null;
    this.selectedApp = null;
  }

  getMode() {
    return this.mode;
  }
  setMode(mode) {
    this.mode = mode;

    this.dispatchEvent(new MessageEvent('modechange', {
      data: {
        mode: this.mode,
      },
    }));
    this.dispatchEvent(new MessageEvent('mousemove', {
      data: null,
    }));

    const oldHighlightedApp = this.highlightedApp;
    this.highlightedApp = null;
    if (oldHighlightedApp) {
      this.dispatchEvent(new MessageEvent('highlightedappchange', {
        data: {
          app: null,
        },
      }));
    }

    const oldSelectedApp = this.selectedApp;
    this.selectedPoint = null;
    this.selectedApp = null;
    if (oldSelectedApp) {
      this.dispatchEvent(new MessageEvent('selectedappchange', {
        data: {
          app: null,
        },
      }));
    }
  }

  #makeSelectMeshFromApp(selectedApp) {
    const physicsTracker = this.physicsTracker;
    const physicsObjects = physicsTracker.getAppPhysicsObjects(selectedApp);
  
    const boundingBox = localBox;
    const physicsMesh = physicsObjects[0].getObjectByName('physicsMesh');
    if (physicsMesh) {
      physicsMesh.geometry.computeBoundingBox();
      boundingBox.setFromObject(physicsMesh);
    }
  
    const {camera} = this.engineRenderer;
  
    const center = boundingBox.getCenter(new THREE.Vector3());
    const corners = [
      // bottom left back
      boundingBox.min.clone(),
      // bottom right back
      new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z),
      // bottom right front
      new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
      // bottom left front
      new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
      // top left back
      new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
      // top right back
      new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
      // top right front
      boundingBox.max.clone(),
      // top left front
      new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z),
    ];
  
    // project the 2d corners back to the app plane
    const appToCameraNormal = center.clone()
      .sub(camera.position)
    appToCameraNormal.y = 0;
    appToCameraNormal.normalize();
    const appToCameraQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      appToCameraNormal,
    );
    const appPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      appToCameraNormal,
      selectedApp.position
    );
  
    const cornersAppPoints = corners.map(corner => {
      const corner2 = appPlane.projectPoint(corner, new THREE.Vector3());
      return corner2;
    });
  
    // compute the width/height of the corners app points along the app plane
    let min = new THREE.Vector2(Infinity, Infinity);
    let max = new THREE.Vector2(-Infinity, -Infinity);
    const planeRightVector = new THREE.Vector3(1, 0, 0)
      .applyQuaternion(appToCameraQuaternion);
    const planeUpVector = new THREE.Vector3(0, 1, 0)
      .applyQuaternion(appToCameraQuaternion);
    cornersAppPoints.forEach(cornerAppPoint => {
      // get vector from center of the app
      const vector = cornerAppPoint.clone()
        .sub(center);
      // get right distance
      const rightDistance = vector.dot(planeRightVector);
      // get up distance
      const upDistance = vector.dot(planeUpVector);
      // update min/max
      min.x = Math.min(min.x, rightDistance);
      min.y = Math.min(min.y, upDistance);
      max.x = Math.max(max.x, rightDistance);
      max.y = Math.max(max.y, upDistance);
    });
    const worldSize = max.clone().sub(min);
  
    // render the corners in the world
    const mesh = new CornersMesh({
      camera,
      worldSize,
    });
    mesh.position.copy(center);
    mesh.quaternion.copy(appToCameraQuaternion);
    this.engineRenderer.scene.add(mesh);
    mesh.updateMatrixWorld();
    mesh.frustumCulled = false;

    return mesh;
  }
  #makeSelectMeshFromPoint(
    position,
    quaternion,
  ) {
    const {camera} = this.engineRenderer;

    const worldSize = new THREE.Vector2(0.5, 0.5);

    const mesh = new CornersMesh({
      camera,
      worldSize,
    });
    mesh.position.copy(position);
    mesh.quaternion.copy(quaternion);
    this.engineRenderer.scene.add(mesh);
    mesh.updateMatrixWorld();
    mesh.frustumCulled = false;

    return mesh;
  }

  handleClick(e) {
    const oldSelectedApp = this.selectedApp;

    if (this.selectMesh) {
      this.engineRenderer.scene.remove(this.selectMesh);
      this.selectMesh = null;

      this.cameraManager.setControllerFn(null);
    }

    const handle = this.mode === 'adventure';
    if (handle) {
      this.selectedPoint = this.highlightedPoint?.slice();
      this.selectedApp = this.highlightedApp;

      let selectMesh;
      if (this.selectedApp.appType !== 'blockadelabsskybox') {
        selectMesh = this.#makeSelectMeshFromApp(this.selectedApp);
      } else {
        const selectedPoint = new THREE.Vector3().fromArray(this.selectedPoint);

        const {camera} = this.engineRenderer;
        const appToCameraQuaternion = new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().lookAt(
            camera.position,
            selectedPoint,
            new THREE.Vector3(0, 1, 0),
          )
        );

        selectMesh = this.#makeSelectMeshFromPoint(
          selectedPoint,
          appToCameraQuaternion,
        );
      }

      this.engineRenderer.scene.add(selectMesh);
      selectMesh.updateMatrixWorld();
      this.selectMesh = selectMesh;

      this.cameraManager.setControllerFn(() => {
        this.engineRenderer.camera.lookAt(selectMesh.position);
        this.engineRenderer.camera.updateMatrixWorld();
      });
    } else {
      this.selectedPoint = null;
      this.selectedApp = null;
    }

    if (this.selectedApp !== oldSelectedApp) {
      this.dispatchEvent(new MessageEvent('selectedappchange', {
        data: {
          app: this.selectedApp,
        },
      }));
    }

    return handle;
  }
  handleMouseMove(e) {
    const {
      camera,
    } = this.engineRenderer;

    const oldHighlightedApp = this.highlightedApp;

    const handle = this.mode === 'adventure';
    if (handle) {
      this.dispatchEvent(new MessageEvent('mousemove', {
        data: {
          clientX: e.clientX,
          clientY: e.clientY,
        },
      }));

      const physicsScene = physicsManager.getScene();
      localVector2D.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      );
      localRaycaster.setFromCamera(localVector2D, camera);

      const p = localRaycaster.ray.origin;
      const q = localQuaternion.setFromUnitVectors(
        localVector.set(0, 0, -1),
        localRaycaster.ray.direction
      );

      const result = physicsScene.raycast(p, q);
      // console.log('got result', result);
      if (result) {
        const app = this.physicsTracker.getAppByPhysicsId(result.objectId);
        this.highlightedPoint = result.point.slice();
        this.highlightedApp = app;
      } else {
        // console.log('no raycast');
        this.highlightedPoint = null;
        this.highlightedApp = null;
      }
    } else {
      // console.log('no adventure');
      this.dispatchEvent(new MessageEvent('mousemove', {
        data: null,
      }));

      this.highlightedPoint = null;
      this.highlightedApp = null;
    }

    if (this.highlightedApp !== oldHighlightedApp) {
      this.dispatchEvent(new MessageEvent('highlightedappchange', {
        data: {
          app: this.highlightedApp,
        },
      }));
    }

    return handle;
  }
  handleMouseLeave(e) {
    this.dispatchEvent(new MessageEvent('mousemove', {
      data: null,
    }));

    if (this.highlightedApp) {
      this.highlightedPoint = null;
      this.highlightedApp = null;

      this.dispatchEvent(new MessageEvent('highlightedappchange', {
        data: {
          app: null,
        },
      }));
    }
  }
}