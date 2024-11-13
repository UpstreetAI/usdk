import * as THREE from 'three';
import React, {
  useState,
  useEffect,
} from 'react';
import reactHelpers from '../react-helpers.js';
import {CameraGeometry} from '../CameraGeometry.js';

//

const {
  // h1,
  div,
  button,
  span,
  label,
  input,
} = reactHelpers;

//

export default srcUrl => ctx => {
  const {
    useApp,
    // useFrame,
    // useLoreManager,
    // useLocalPlayer,
    useCameraManager,
    useComponentUi,
    useCleanup,
  } = ctx;

  const app = useApp();
  // const loreManager = useLoreManager();
  const cameraManager = useCameraManager();

  app.appType = 'camera';
  app.description = 'A virtual camera.';

  app.isCameraApp = true;

  // camera
  const camera = new THREE.PerspectiveCamera();
  app.add(camera);
  camera.updateMatrixWorld();
  app.camera = camera;

  // camera mesh
  {
    const cameraGeometry = new CameraGeometry();
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    const cameraMesh = new THREE.Mesh(cameraGeometry, material);
    app.add(cameraMesh);
    cameraMesh.visible = app.getComponent('visible') ?? true;
    cameraMesh.updateMatrixWorld();

    app.cameraMesh = cameraMesh;
  }

  // wait for load
  ctx.waitUntil((async () => {
    const res = await fetch(srcUrl);
    const j = await res.json();

    const {
      description,
      fov,
      aspect,
      dof,
    } = j;

    app.camera.fov = fov;
    app.camera.aspect = aspect;
    app.camera.updateProjectionMatrix();

    app.camera.dof = dof;

    if (description) {
      app.description = description;
    }

    app.addEventListener('componentsupdate', e => {
      if (e.keys.includes('visible')) {
        app.cameraMesh.visible = app.getComponent('visible') ?? true;
      }
    });
  })());

  /* // track lore items range
  const trackedApps = new Set();
  const itemsRange = 30;
  useFrame(() => {    
    const localPlayer = useLocalPlayer();
    const {position} = localPlayer;

    const apps = appManager.getApps();
    const inRangeApps = apps.filter(app => app.position.distanceTo(position) < itemsRange);
    const newlyInRangedApps = [];
    const newlyOutRangedApps = [];
    for (const app of inRangeApps) {
      if (!trackedApps.has(app)) {
        newlyInRangedApps.push(app);
      } else {
        newlyOutRangedApps.push(app);
      }
    }
  }); */

  const _controllerFnIsSet = controllerFn =>
      controllerFn?.isVirtualCameraControllerFn &&
      controllerFn?.app === app;
  
  useCleanup(() => {
    const controllerFns = cameraManager.getControllerFns();
    for (const controllerFn of controllerFns) {
      if (_controllerFnIsSet(controllerFn)) {
        cameraManager.unsetControllerFn(controllerFn);
      }
    }
  });

  // register components ui
  useComponentUi(({
    contentPath,
    setContentPath,
    debug,
  }) => {
    const [visible, setVisible] = useState(() => app.getComponent('visible') ?? true);
    const [isSet, setIsSet] = useState(() => {
      const controllerFn = cameraManager.getControllerFn();
      return _controllerFnIsSet(controllerFn);
    });

    useEffect(() => {
      const controllerfnupdate = e => {
        setIsSet(_controllerFnIsSet(e.data.controllerFn));
      };
      cameraManager.addEventListener('controllerfnupdate', controllerfnupdate);

      return () => {
        cameraManager.removeEventListener('controllerfnupdate', controllerfnupdate);
      };
    }, []);

    //

    useEffect(() => {
      const oldVisible = app.getComponent('visible');
      if (visible !== oldVisible) {
        app.setComponent('visible', visible);
      }
    }, [
      visible,
    ]);

    //

    return div([
      div([
        label([
          span('Visible'),
          input({
            type: 'checkbox',
            onChange: e => {
              setVisible(e.target.checked);
            },
            checked: visible,
          }),
        ]),
      ]),

      div([
        label([
          span('View'),
          button({
            onClick: e => {
              cameraManager.setVirtualCameraApp(app);
            },
          }, [
            isSet ? 'Unset' : 'Set',
          ]),
        ]),
      ]),
    ]);
  });

  return app;
};