import * as THREE from 'three';
import React, { useState, useEffect } from 'react';
import reactHelpers from '../react-helpers.js';

const {
  div,
  span,
  label,
  input,
  button,
  select,
  option,
} = reactHelpers;

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();

export default srcUrl => ctx => {
  // console.log('light', srcUrl)
  const {
    useApp,
    useFrame,
    useLocalPlayer,
    useCleanup,
    useLightingManager,
    useComponentUi,
  } = ctx;

  const app = useApp();
  const lightingManager = useLightingManager();

  app.appType = 'light';
  app.name = 'light';
  app.description = 'A scene light.';

  const worldLights = app;
  app.light = null;

  let json = null;
  ctx.waitUntil((async () => {
    const res = await fetch(srcUrl);
    json = await res.json();
    json = {
      lightType: 'ambient',
      args: [
        [255, 255, 255],
        1,
      ],
      position: [0, 0, 0],
      ...json
    }
    _render();
  })());

  const _render = () => {
    if (json !== null) {
      let {lightType, args, position, shadow} = json;
      // console.log('json', json)
      const light = (() => {
        switch (lightType) {
          case 'ambient': {
            return new THREE.AmbientLight(
              new THREE.Color().fromArray(args[0]).multiplyScalar(1/255).getHex(),
              args[1]
            );
          }
          case 'directional': {
            return new THREE.DirectionalLight(
              new THREE.Color().fromArray(args[0]).multiplyScalar(1/255).getHex(),
              args[1]
            );
          }
          case 'point': {
            return new THREE.PointLight(
              new THREE.Color().fromArray(args[0]).multiplyScalar(1/255).getHex(),
              args[1],
              args[2],
              args[3]
            );
          }
          case 'spot': {
            return new THREE.SpotLight(
              new THREE.Color().fromArray(args[0]).multiplyScalar(1/255).getHex(),
              args[1],
              args[2],
              args[3],
              args[4],
              args[5]
            );
          }
          case 'hemisphere': {
            return new THREE.HemisphereLight(
              new THREE.Color().fromArray(args[0]).multiplyScalar(1/255).getHex(),
              new THREE.Color().fromArray(args[1]).multiplyScalar(1/255).getHex(),
              args[2]
            );
          }
          default: {
            return null;
          }
        }
      })();
      if (light) {
        lightingManager.addLight(light, lightType, shadow, position);

        worldLights.add(light);
        if (light.target) {
          worldLights.add(light.target);
        }
        light.updateMatrixWorld(true);

        app.light = light;
      } else {
        console.warn('invalid light spec:', json);
      }
    }
  };

  useFrame(() => {
    if (lightingManager.lights.length > 0) {
      for (const light of lightingManager.lights) {
        if (!light.lastAppMatrixWorld.equals(app.matrixWorld)) {
          light.position.copy(app.position);
          // light.quaternion.copy(app.quaternion);
          if (light.target) {
            light.quaternion.setFromRotationMatrix(
              new THREE.Matrix4().lookAt(
                light.position,
                light.target.position,
                localVector.set(0, 1, 0),
              )
            );
          }
          light.scale.copy(app.scale);
          light.matrix.copy(app.matrix);
          light.matrixWorld.copy(app.matrixWorld);
          light.lastAppMatrixWorld.copy(app.matrixWorld);
          light.updateMatrixWorld();
        }
      }

      const localPlayer = useLocalPlayer();
      for (const light of lightingManager.lights) {
        if (light.isDirectionalLight) {
          light.plane.setFromNormalAndCoplanarPoint(localVector.set(0, 0, -1).applyQuaternion(light.shadow.camera.quaternion), light.shadow.camera.position);
          const planeTarget = light.plane.projectPoint(localPlayer.position, localVector);
          // light.updateMatrixWorld();
          const planeCenter = light.shadow.camera.position.clone();

          const x = planeTarget.clone().sub(planeCenter)
            .dot(localVector2.set(1, 0, 0).applyQuaternion(light.shadow.camera.quaternion));
          const y = planeTarget.clone().sub(planeCenter)
            .dot(localVector2.set(0, 1, 0).applyQuaternion(light.shadow.camera.quaternion));

          light.shadow.camera.left = x + light.shadow.camera.initialLeft;
          light.shadow.camera.right = x + light.shadow.camera.initialRight;
          light.shadow.camera.top = y + light.shadow.camera.initialTop;
          light.shadow.camera.bottom = y + light.shadow.camera.initialBottom;
          light.shadow.camera.updateProjectionMatrix();
          light.updateMatrixWorld();
        }
      }
    }
  });

  useComponentUi(({
    contentPath,
    setContentPath,
    debug,
  }) => {
    console.log('useComponentUi', useComponentUi)
    console.log('app.light', app.light)
    console.log('doing stuff', json)
    const [lightType, setLightType] = useState(json.lightType);
    const [lightIntensity, setLightIntensity] = useState(json.args[1]);
    const [lightColor, setLightColor] = useState({r: json.args[0][0] / 255, g: json.args[0][1] / 255, b: json.args[0][2] / 255});
    const [lightDistance, setLightDistance] = useState(json.distance ?? 0);
    const [lightAngle, setLightAngle] = useState(json.angle ?? (Math.PI / 3));
    const [lightPenumbra, setLightPenumbra] = useState(json.penumbra ?? 0);
    const [lightDecay, setLightDecay] = useState(json.decay ?? 1);

    //

    // useEffect(() => {
    //   const light = app.light;
    //   if (light) {
    //     light.intensity = lightIntensity;
    //     light.color.set(lightColor); // Set the color of the light
    //     light.needsUpdate = true; // This flag tells Three.js to update the light in the scene
    //   }
    // }, [lightIntensity, lightColor]);


    useEffect(() => {
      // console.log('lightType', lightType)
      const light = app.light;
      // console.log('light', light)
      const _addLight = (newLight, lightType) => {
        lightingManager.addLight(newLight, lightType);
            app.light = newLight;
            worldLights.remove(light);
            worldLights.add(newLight);
            if (newLight.target) {
              worldLights.add(newLight.target);
            }
            newLight.updateMatrixWorld(true);
      }
        if (lightType === 'ambient') {
            const {color, intensity} = light;
            const args = [
              [
                Math.round(color.r * 255),
                Math.round(color.g * 255),
                Math.round(color.b * 255),
              ],
              intensity,
            ];
            json = {
              ...json,
              lightType: 'ambient',
              args,
            };
            lightingManager.removeLight(light);

            const newLight = new THREE.AmbientLight(
              new THREE.Color().fromArray(args[0]).multiplyScalar(1/255).getHex(),
              args[1]
            );
              _addLight(newLight, lightType)

        } else if (lightType === 'directional') {
            const {color, intensity} = light;
            const args = [
              [
                Math.round(color.r * 255),
                Math.round(color.g * 255),
                Math.round(color.b * 255),
              ],
              intensity,
            ];
            json = {
              ...json,
              lightType: 'directional',
              args,
            };
            // destroy the light and recreate it
            lightingManager.removeLight(light);

            const newLight = new THREE.DirectionalLight(
              new THREE.Color().fromArray(args[0]).multiplyScalar(1/255).getHex(),
              args[1]
            );
            _addLight(newLight, lightType);
        } else if (lightType === 'point' && !light.isPointLight) {
            const {color, intensity, distance, decay} = light;
            const args = [
              [
                Math.round(color.r * 255),
                Math.round(color.g * 255),
                Math.round(color.b * 255),
              ],
              intensity,
              distance,
              decay,
            ];
            json = {
              ...json,
              lightType: 'point',
              args,
            };
            const newLight = new THREE.PointLight(
              new THREE.Color().fromArray(args[0]).multiplyScalar(1/255).getHex(),
              args[1],
              args[2],
              args[3]
            );
            _addLight(newLight, lightType);
        } else if (lightType === 'spot' && !light.isSpotLight) {
            const {color, intensity, distance, angle, penumbra, decay} = light;
            const args = [
              [
                Math.round(color.r * 255),
                Math.round(color.g * 255),
                Math.round(color.b * 255),
              ],
              intensity,
              distance,
              angle,
              penumbra,
              decay,
            ];
            json = {
              ...json,
              lightType: 'spot',
              args,
            };
            const newLight = new THREE.SpotLight(
              new THREE.Color().fromArray(args[0]).multiplyScalar(1/255).getHex(),
              args[1],
              args[2],
              args[3],
              args[4],
              args[5]
            );
            _addLight(newLight, lightType);
        } else if (lightType === 'hemisphere' && !light.isHemisphereLight) {
          const color = light.color ?? new THREE.Color(0xffffff);
          const groundColor = light.groundColor ?? new THREE.Color(0xffffff);
          const intensity = light.intensity ?? 1;

          const args = [
            [
              Math.round(color.r * 255),
              Math.round(color.g * 255),
              Math.round(color.b * 255),
            ],
            [
              Math.round(groundColor.r * 255),
              Math.round(groundColor.g * 255),
              Math.round(groundColor.b * 255),
            ],
            intensity,
          ];
          json = {
            ...json,
            lightType: 'hemisphere',
            args,
          };
          const newLight = new THREE.HemisphereLight(
            new THREE.Color().fromArray(args[0]).multiplyScalar(1/255).getHex(),
            new THREE.Color().fromArray(args[1]).multiplyScalar(1/255).getHex(),
            args[2]
          );
          _addLight(newLight, lightType);
        }
    }, [lightType]);

    //

    const _setLightProps = (light) => {
      light.intensity = lightIntensity;
      // console.log('lightColor', lightColor)
      light.color.set(lightColor);
      if (light.isSpotLight || light.isPointLight || light.isDirectionalLight) {
        light.distance = lightDistance;
      }
      if (light.isSpotLight) {
        light.angle = lightAngle;
        light.penumbra = lightPenumbra;
      }
      if (light.isSpotLight || light.isPointLight) {
        light.decay = lightDecay;
      }
    };

    useEffect(() => {
      if (app.light) {
        _setLightProps(app.light);
      }
    }, [lightIntensity, lightColor, lightDistance, lightAngle, lightPenumbra, lightDecay]);

    const lightTypeControls = () => {
      // UI controls shared by all light types
      const commonControls = div([
        div([
          label([
            span('Intensity'),
            input({
              type: 'number',
              value: lightIntensity,
              step: '0.1',
              min: '0',
              onChange: e => setLightIntensity(parseFloat(e.target.value)),
            })
          ]),
        ]),
        div([
          label([
            span('Color'),
            input({
              type: 'color',
              value: lightColor,
              onChange: e => {
                app.light.color = new THREE.Color(e.target.value);
                setLightColor(e.target.value)
                app.light.needsUpdate = true;
              }
            })
          ]),
        ]),
      ]);

      switch (lightType) {
        case 'ambient':
          // Ambient light has no additional properties
          return commonControls;
        case 'directional':
          return div([
            commonControls,
          ]);
        case 'spot':
          // Directional and Spot lights have angle and penumbra
          return div([
            commonControls,
            div([
              label([
                span('Angle'),
                input({
                  type: 'range',
                  value: lightAngle,
                  step: '0.01',
                  min: '0',
                  max: Math.PI / 2,
                  onChange: e => setLightAngle(parseFloat(e.target.value)),
                })
              ]),
            ]),
            div([
              label([
                span('Penumbra'),
                input({
                  type: 'number',
                  value: lightPenumbra,
                  step: '0.1',
                  min: '0',
                  max: '1',
                  onChange: e => setLightPenumbra(parseFloat(e.target.value)),
                })
              ]),
            ]),
          ]);
        case 'point':
          // Point light has distance and decay
          return div([
            commonControls,
            div([
              label([
                span('Distance'),
                input({
                  type: 'number',
                  value: lightDistance,
                  step: '1',
                  min: '0',
                  onChange: e => setLightDistance(parseFloat(e.target.value)),
                })
              ]),
            ]),
            div([
              label([
                span('Decay'),
                input({
                  type: 'number',
                  value: lightDecay,
                  step: '0.1',
                  min: '0',
                  onChange: e => setLightDecay(parseFloat(e.target.value)),
                })
              ]),
            ]),
          ]);
        case 'hemisphere':
          // Hemisphere light might have a ground color control in addition to common controls
          // Placeholder for ground color, assuming you will implement it similarly to lightColor
          // const [groundColor, setGroundColor] = useState('#ffffff');
          return div([
            commonControls,
            // Additional controls for hemisphere light can be added here
          ]);
        default:
          return null;
      }
    };

    return div([
      div([
        label([
          span('Light Type'),
          select({
            onChange: e => {
              setLightType(e.target.value);
              // Additional logic to reset properties if needed when light type changes
            },
            value: lightType,
          }, [
            option({ value: 'ambient' }, 'Ambient'),
            option({ value: 'directional' }, 'Directional'),
            option({ value: 'point' }, 'Point'),
            option({ value: 'spot' }, 'Spot'),
            option({ value: 'hemisphere' }, 'Hemisphere'),
          ]),
        ]),
      ]),
      lightTypeControls(),
      // ... more UI elements as needed ...
    ]);
  });

  useCleanup(() => {
    for (const light of lightingManager.lights) {
      lightingManager.removeLight(light);
    }
  });

  return app;
};
// export const contentId = ${this.contentId};
// export const name = ${this.name};
// export const description = ${this.description};
// export const type = 'light';
// export const components = ${this.components};
