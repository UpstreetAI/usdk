import * as THREE from 'three';
import {
  Frame360Mesh,
} from '../meshes/frame360/Frame360Mesh.js';

//

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();

//

const height = 0.5;
const width = 0.5;
const capsuleRadius = width / 2;
const capsuleHalfHeight = height / 2;

//

export default srcUrl => ctx => {
  const {
    useApp,
    usePhysics,
    usePhysicsTracker,
    // useEngineRenderer,
    // useLoreManager,
    useCleanup,
  } = ctx;

  const app = useApp();
  const physics = usePhysics();
  const physicsTracker = usePhysicsTracker();
  // const engineRenderer = useEngineRenderer();
  // const loreManager = useLoreManager();

  app.appType = 'item360';

  ctx.waitUntil((async () => {
    const res = await fetch(srcUrl);
    const json = await res.json();

    const {
      id,
      itemImageUrl,
      item360ImageUrl,
      scale = 1,
    } = json;

    // app.name = srcUrl.match(/([^\/]*)$/)[1];
    // app.description = '';
    app.name = json.name;
    app.description = json.description;

    // let live = true;
    const mesh = new Frame360Mesh();
    mesh.position.y = scale * 0.5;
    mesh.scale.setScalar(scale);
    mesh.frustrumCulled = false;
    // (async () => {
      await mesh.load({
        frame360ImageUrl: item360ImageUrl,
      });
      // if (!live) return;

      app.add(mesh);
      mesh.updateMatrixWorld();

      const getVisible = () => app.getComponent('visible') ?? true;
      const updateMeshVisible = () => {
        mesh.visible = getVisible();
      };
      updateMeshVisible();

      // physics
      let scenePhysicsObject = null;
      const enablePhysics = () => {
        const halfAvatarCapsuleHeight = (height + width) / 2; // (full world height of the capsule) / 2

        localMatrix.compose(
          localVector.set(0, halfAvatarCapsuleHeight, 0), // start position
          localQuaternion.setFromAxisAngle(localVector2.set(0, 0, 1), Math.PI / 2), // rotate 90 degrees
          localVector2.set(capsuleRadius, halfAvatarCapsuleHeight, capsuleRadius)
        )
          .premultiply(app.matrixWorld)
          .decompose(localVector, localQuaternion, localVector2);

        scenePhysicsObject = physics.addCapsuleGeometry(
          localVector,
          localQuaternion,
          capsuleRadius,
          capsuleHalfHeight,
          false
        );
        physicsTracker.addAppPhysicsObject(app, scenePhysicsObject);
        scenePhysicsObject.updateMatrixWorld();

        scenePhysicsObject.name = app.name;
        scenePhysicsObject.description = app.description;

        // console.log('enable physics', scenePhysicsObject);
      };
      const disablePhysics = () => {
        physics.removeGeometry(scenePhysicsObject);
        physicsTracker.removeAppPhysicsObject(app, scenePhysicsObject);
        scenePhysicsObject = null;

        // console.log('disable physics', scenePhysicsObject);
      };

      const getPhysicsEnabled = getVisible;
      if (getPhysicsEnabled()) {
        enablePhysics();
      }

      const updatePhysics = () => {
        queueMicrotask(() => {
          const physicsEnabled = getPhysicsEnabled();
          // console.log('check physics enabled', physicsEnabled, app);
          if (physicsEnabled && !scenePhysicsObject) {
            // console.log('enable physics', app);
            enablePhysics();
          } else if (!physicsEnabled && scenePhysicsObject) {
            // console.log('disable physics', app);
            disablePhysics();
          }
        });
      };
      app.addEventListener('componentsupdate', e => {
        const {
          keys,
        } = e;
        if (keys.includes('visible')) {
          updateMeshVisible();
          updatePhysics();
        }
      });

      app.center = new THREE.Object3D();
      app.center.position.y = capsuleHalfHeight;
      app.add(app.center);
      app.center.updateMatrixWorld();

      // lore
      // const k = app.instanceId + ':' + (physicsObject.physicsId + '').padStart(5, '0')
      // const actor = loreManager.createActor({
      //   id: app.instanceId,
      //   type: 'object',
      //   spec: {
      //     name: app.name,
      //     description: app.description,
      //   },
      //   object: app,
      // });
      // loreManager.addActor(actor);

      // // update transforms
      // const lastMatrixWorld = app.matrixWorld.clone();
      // useFrame(() => {
      //   if (!app.matrixWorld.equals(lastMatrixWorld)) {
      //     lastMatrixWorld.copy(app.matrixWorld);

      //     if (app.prop) {
      //       localVector.copy(app.position);
      //       localVector.y += app.prop.avatar.height;
      //       app.prop.characterPhysics.setPosition(localVector);

      //       localEuler.setFromQuaternion(app.quaternion, 'YXZ');
      //       localEuler.x = 0;
      //       localEuler.z = 0;
      //       app.prop.quaternion.setFromEuler(localEuler);
      //     }
      //   }
      // });

      useCleanup(() => {
        // live = false;
        // physicsObject.parent.remove(physicsObject);

        // loreManager.removeActor(actor);

        if (scenePhysicsObject) {
          physics.removeGeometry(scenePhysicsObject);
          physicsTracker.removeAppPhysicsObject(app, scenePhysicsObject);
          scenePhysicsObject = null;
        }
      });
    // })();
  })());

  return app;
};
