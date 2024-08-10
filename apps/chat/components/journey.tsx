'use client';

// import { createRoot } from 'react-dom/client'
import React, { Suspense, useEffect, useRef, useState, useMemo, forwardRef, use } from 'react'
import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber'
import { Physics, RigidBody } from "@react-three/rapier";
import { OrbitControls, KeyboardControls } from '@react-three/drei'
import Ecctrl from 'ecctrl';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  Vector2,
  Vector3,
  Quaternion,
  Camera,
  PerspectiveCamera,
  Raycaster,
  Plane,
  Box2,
  Box3,
  Mesh,
  TextureLoader,
  NoToneMapping,
  LinearSRGBColorSpace,
  SRGBColorSpace,
  Texture,
  BufferGeometry,
  BoxGeometry,
  DataTexture,
  LuminanceFormat,
  RGBAFormat,
  UnsignedByteType,
  NearestFilter,
  PlaneGeometry,
  BufferAttribute,
  ShaderMaterial,
  MeshBasicMaterial,
  Color,
} from 'three';
import { Button } from '@/components/ui/button';
import { CapsuleGeometry } from '@/utils/three/CapsuleGeometry.mjs';
import {
  describe,
  getDepth,
  detect,
  segment,
  segmentAll,
} from '../utils/vision.mjs';

const geometryResolution = 256;
const outlineWidth = 0.005;
const matplotlibColors = {
  "tab20": [
    "#1f77b4",
    "#aec7e8",
    "#ff7f0e",
    "#ffbb78",
    "#2ca02c",
    "#98df8a",
    "#d62728",
    "#ff9896",
    "#9467bd",
    "#c5b0d5",
    "#8c564b",
    "#c49c94",
    "#e377c2",
    "#f7b6d2",
    "#7f7f7f",
    "#c7c7c7",
    "#bcbd22",
    "#dbdb8d",
    "#17becf",
    "#9edae5"
  ],
  "tab20b": [
    "#393b79",
    "#5254a3",
    "#6b6ecf",
    "#9c9ede",
    "#637939",
    "#8ca252",
    "#b5cf6b",
    "#cedb9c",
    "#8c6d31",
    "#bd9e39",
    "#e7ba52",
    "#e7cb94",
    "#843c39",
    "#ad494a",
    "#d6616b",
    "#e7969c",
    "#7b4173",
    "#a55194",
    "#ce6dbd",
    "#de9ed6"
  ],
  "tab20c": [
    "#3182bd",
    "#6baed6",
    "#9ecae1",
    "#c6dbef",
    "#e6550d",
    "#fd8d3c",
    "#fdae6b",
    "#fdd0a2",
    "#31a354",
    "#74c476",
    "#a1d99b",
    "#c7e9c0",
    "#756bb1",
    "#9e9ac8",
    "#bcbddc",
    "#dadaeb",
    "#636363",
    "#969696",
    "#bdbdbd",
    "#d9d9d9"
  ]
};
const defaultColors = matplotlibColors.tab20b.concat(matplotlibColors.tab20c);
const characterController = {
  capsuleHalfHeight: 0.35, // Half-height of the character capsule
  capsuleRadius: 0.3, // Radius of the character capsule
  floatHeight: 0.3, // Height of the character when floating
};

type DepthSpec = {
  width: number,
  height: number,
  data: Float32Array,
};

export function useAspectContain(width: number, height: number, factor: number = 1): [number, number, number] {
  const v = useThree((state) => {
    const camera2 = state.camera.clone();
    camera2.position.set(0, 0, 1);
    camera2.quaternion.set(0, 0, 0, 1);
    camera2.scale.setScalar(1);
    camera2.updateMatrixWorld();

    const vp = state.viewport.getCurrentViewport(camera2);
    return vp;
  });
  const aspectRatio = width / height

  const adaptedWidth = v.aspect > aspectRatio ? v.height * aspectRatio : v.width
  const adaptedHeight = v.aspect > aspectRatio ? v.height : v.width / aspectRatio

  return [adaptedWidth * factor, adaptedHeight * factor, 1]
}

const makeBoxOutlineGeometry = (b: Box3) => {
  let x1: number;
  let y1: number;
  let x2: number;
  let y2: number;
  if (b.min.x < b.max.x) {
    x1 = b.min.x;
    x2 = b.max.x;
  } else {
    x1 = b.max.x;
    x2 = b.min.x;
  }
  if (b.min.y < b.max.y) {
    y1 = b.min.y;
    y2 = b.max.y;
  } else {
    y1 = b.max.y;
    y2 = b.min.y;
  }

  const w = x2 - x1;
  const h = y2 - y1;

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  const baseGeometry = new BoxGeometry(outlineWidth, 1 + outlineWidth * 2, outlineWidth);
  const geometries = [
    // top
    baseGeometry.clone()
      .rotateZ(Math.PI / 2)
      .scale(w, 1, 1)
      .translate(mx, y1, 0),
    // bottom
    baseGeometry.clone()
      .rotateZ(Math.PI / 2)
      .scale(w, 1, 1)
      .translate(mx, y2, 0),
    // left
    baseGeometry.clone()
      .scale(1, h, 1)
      .translate(x1, my, 0),
    // right
    baseGeometry.clone()
      .scale(1, h, 1)
      .translate(x2, my, 0),
  ];
  const g = BufferGeometryUtils.mergeGeometries(geometries);
  // console.log('got g', x1, y1, x2, y2);
  return g;
};

const makePixelsArray = ({
  width,
  height,
  x1,
  y1,
  x2,
  y2,
}: {
  width: number,
  height: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
}) => {
  const result = new Uint8Array(width * height);
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      const index = y * width + x;
      result[index] = 1;
    }
  }
  return result;
};
const colorizePixelsArrayMono = (uint8Array: Uint8Array, {
  color = new Color(1, 0, 0),
  alpha = 0.2,
} = {}) => {
  const rgbaArray = new Uint8Array(uint8Array.length * 4);
  {
    let j = 0;
    for (let i = 0; i < uint8Array.length; i++) {
      const v = !!uint8Array[i];
      const a = v ? 255 * alpha : 0;
      rgbaArray[j++] = v ? color.r * 255 : 0;
      rgbaArray[j++] = v ? color.g * 255 : 0;
      rgbaArray[j++] = v ? color.b * 255 : 0;
      rgbaArray[j++] = a;
    }
  }
  return rgbaArray;
};
const colorizePixelsArrayMulti = (uint8Array: Uint8Array, {
  colors = defaultColors,
  alpha = 0.5,
} = {}) => {
  const rgbaArray = new Uint8Array(uint8Array.length * 4);
  {
    const color = new Color();
    let j = 0;
    for (let i = 0; i < uint8Array.length; i++) {
      const v = uint8Array[i];
      color.set(colors[v % colors.length]);
      const a = v ? 255 * alpha : 0;
      rgbaArray[j++] = v ? color.r * 255 : 0;
      rgbaArray[j++] = v ? color.g * 255 : 0;
      rgbaArray[j++] = v ? color.b * 255 : 0;
      rgbaArray[j++] = a;
    }
  }
  return rgbaArray;
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const floorVector2 = (v: Vector2) => {
  v.x = Math.floor(v.x);
  v.y = Math.floor(v.y);
  return v;
};
// data is a float32array of w * h
// x if a float between 0 and w inclusive
// y if a float between 0 and h inclusive
const bilinearSample = (data: Float32Array, x: number, y: number, w: number, h: number) => {
  // // Map x and y to be within the bounds of the image
  // x *= (w - 1) / w;
  // y *= (h - 1) / h;

  // Clamp x and y to be within the bounds of the image
  x = clamp(x, 0, w - 1);
  y = clamp(y, 0, h - 1);

  // Calculate the integer parts and the fractional parts of x and y
  const x0 = Math.floor(x);
  const x1 = Math.min(x0 + 1, w - 1);
  const y0 = Math.floor(y);
  const y1 = Math.min(y0 + 1, h - 1);
  
  const dx = x - x0;
  const dy = y - y0;
  
  // Get the values at the four corners
  const index = (x: number, y: number) => y * w + x;
  const v00 = data[index(x0, y0)];
  const v01 = data[index(x0, y1)];
  const v10 = data[index(x1, y0)];
  const v11 = data[index(x1, y1)];
  
  // Perform the bilinear interpolation
  const v0 = v00 * (1 - dy) + v01 * dy;
  const v1 = v10 * (1 - dy) + v11 * dy;
  const value = v0 * (1 - dx) + v1 * dx;
  
  return value;
};
const makePlaneGeometry = () => new PlaneGeometry(1, 1, geometryResolution, geometryResolution);
const makePlaneGeometryFromScale = ({
  scale,
}: {
  scale: Vector3,
}) => {
  const planeGeometry = new PlaneGeometry(1, 1, geometryResolution, geometryResolution);
  const positions = planeGeometry.attributes.position.array;
  const p = new Vector3();
  for (let i = 0; i < positions.length; i += 3) {
    // load the point
    p.fromArray(positions, i);

    // scale the point to match the plane's world dimensions
    p.multiply(scale);

    // save the point
    p.toArray(positions, i);
  }
  return planeGeometry;
};
const makePlaneGeometryFromDepth = ({
  depth,
  camera,
  scale,
}: {
  depth: DepthSpec,
  camera: Camera,
  scale: Vector3,
}) => {
  const {
    width,
    height,
    data,
  } = depth;

  // copy camera to avoid modifying the original
  const baseCamera = camera.clone();
  baseCamera.position.set(0, 0, 1);
  baseCamera.quaternion.set(0, 0, 0, 1);
  baseCamera.scale.setScalar(1);
  baseCamera.updateMatrix();

  const planeGeometry = new PlaneGeometry(1, 1, geometryResolution, geometryResolution);
  const positions = planeGeometry.attributes.position.array;
  const p = new Vector3();
  const pWorld = new Vector3();
  const pNdc = new Vector3();
  const pNear = new Vector3();
  const pMid = new Vector3();
  const pDirection = new Vector3();
  const pTemp = new Vector3();
  for (let i = 0; i < positions.length; i += 3) {
    // load the point
    p.fromArray(positions, i);

    // sample point depth
    const x = (p.x + 0.5) * width;
    const y = (1 - (p.y + 0.5)) * height;
    const d = bilinearSample(data, x, y, width, height);

    // scale the point to match the plane's world dimensions
    pWorld.copy(p).multiply(scale);
    // project from world space to normalized device coordinates
    pNdc.copy(pWorld).project(baseCamera);
    // get the near and mid points
    pNear.copy(pNdc).setZ(-1).unproject(baseCamera); // near plane
    pMid.copy(pNdc).setZ(0).unproject(baseCamera); // midpoint between near and far plane
    // get the point direction
    pDirection.copy(pMid).sub(pNear).normalize();
    // push the point out from world space to the given depth
    const pDelta = pTemp.copy(pDirection).multiplyScalar(d);
    p.copy(pWorld).add(pDelta);

    // save the point
    p.toArray(positions, i);
  }
  return planeGeometry;
};

const img2blob = async (img: HTMLImageElement, type = 'image/webp', quality = 0.8) => {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(img, 0, 0);
  const blob = await new Promise<Blob>((accept, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        accept(blob);
      } else {
        reject(new Error('failed to convert canvas to blob'));
      }
    }, type, quality);
  });
  return blob;
};

//

const StoryCursor = forwardRef(({
  pressed,
}: {
  pressed: boolean,
}, ref: any) => {
  const scale = 1;
  const baseHeight = 0.2 * scale;
  const baseWidth = 0.03 * scale;
  const centerSpacing = baseWidth * scale;
  const outlineSize = 0.015 * scale;
    const baseWidth2 = baseWidth + outlineSize;
    const baseHeight2 = baseHeight + outlineSize;
  const pressTime = 0.2;

  const [lastPressedValue, setLastPressedValue] = useState(0);
  const [lastPressedTime, setLastPressedTime] = useState(-Infinity);
  const [geometry, setGeometry] = useState(() => {
    const _addYs = (geometry: BufferGeometry) => {
      const ys = new Float32Array(geometry.attributes.position.array.length / 3);
      for (let i = 0; i < ys.length; i++) {
        ys[i] = 1 - geometry.attributes.position.array[i * 3 + 1] / baseHeight;
      }
      geometry.setAttribute('y', new BufferAttribute(ys, 1));
    };
    const _addDirection = (geometry: BufferGeometry, direction: Vector3) => {
      const directions = new Float32Array(geometry.attributes.position.array.length);
      for (let i = 0; i < directions.length / 3; i++) {
        directions[i + 0] = direction.x;
        directions[i + 1] = direction.y;
        directions[i + 2] = direction.z;
      }
      geometry.setAttribute('direction', new BufferAttribute(directions, 3));
    };
    const _addMonocolor = (geometry: BufferGeometry, v: number) => {
      const monocolor = new Float32Array(geometry.attributes.position.array.length / 3).fill(v);
      geometry.setAttribute('monocolor', new BufferAttribute(monocolor, 1));
    };

    // top geometry
    const topGeometry = new BoxGeometry(baseWidth, baseHeight, baseWidth)
      .translate(0, baseHeight / 2 + centerSpacing, 0);
    _addYs(topGeometry);
    _addDirection(topGeometry, new Vector3(0, 1, 0));
    _addMonocolor(topGeometry, 0);
    // other geometries
    const leftGeometry = topGeometry.clone()
      .rotateZ(Math.PI / 2);
    _addDirection(leftGeometry, new Vector3(-1, 0, 0));
    _addMonocolor(leftGeometry, 0);
    const bottomGeometry = topGeometry.clone()
      .rotateZ(Math.PI);
    _addDirection(bottomGeometry, new Vector3(0, -1, 0));
    _addMonocolor(bottomGeometry, 0);
    const rightGeometry = topGeometry.clone()
      .rotateZ(-Math.PI / 2);
    _addDirection(rightGeometry, new Vector3(1, 0, 0));
    _addMonocolor(rightGeometry, 0);
    const forwardGeometry = topGeometry.clone()
      .rotateX(-Math.PI / 2);
    _addDirection(forwardGeometry, new Vector3(0, 0, -1));
    _addMonocolor(forwardGeometry, 0);
    const backGeometry = topGeometry.clone()
      .rotateX(Math.PI / 2);
    _addDirection(backGeometry, new Vector3(0, 0, 1));
    _addMonocolor(backGeometry, 0);
    // same thing, but scaled and inverted
    const topGeometry2 = new BoxGeometry(baseWidth2, baseHeight2, baseWidth2)
      .scale(-1, -1, -1)
      .translate(0, baseHeight / 2 + centerSpacing, 0);
    _addYs(topGeometry2);
    _addDirection(topGeometry2, new Vector3(0, 1, 0));
    _addMonocolor(topGeometry2, 1);
    const leftGeometry2 = topGeometry2.clone()
      .rotateZ(Math.PI / 2);
    _addDirection(leftGeometry2, new Vector3(-1, 0, 0));
    _addMonocolor(leftGeometry2, 1);
    const bottomGeometry2 = topGeometry2.clone()
      .rotateZ(Math.PI);
    _addDirection(bottomGeometry2, new Vector3(0, -1, 0));
    _addMonocolor(bottomGeometry2, 1);
    const rightGeometry2 = topGeometry2.clone()
      .rotateZ(-Math.PI / 2);
    _addDirection(rightGeometry2, new Vector3(1, 0, 0));
    _addMonocolor(rightGeometry2, 1);
    const forwardGeometry2 = topGeometry2.clone()
      .rotateX(-Math.PI / 2);
    _addDirection(forwardGeometry2, new Vector3(0, 0, -1));
    _addMonocolor(forwardGeometry2, 1);
    const backGeometry2 = topGeometry2.clone()
      .rotateX(Math.PI / 2);
    _addDirection(backGeometry2, new Vector3(0, 0, 1));
    _addMonocolor(backGeometry2, 1);
    // merged geometry
    const geometries = [
      topGeometry2,
      leftGeometry2,
      bottomGeometry2,
      rightGeometry2,
      forwardGeometry2,
      backGeometry2,
      topGeometry,
      leftGeometry,
      bottomGeometry,
      rightGeometry,
      forwardGeometry,
      backGeometry,
    ];
    const geometry = BufferGeometryUtils.mergeGeometries(geometries);
    return geometry;
  });
  const [material, setMaterial] = useState(() => {
    const material = new ShaderMaterial({
      uniforms: {
        uPress: {
          value: 0,
          // value: 0,
          // needsUpdate: true,
        },
      },
      vertexShader: `\
        uniform float uPress;
        attribute float y;
        attribute vec3 direction;
        attribute float monocolor;
        varying float vY;
        varying vec2 vUv;
        varying vec3 vDirection;
        varying float vMonocolor;

        void main() {
          vUv = uv;
          vY = y;
          vDirection = direction; // XXX offset by direction and time
          vMonocolor = monocolor;

          vec3 p = position * (0.5 + (1. - uPress) * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `\
        varying vec2 vUv;
        varying float vY;
        varying vec3 vDirection;
        varying float vMonocolor;

        void main() {
          vec3 c = vec3(0.1, 0.1, 0.1);
          gl_FragColor = vec4(c, 1.);
          gl_FragColor.rgb += vY * 0.15;
          gl_FragColor.rgb += vMonocolor;
          // gl_FragColor.rg += vUv * 0.2;
        }
      `,
      transparent: true,
    });
    return material;
  });
  useEffect(() => {
    const now = Date.now();
    setLastPressedValue(material.uniforms.uPress.value);
    setLastPressedTime(now);
  }, [pressed]);
  useFrame((state) => {
    const now = Date.now();
    const timeDiffS = (now - lastPressedTime) / 1000;
    const timeFactor = Math.min(Math.max(timeDiffS / pressTime, 0), 1);
    const pressedValue = +pressed;
    material.uniforms.uPress.value = (pressedValue * timeFactor) + (lastPressedValue * (1 - timeFactor));
  });

  return (<mesh geometry={geometry} material={material} ref={ref}>
  </mesh>);
});
StoryCursor.displayName = 'StoryCursor';

const JourneyForm = ({
  eventTarget,
}: {
  eventTarget: EventTarget,
}) => {
  const depthTypes = ['indoor', 'outdoor'];
  const [depthType, setDepthType] = useState(depthTypes[0]);

  return (
    <form className="flex" onSubmit={e => {
      e.preventDefault();
      e.stopPropagation();
    }}>
      <select className="text-xs mb-1" value={depthType} onChange={e => {
        setDepthType(e.target.value);
      }}>
        {depthTypes.map(depthType => (
          <option value={depthType} key={depthType}>{depthType}</option>
        ))}
      </select>
      <Button variant="outline" className="text-xs mb-1" onClick={e => {
        eventTarget.dispatchEvent(new MessageEvent('depth', {
          data: {
            type: depthType,
          },
        }));
      }}>
        Depth
      </Button>
      <Button variant="outline" className="text-xs mb-1" onClick={e => {
        const promptString = prompt('Detect what? (e.g. "path, tree")');
        eventTarget.dispatchEvent(new MessageEvent('detect', {
          data: {
            prompt: promptString,
          },
        }));
      }}>
        Detect
      </Button>
      <Button variant="outline" className="text-xs mb-1" onClick={e => {
        eventTarget.dispatchEvent(new MessageEvent('segment', {
          data: null,
        }));
      }}>
        Segment
      </Button>
    </form>
  )
};
const JourneyScene = ({
  eventTarget,
}: {
  eventTarget: EventTarget,
}) => {
  const [planeGeometry, setPlaneGeometry] = useState<BufferGeometry>(makePlaneGeometry);
  const texture = useLoader(TextureLoader, '/images/test-bg.webp');
  const [highlightTexture, setHighlightTexture] = useState<Texture | null>(null);
  const [segmentTexture, setSegmentTexture] = useState<Texture | null>(null);
  const raycaster = useMemo(() => new Raycaster(), []);
  const plane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), []);
  // const basePlaneMesh = useMemo(() => {
  //   const basePlaneGeometry = new PlaneGeometry(1, 1);
  //   const basePlaneMesh = new Mesh(basePlaneGeometry, new MeshBasicMaterial({color: 0x000000}));
  //   return basePlaneMesh;
  // }, []);
  const capsuleGeometry = useMemo(() =>
    new CapsuleGeometry(characterController.capsuleRadius, characterController.capsuleRadius, characterController.capsuleHalfHeight * 2)
      .rotateZ(-Math.PI / 2),
  []);
  // const planeBox = useMemo(() => new Box3(), []);
  const planeMeshRef = useRef<Mesh>(null);
  const capsuleMeshRef = useRef<Mesh>(null);
  const pointerMeshRef = useRef<Mesh>(null);
  const intersectionMeshRef = useRef<Mesh>(null);
  const storyCursorMeshRef = useRef<Mesh>(null);
  const [cameraTarget, setCameraTarget] = useState(new Vector3(0, 0, 0));
  const [depth, setDepth] = useState<DepthSpec | null>(null);
  const [dragBox, setDragBox] = useState<Box3 | null>(null);
  const [dragUvBox, setDragUvBox] = useState<Box2 | null>(null);
  const [dragGeometry, setDragGeometry] = useState<BufferGeometry | null>(null);
  const [pressed, setPressed] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(false);

  const scaleArray = useAspectContain(
    texture ? texture.source.data.width : 512, // Pixel-width
    texture ? texture.source.data.height : 512, // Pixel-height
    1                         // Optional scaling factor
  );
  const scale = new Vector3(...scaleArray);

  const keyboardMap = [
    { name: "backward", keys: ["ArrowUp", "KeyW"] },
    { name: "forward", keys: ["ArrowDown", "KeyS"] },
    { name: "rightward", keys: ["ArrowLeft", "KeyA"] },
    { name: "leftward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
    // Optional animation key map
    // { name: "action1", keys: ["1"] },
    // { name: "action2", keys: ["2"] },
    // { name: "action3", keys: ["3"] },
    // { name: "action4", keys: ["KeyF"] },
  ];

  useEffect(() => {
    if (depth) {
      const newPlaneGeometry = makePlaneGeometryFromDepth({
        depth,
        camera,
        scale,
      });
      setPlaneGeometry(newPlaneGeometry);
    } else {
      const newPlaneGeometry = makePlaneGeometryFromScale({
        scale,
      });
      setPlaneGeometry(newPlaneGeometry);
    }
  }, [scale.x, scale.y, scale.z, depth]);

  /* const getPlaneUvFromMouseEvent = (e: MouseEvent, target: Vector2) => {
    const planeTopLeftPointNdc = new Vector3(-0.5, 0.5, 0)
      .multiply(new Vector3(...scale))
      .project(camera);
    const planeTopLeftScreen = planeTopLeftPointNdc.clone();
    planeTopLeftScreen.x = (planeTopLeftScreen.x + 1) * 0.5;
    planeTopLeftScreen.y = (planeTopLeftScreen.y + 1) * 0.5;
    const planeBottomRightPointNdc = new Vector3(0.5, -0.5, 0)
      .multiply(new Vector3(...scale))
      .project(camera);
    const planeBottomRightScreen = planeBottomRightPointNdc.clone();
    planeBottomRightScreen.x = (planeBottomRightScreen.x + 1) * 0.5;
    planeBottomRightScreen.y = (planeBottomRightScreen.y + 1) * 0.5;
  
    const mousePosition = new Vector2(
      e.offsetX / canvas.width * 2,
      1 - e.offsetY / canvas.height * 2,
    );
  
    const w = planeBottomRightScreen.x - planeTopLeftScreen.x;
    const h = planeTopLeftScreen.y - planeBottomRightScreen.y;
  
    // compute u, v from the top left
    const u = (mousePosition.x - planeTopLeftScreen.x) / w;
    const v = (planeTopLeftScreen.y - mousePosition.y) / h;
  
    return target.set(u, v);
  }; */
  const segmentPoint = async (point: Vector2) => {
    const image = texture?.source.data as HTMLImageElement;
    const blob = await img2blob(image);
    const segmentationUint8Array = await segment(blob, {
      point_coords: [[point.x, point.y]],
      point_labels: [1],
      box: undefined,
    });
    return segmentationUint8Array;
  };
  const segmentBox = async (box: Box2) => {
    const image = texture?.source.data as HTMLImageElement;
    const blob = await img2blob(image);
    const segmentationUint8Array = await segment(blob, {
      point_coords: undefined,
      point_labels: undefined,
      box: [box.min.x, box.min.y, box.max.x, box.max.y],
    });
    return segmentationUint8Array;
  };
  // track pointer
  const { camera } = useThree();
  const cameraDirection = useMemo(() => new Vector3(0, 0, -1), []);
  useFrame((state) => {
    cameraDirection.set(0, 0, -1).applyQuaternion(camera.quaternion);
    cameraTarget.copy(camera.position).add(cameraDirection);

    const pointerMesh = pointerMeshRef.current;
    const storyCursorMesh = storyCursorMeshRef.current;
    const planeMesh = planeMeshRef.current;
    if (planeMesh && storyCursorMesh && pointerMesh) {
      const mousePosition = new Vector2(
        state.mouse.x,
        state.mouse.y,
      );

      // // plane
      // basePlaneMesh.scale.copy(scale);
      // basePlaneMesh.updateMatrixWorld();
      // planeBox.setFromObject(basePlaneMesh);
      // planeBox.min.z = -1;
      // planeBox.max.z = 1;

      // position
      raycaster.setFromCamera(mousePosition, camera);
      raycaster.ray.intersectPlane(plane, pointerMesh.position);
      const intersections = raycaster.intersectObject(planeMesh, false, []);
      const intersection =  intersections[0];
      if (intersection) {
        pointerMesh.position.copy(intersection.point);
        pointerMesh.visible = true;
      } else {
        pointerMesh.visible = false;
      }
      storyCursorMesh.position.copy(pointerMesh.position);
      storyCursorMesh.visible = pointerMesh.visible;
    }
  });

  /* // track capsule
  const pqs = useMemo(() => {
    const p = new Vector3();
    const q = new Quaternion();
    const s = new Vector3();
    return {
      p,
      q,
      s,
    };
  }, []);
  useFrame(() => {
    const capsuleMesh = capsuleMeshRef.current;
    if (capsuleMesh) {
      const {
        p,
        q,
        s,
      } = pqs;
      capsuleMesh.matrixWorld.decompose(p, q, s);
      // console.log('got capsule', p.toArray().join(','));
    }
  }); */

  // handle drag
  const { gl } = useThree();
  const canvas = gl.domElement;
  useEffect(() => {
    const pointerMesh = pointerMeshRef.current;
    const intersectionMesh = intersectionMeshRef.current;
    const planeMesh = planeMeshRef.current;

    if (pointerMesh && intersectionMesh && planeMesh) {
      const mousedown = (e: any) => {
        if (e.target === canvas) {
          if (pointerMesh.visible) {
            // intersect plane
            raycaster.ray.origin.copy(camera.position);
            raycaster.ray.direction.copy(pointerMesh.position).sub(camera.position).normalize();
            const intersections = raycaster.intersectObject(planeMesh, false, []);
            const intersection =  intersections[0];
            if (intersection) {
              intersectionMesh.position.copy(intersection.point);
              intersectionMesh.visible = true;
            } else {
              intersectionMesh.visible = false;
            }

            // set states
            if (intersection) {
              const dragBox = new Box3(pointerMesh.position.clone(), pointerMesh.position.clone());
              setDragBox(dragBox);

              // const dragUv = getPlaneUvFromMouseEvent(e, new Vector2());
              const dragUv = (intersection.uv as Vector2).clone();
              dragUv.y = 1 - dragUv.y;
              const dragUvBox = new Box2(dragUv.clone(), dragUv.clone())
              setDragUvBox(dragUvBox);

              setDragGeometry(makeBoxOutlineGeometry(dragBox));
            }

            // animate cursor
            setPressed(true);
          }
        }
      };
      document.addEventListener('mousedown', mousedown);
      const mouseup = (e: any) => {
        if (dragUvBox) {
          const image = texture?.source.data as HTMLImageElement;
          const {
            width,
            height,
          } = image;

          // intersect plane
          raycaster.ray.origin.copy(camera.position);
          raycaster.ray.direction.copy(pointerMesh.position).sub(camera.position).normalize();
          const intersections = raycaster.intersectObject(planeMesh, false, []);
          const intersection =  intersections[0];
          if (intersection) {
            const dragUv = (intersection.uv as Vector2).clone();
            dragUv.y = 1 - dragUv.y;
            dragUvBox.max.copy(dragUv);
          } 

          let x1 = 0;
          let y1 = 0;
          let x2 = 0;
          let y2 = 0;
          if (dragUvBox.min.x < dragUvBox.max.x) {
            x1 = dragUvBox.min.x;
            x2 = dragUvBox.max.x;
          } else {
            x1 = dragUvBox.max.x;
            x2 = dragUvBox.min.x;
          }
          if (dragUvBox.min.y < dragUvBox.max.y) {
            y1 = dragUvBox.min.y;
            y2 = dragUvBox.max.y;
          } else {
            y1 = dragUvBox.max.y;
            y2 = dragUvBox.min.y;
          }
          x1 = Math.floor(x1 * width);
          y1 = Math.floor(y1 * height);
          x2 = Math.floor(x2 * width);
          y2 = Math.floor(y2 * height);
          const w = x2 - x1;
          const h = y2 - y1;

          // const distance = dragUvBox.min.distanceTo(dragUvBox.max);
          if (w === 0 || h === 0 /*|| distance <= 0.01 */) {
            console.log('click', dragUvBox.max.x, dragUvBox.max.y);

            (async () => {
              const point = dragUvBox.max.clone();
              const textureSize = new Vector2(width, height);
              point.multiply(textureSize);
              floorVector2(point);
              const segmentationUint8Array = await segmentPoint(point);
              console.log('got segmentation', segmentationUint8Array, segmentationUint8Array.filter(n => n !== 0));
              const colorArray = colorizePixelsArrayMono(segmentationUint8Array, {
                color: new Color(0, 0, 1),
              });
              const st = new DataTexture(colorArray, width, height, RGBAFormat, UnsignedByteType);
              st.minFilter = NearestFilter;
              st.magFilter = NearestFilter;
              st.flipY = true;
              st.needsUpdate = true;
              setSegmentTexture(st);
            })();
          } else {
            console.log('select', dragUvBox.min.x, dragUvBox.min.y, dragUvBox.max.x, dragUvBox.max.y);

            (async () => {
              const box = dragUvBox.clone();
              const textureSize = new Vector2(width, height);
              box.min.multiply(textureSize);
              floorVector2(box.min);
              box.max.multiply(textureSize);
              floorVector2(box.max);
              const segmentationUint8Array = await segmentBox(box);
              console.log('got segmentation', segmentationUint8Array, segmentationUint8Array.filter(n => n !== 0));
              const colorArray = colorizePixelsArrayMono(segmentationUint8Array, {
                color: new Color(0, 0, 1),
              });
              const st = new DataTexture(colorArray, width, height, RGBAFormat, UnsignedByteType);
              st.minFilter = NearestFilter;
              st.magFilter = NearestFilter;
              st.flipY = true;
              st.needsUpdate = true;
              setSegmentTexture(st);
            })();

            const pixelsArray = makePixelsArray({
              width,
              height,
              x1,
              y1,
              x2,
              y2,
            });
            const colorArray = colorizePixelsArrayMono(pixelsArray, {
              color: new Color(0, 1, 0),
            });
            const ht = new DataTexture(colorArray, width, height, RGBAFormat, UnsignedByteType);
            ht.minFilter = NearestFilter;
            ht.magFilter = NearestFilter;
            ht.flipY = true;
            ht.needsUpdate = true;
            setHighlightTexture(ht);
          }
          setDragBox(null);
          setDragUvBox(null);
          setDragGeometry(null);
          setPressed(false);
        }
      };
      document.addEventListener('mouseup', mouseup);
      const mousemove = (e: any) => {
        if (dragBox && dragUvBox && pointerMesh.visible) {
          dragBox.max.copy(pointerMesh.position);
          // getPlaneUvFromMouseEvent(e, dragUvBox.max);
          setDragGeometry(makeBoxOutlineGeometry(dragBox));

          /* // intersect plane
          raycaster.ray.origin.copy(camera.position);
          raycaster.ray.direction.copy(pointerMesh.position).sub(camera.position).normalize();
          const intersections = raycaster.intersectObject(planeMesh, false, []);
          const intersection =  intersections[0];
          if (intersection) {
            const dragUv = (intersection.uv as Vector2).clone();
            dragUv.y = 1 - dragUv.y;
            dragUvBox.max.copy(dragUv);
          } */
        }
      };
      document.addEventListener('mousemove', mousemove);

      const keydown = (e: any) => {
        switch (e.key) {
          // escape
          case 'Escape': {
            setDragBox(null);
            setDragUvBox(null);
            setDragGeometry(null);
            setPressed(false);
            setHighlightTexture(null);
            setSegmentTexture(null);
            intersectionMesh.visible = false;
            break;
          }
          // space
          case ' ': {
            e.preventDefault();
            // e.stopPropagation();
            break;
          }
        }
      };
      document.addEventListener('keydown', keydown);

      return () => {
        document.removeEventListener('mousedown', mousedown);
        document.removeEventListener('mouseup', mouseup);
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('keydown', keydown);
      };
    }
  }, [
    pointerMeshRef.current,
    storyCursorMeshRef.current,
    planeMeshRef.current,
    scale.x,
    scale.y,
    scale.z,
    dragBox,
    dragUvBox,
  ]);

  // track events
  useEffect(() => {
    const ondepth = async (e: any) => {
      const {
        type,
      } = e.data;

      const image = texture?.source.data;
      const {
        width,
        height,
      } = image;
      const blob = await img2blob(image);
      const depthFloat32Array = await getDepth(blob, {
        type,
      });
      console.log('got depth', depthFloat32Array);
      const depth = {
        width,
        height,
        data: depthFloat32Array,
      };
      setDepth(depth);
      const newPlaneGeometry = makePlaneGeometryFromDepth({
        depth,
        camera,
        scale,
      });
      setPlaneGeometry(newPlaneGeometry);

      setControlsEnabled(true);
    };
    eventTarget.addEventListener('depth', ondepth);

    const ondetect = async (e: any) => {
      const {
        prompt,
      } = e.data;
      const queries = prompt.split(',').map((s: string) => s.trim()).filter(Boolean);

      const image = texture?.source.data;
      const {
        width,
        height,
      } = image;
      const blob = await img2blob(image);
      const result = await detect(blob, {
        queries,
      });
      console.log('got detect', JSON.stringify(result, null, 2));

      const boxes = result.map(([
        x1,
        y1,
        x2,
        y2,
      ]: [
        number,
        number,
        number,
        number,
      ]) => {
        return new Box2(new Vector2(x1, y1), new Vector2(x2, y2));
      });
      const boxAreas = new Map<Box2, number>();
      for (const box of boxes) {
        const size = box.getSize(new Vector2());
        boxAreas.set(box, size.x * size.y);
      }
      const largestBox = boxes.sort((a: Box2, b: Box2) => {
        const aArea = boxAreas.get(a) as number;
        const bArea = boxAreas.get(b) as number;
        return bArea - aArea;
      })[0];
      console.log('got largest box', largestBox);

      if (largestBox) {
        floorVector2(largestBox.min);
        floorVector2(largestBox.max);
        const segmentationUint8Array = await segmentBox(largestBox);
        console.log('got segmentation', segmentationUint8Array, segmentationUint8Array.filter(n => n !== 0));
        const colorArray = colorizePixelsArrayMono(segmentationUint8Array, {
          color: new Color(0, 0, 1),
        });
        const st = new DataTexture(colorArray, width, height, RGBAFormat, UnsignedByteType);
        st.minFilter = NearestFilter;
        st.magFilter = NearestFilter;
        st.flipY = true;
        st.needsUpdate = true;
        setSegmentTexture(st);
      } else {
        setSegmentTexture(null);
      }
    };
    eventTarget.addEventListener('detect', ondetect);

    const onsegment = async (e: any) => {
      const image = texture?.source.data;
      const {
        width,
        height,
      } = image;
      const blob = await img2blob(image);
      const segmentationUint8Array = await segmentAll(blob);
      const countUniqueValues = (arr: Uint8Array) => {
        const set = new Set();
        for (let i = 0; i < arr.length; i++) {
          set.add(arr[i]);
        }
        return set.size;
      };
      console.log('got segmentation', segmentationUint8Array, segmentationUint8Array.filter(n => n !== 0), countUniqueValues(segmentationUint8Array));
      const colorArray = colorizePixelsArrayMulti(segmentationUint8Array);
      const st = new DataTexture(colorArray, width, height, RGBAFormat, UnsignedByteType);
      st.minFilter = NearestFilter;
      st.magFilter = NearestFilter;
      st.flipY = true;
      st.needsUpdate = true;
      setSegmentTexture(st);
    };
    eventTarget.addEventListener('segment', onsegment);

    return () => {
      eventTarget.removeEventListener('depth', ondepth);
      eventTarget.removeEventListener('detect', ondetect);
      eventTarget.removeEventListener('segment', onsegment);
    };
  }, [texture]);

  // render
  return <>
    {controlsEnabled && <OrbitControls makeDefault />}
    {/* drag mesh */}
    {dragGeometry && <mesh
      geometry={dragGeometry}
    >
      {/* <boxGeometry args={[0.2, 0.2, 0.2]} /> */}
      <meshBasicMaterial color="black" />
    </mesh>}

    {/* character capsule */}
    {controlsEnabled && (
      <KeyboardControls map={keyboardMap}>
        <Ecctrl
          position={[0, 0, -6]}
          capsuleHalfHeight={characterController.capsuleHalfHeight}
          capsuleRadius={characterController.capsuleRadius}
          floatHeight={characterController.floatHeight}
          disableFollowCam={true}
          // disableFollowCamPos={new Vector3(0, 0, 1)}
          // disableFollowCamTarget={new Vector3(0, 0, 0)}
          disableFollowCamPos={camera.position}
          disableFollowCamTarget={cameraTarget}
          autoBalance={false}
          turnSpeed={100}
        >
          <mesh
            geometry={capsuleGeometry}
            ref={capsuleMeshRef}
          >
            <meshBasicMaterial color="blue" transparent opacity={0.5} />
          </mesh>
        </Ecctrl>
      </KeyboardControls>
    )}
    {/* mouse mesh */}
    <mesh
      // onPointerEnter={e => {
      //   const pointerMesh = pointerMeshRef.current;
      //   if (pointerMesh) {
      //     pointerMesh.visible = true;
      //   }
      // }}
      // onPointerLeave={e => {
      //   const pointerMesh = pointerMeshRef.current;
      //   if (pointerMesh) {
      //     pointerMesh.visible = false;
      //   }
      // }}
      // onPointerMove={e => {
      //   const pointerMesh = pointerMeshRef.current;
      //   console.log('pointer move', e, pointerMesh);
      //   if (pointerMesh) {
      //     pointerMesh.position.copy(e.point);
      //     pointerMesh.updateMatrixWorld();
      //   }
      // }}
      ref={pointerMeshRef}
    >
      <boxGeometry args={[0.02, 0.02, 0.02]} />
      <meshBasicMaterial color="red" />
    </mesh>
    {/* intersection mesh */}
    <mesh
      visible={false}
      ref={intersectionMeshRef}
    >
      <boxGeometry args={[0.02, 0.02, 0.02]} />
      <meshBasicMaterial color="blue" />
    </mesh>
    {/* cursor mesh */}
    <StoryCursor pressed={pressed} ref={storyCursorMeshRef} />
    {/* plane mesh */}
    {(() => {
      const children = (
        <mesh geometry={planeGeometry} ref={planeMeshRef}>
          <meshBasicMaterial map={texture} />
        </mesh>
      );
      return controlsEnabled ? (
        <RigidBody
          colliders='trimesh'
          lockTranslations
          lockRotations
        >
          {children}
        </RigidBody>
      ) : (children);
    })()}
    {/* highlight mesh */}
    {highlightTexture && <mesh geometry={planeGeometry}>
      <meshBasicMaterial map={highlightTexture} transparent polygonOffset polygonOffsetFactor={0} polygonOffsetUnits={-2} />
    </mesh>}
    {/* segment mesh */}
    {segmentTexture && <mesh geometry={planeGeometry}>
      <meshBasicMaterial map={segmentTexture} transparent polygonOffset polygonOffsetFactor={0} polygonOffsetUnits={-4} />
    </mesh>}
  </>
}

export function Journey() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eventTarget = useMemo(() => new EventTarget(), []);

  return (
    <div className="relative w-screen h-[calc(100vh-64px)]">
      <Canvas
        camera={{
          position: [0, 0, 1],
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = NoToneMapping;
          // camera.aspect = canvasRef.current.width / canvasRef.current.height;
          // camera.updateProjectionMatrix();
        }}
        ref={canvasRef}
      >
        <Suspense>
          <Physics
            // debug
          >
            <JourneyScene eventTarget={eventTarget} />
          </Physics>
        </Suspense>
      </Canvas>
      <JourneyForm eventTarget={eventTarget} />
    </div>
  )
}
