import * as THREE from 'three';

//

export default srcUrl => (ctx) => {
  const {
    useApp,
    useThreeUtils,
    usePhysics,
    usePhysicsTracker,
    useCleanup,
  } = ctx;
  
  const app = useApp();
  const physicsScene = usePhysics();
  const physicsTracker = usePhysicsTracker();
  const {BufferGeometryUtils} = useThreeUtils();

  app.name = 'floor';
  app.description = 'Floor for the scene';

  app.setComponent('interactive', false);

  // meshes

  /* const planeGeometry = new THREE.PlaneGeometry(0.9, 0.9)
    .rotateX(-Math.PI/2)
  const geometries = [];
  const range = 1000;
  for (let dz = -range/2; dz <= range/2; dz++) {
    for (let dx = -range/2; dx <= range/2; dx++) {
      const geometry = planeGeometry.clone()
        .applyMatrix4(new THREE.Matrix4().makeTranslation(dx, 0, dz));
      geometries.push(geometry);
    }
  }
  const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
  const material = new THREE.MeshBasicMaterial({
    color: 0xCCCCCC,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.01;
  // const visible = app.getComponent('visible');
  // mesh.visible = visible !== undefined ? visible : true;
  app.add(mesh);
  mesh.updateMatrixWorld(); */

  const getVisible = () => app.getComponent('visible') ?? true;

  const floorMesh = (() => {
    const geometry = new THREE.PlaneBufferGeometry(100, 100)
      .applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    const material = new THREE.ShaderMaterial({
      vertexShader: `\
        varying vec2 vUv;
        varying vec3 vPosition;
  
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `\
        varying vec2 vUv;
        varying vec3 vPosition;
  
        void main() {
          // float a = 1.0 - length(vPosition) / 20.0;
          // gl_FragColor = vec4(vUv.x, 0., vUv.y, a);
  
          float distanceToCenter = length(vec3(vPosition.x, 0., vPosition.z));
          gl_FragColor = vec4(vec3(0.8), 1. - distanceToCenter / 10.);
        }
      `,
      // side: THREE.FrontSide,
      transparent: true,
      alphaToCoverage: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -0.1;
    return mesh;
  })();
  app.add(floorMesh);

  const gridMesh = (() => {
    const geometry = (() => {
      const s = 300;
      // const maxManhattanDistance = localVector2D.set(0, 0).manhattanDistanceTo(localVector2D2.set(s/2, s/2));

      let geometry = new THREE.PlaneBufferGeometry(s, s, s, s)
        .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0))));

      for (let i = 0; i < geometry.attributes.position.array.length; i += 3) {
        const x = geometry.attributes.position.array[i];
        const z = geometry.attributes.position.array[i+2];
        const d = Math.abs(x); 
        const f = Math.min(Math.max((d - 5) / 30, 0), 1)**2;
        // const y = -0.01 +
        //   Math.min(Math.max(gridSimplex.noise2D(x/500, z/500) * f * 30, 0), 100) *
        //   Math.min(stacksBoundingBox.distanceToPoint(new THREE.Vector2(x, z)), 1) *
        //   Math.min(forestBoundingBox.distanceToPoint(new THREE.Vector2(x, z)), 1);
        const y = 0;
        // console.log('got distance', z, d/maxDistance);
        geometry.attributes.position.array[i+1] = y;
      }
      
      /* const dynamicPositionYs = new Float32Array(geometry.attributes.position.array.length/3);
      for (let i = 0; i < dynamicPositionYs.length; i += 3) {
        const x = geometry.attributes.position.array[i*3];
        const z = geometry.attributes.position.array[i*3+2];

        // const d = Math.abs(x); 
        // const f = Math.min(Math.max((d - 5) / 30, 0), 1)**2;

        const y = gridSimplex2.noise2D(x/500, z/500) * 3;
        dynamicPositionYs[i] = y;
        dynamicPositionYs[i+1] = y;
        dynamicPositionYs[i+2] = y;
      }
      geometry.setAttribute('dynamicPositionY', new THREE.BufferAttribute(dynamicPositionYs, 1)); */

      geometry = geometry.toNonIndexed();
      const barycentrics = new Float32Array(geometry.attributes.position.array.length);
      let barycentricIndex = 0;
      for (let i = 0; i < geometry.attributes.position.array.length; i += 9) {
        barycentrics[barycentricIndex++] = 1;
        barycentrics[barycentricIndex++] = 0;
        barycentrics[barycentricIndex++] = 0;
        barycentrics[barycentricIndex++] = 0;
        barycentrics[barycentricIndex++] = 1;
        barycentrics[barycentricIndex++] = 0;
        barycentrics[barycentricIndex++] = 0;
        barycentrics[barycentricIndex++] = 0;
        barycentrics[barycentricIndex++] = 1;
      }
      geometry.setAttribute('barycentric', new THREE.BufferAttribute(barycentrics, 3));

      return geometry;
    })();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        /* uBeat: {
          type: 'f',
          value: 1,
        },
        uBeat2: {
          type: 'f',
          value: 0,
        }, */
      },
      vertexShader: `\
        attribute float y;
        attribute vec3 barycentric;
        // attribute float dynamicPositionY;
        // uniform float uBeat2;
        varying float vUv;
        varying vec3 vBarycentric;
        varying vec3 vPosition;

        void main() {
          vUv = uv.x;
          vBarycentric = barycentric;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position /* + vec3(0., dynamicPositionY * uBeat2, 0.) */, 1.0);
        }
      `,
      fragmentShader: `\
        // uniform float uBeat;
        precision highp float;
        precision highp int;

        #define PI 3.1415926535897932384626433832795

        varying vec3 vBarycentric;
        varying vec3 vPosition;

        // const vec3 lineColor1 = vec3(${new THREE.Color(0x66bb6a).toArray().join(', ')});
        // const vec3 lineColor2 = vec3(${new THREE.Color(0x9575cd).toArray().join(', ')});
        const vec3 lineColor1 = vec3(${new THREE.Color(0x333333).toArray().join(', ')});
        const vec3 lineColor2 = vec3(${new THREE.Color(0x111111).toArray().join(', ')});

        float edgeFactor(vec3 bary, float width) {
          // vec3 bary = vec3(vBC.x, vBC.y, 1.0 - vBC.x - vBC.y);
          vec3 d = fwidth(bary);
          vec3 a3 = smoothstep(d * (width - 0.5), d * (width + 0.5), bary);
          return min(min(a3.x, a3.y), a3.z);
        }

        vec4 sRGBToLinear( in vec4 value ) {
          return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
        }

        void main() {
          vec3 c = mix(lineColor1, lineColor2, vPosition.y / 10.);
          // vec3 p = fwidth(vPosition);
          vec3 p = vPosition;
          float f = min(mod(p.x, 1.), mod(p.z, 1.));
          f = min(f, mod(1.-p.x, 1.));
          f = min(f, mod(1.-p.z, 1.));
          f *= 10.;
          float a = /*0.7 + */max(1. - f, 0.);

          // fade out baased on distance, to 20m
          a *= 1. - min(length(vPosition) / 30., 1.);
          if (a >= 0.5) {
            a = 1.;
          } else {
            a = 0.;
          }
          a *= 0.2;

          // if (a < 0.5) {
          //   discard;
          // } else {
            gl_FragColor = vec4(c /* * uBeat */, a);
            gl_FragColor = sRGBToLinear(gl_FragColor);
          // }

          // #include <tonemapping_fragment>
			    // #include <encodings_fragment>
        }
      `,
      side: THREE.DoubleSide,
      alphaToCoverage: true,
      transparent: true,

      clipping: false,
      fog: false,
      lights: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  })();
  app.add(gridMesh);

  // visibility
  const updateVisibility = () => {
    const visible = getVisible();
    floorMesh.visible = visible;
    gridMesh.visible = visible;
  };
  updateVisibility();
  app.addEventListener('componentsupdate', e => {
    const {
      keys,
    } = e.data;
    if (keys.includes('visible')) {
      updateVisibility();
    }
  });

  const componentPosition = app.getComponent('position');
  if (componentPosition) {
    app.position.fromArray(componentPosition);
  }
  // physics
  const physicsObject = physicsScene.addPlaneGeometry(
    app.position,
    new THREE.Quaternion(0, 0, 0.7071067811865475, 0.7071067811865476),
    // new THREE.Quaternion(0, 0, 0, 1),
    false
  );
  physicsTracker.addAppPhysicsObject(app, physicsObject);

  useCleanup(() => {
    physicsScene.removeGeometry(physicsObject);
    physicsTracker.removeAppPhysicsObject(app, physicsObject);
  });

  return app;
};