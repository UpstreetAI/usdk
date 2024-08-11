'use client';

import React, { Suspense, useEffect, useRef, useState, useMemo, forwardRef, use } from 'react'
import { z } from 'zod';
import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber'
import { Physics, RigidBody } from "@react-three/rapier";
import { OrbitControls, KeyboardControls, Text, GradientTexture } from '@react-three/drei'
import Ecctrl from 'ecctrl';
import dedent from 'dedent';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  Vector2,
  Vector3,
  Quaternion,
  Object3D,
  Camera,
  PerspectiveCamera,
  Raycaster,
  Plane,
  Box2,
  Box3,
  Mesh,
  TextureLoader,
  NoToneMapping,
  Texture,
  BufferGeometry,
  BoxGeometry,
  DataTexture,
  RGBAFormat,
  UnsignedByteType,
  NearestFilter,
  PlaneGeometry,
  BufferAttribute,
  ShaderMaterial,
  Color,
  DoubleSide,
} from 'three';
import { Button } from '@/components/ui/button';
import { CapsuleGeometry } from '@/utils/three/CapsuleGeometry.mjs';
import {
  describe,
  describeJson,
  getDepth,
  detect,
  segment,
  segmentAll,
  removeBackground,
} from '@/utils/vision';
import { getJWT } from '@/lib/jwt';
import { fetchImageGeneration } from '@/utils/generate-image.mjs';

const geometryResolution = 256;
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
const spawnOffset: [number, number, number] = [0, 0, -6];
const objectSpawnOffset: [number, number, number] = [0, -2, -8];

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

const makeBoxOutlineGeometry = (box: Box3, camera: Camera) => {
  // project the box onto the camera near plane
  const nearBox = box.clone();
  nearBox.min.project(camera);
  nearBox.max.project(camera);
  nearBox.min.z = -1;
  nearBox.max.z = -1;
  // ensure the x and y are really min max
  if (nearBox.min.x > nearBox.max.x) {
    const t = nearBox.min.x;
    nearBox.min.x = nearBox.max.x;
    nearBox.max.x = t;
  }
  if (nearBox.min.y > nearBox.max.y) {
    const t = nearBox.min.y;
    nearBox.min.y = nearBox.max.y;
    nearBox.max.y = t;
  }
  nearBox.min.unproject(camera);
  nearBox.max.unproject(camera);

  const topLeftPoint = nearBox.min;
  const bottomRightPoint = nearBox.max;

  const bottomPlane = new Plane().setFromNormalAndCoplanarPoint(
    new Vector3(0, 1, 0)
      .applyQuaternion(camera.quaternion),
      bottomRightPoint
  );
  const rightPlane = new Plane().setFromNormalAndCoplanarPoint(
    new Vector3(-1, 0, 0)
      .applyQuaternion(camera.quaternion),
      bottomRightPoint
  );

  const bottomLeftPoint = bottomPlane.projectPoint(nearBox.min, new Vector3());
  const topRightPoint = rightPlane.projectPoint(nearBox.min, new Vector3());

  const m = topLeftPoint.clone().add(bottomRightPoint).multiplyScalar(0.5);
  m.add(
    new Vector3(0, 0, -0.00001)
      .applyQuaternion(camera.quaternion)
  );
  const w = topLeftPoint.distanceTo(topRightPoint);
  const h = topLeftPoint.distanceTo(bottomLeftPoint);

  return new PlaneGeometry(w, h, 1)
    .applyQuaternion(camera.quaternion)
    .translate(m.x, m.y, m.z);
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
const getSegmentationBoundingBox = (segmentationMap: Uint8Array, width: number, height: number) => {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const value = segmentationMap[index];

      if (value > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return new Box2(
    new Vector2(minX, minY),
    new Vector2(maxX, maxY),
  );
};
const clipImage = (image: HTMLImageElement, segmentationMap: Uint8Array, {
  padding = 0.1,
} = {}) => {
  const width = image.width;
  const height = image.height;

  // Get the segmentation bounding box
  const boundingBox = getSegmentationBoundingBox(segmentationMap, width, height);

  // Calculate the width and height of the bounding box
  const boxWidth = boundingBox.max.x - boundingBox.min.x;
  const boxHeight = boundingBox.max.y - boundingBox.min.y;

  // Expand the bounding box by padding
  const expandedBoundingBox = new Box2(
    new Vector2(
      boundingBox.min.x - boxWidth * padding,
      boundingBox.min.y - boxHeight * padding
    ),
    new Vector2(
      boundingBox.max.x + boxWidth * padding,
      boundingBox.max.y + boxHeight * padding
    )
  );

  // Ensure the bounds are within the image
  const safeBoundingBox = new Box2(
    new Vector2(clamp(expandedBoundingBox.min.x, 0, width), clamp(expandedBoundingBox.min.y, 0, height)),
    new Vector2(clamp(expandedBoundingBox.max.x, 0, width), clamp(expandedBoundingBox.max.y, 0, height))
  );

  // Calculate the width and height of the clipped image
  const clippedWidth = safeBoundingBox.max.x - safeBoundingBox.min.x;
  const clippedHeight = safeBoundingBox.max.y - safeBoundingBox.min.y;

  // Create a canvas to hold the clipped image
  const canvas = document.createElement('canvas');
  canvas.width = clippedWidth;
  canvas.height = clippedHeight;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  // Draw the clipped image onto the canvas
  ctx.drawImage(
    image,
    safeBoundingBox.min.x,
    safeBoundingBox.min.y,
    clippedWidth,
    clippedHeight,
    0,
    0,
    clippedWidth,
    clippedHeight
  );

  return {
    boundingBox,
    safeBoundingBox,
    image: canvas,
  };
};
const describeImageSegment = async (image: HTMLImageElement, segmentationUint8Array: Uint8Array) => {
  const {
    boundingBox,
    safeBoundingBox,
    image: clippedImage,
  } = clipImage(image, segmentationUint8Array);

  // XXX debugging
  clippedImage.style.cssText = `\
    position: fixed;
    bottom: 0;
    left: 0;
    width: 300px;
    opacity: 0.5;
    z-index: 100;
    pointer-events: none;
  `;
  document.body.appendChild(clippedImage);

  const blob = await new Promise<Blob>((accept, reject) => {
    clippedImage.toBlob(blob => {
      if (blob) {
        accept(blob);
      } else {
        reject(new Error('failed to convert canvas to blob'));
      }
    }, 'image/webp', 0.8);
  });
  const jwt = await getJWT();
  const description = await describe(blob, undefined, {
    jwt,
  });
  return {
    boundingBox,
    safeBoundingBox,
    clippedImage,
    description,
  };
};
const blob2img = (blob: Blob) => new Promise<HTMLImageElement>((accept, reject) => {
  const img = new Image();
  img.onload = () => {
    accept(img);
    cleanup();
  };
  img.onerror = err => {
    reject(err);
    cleanup();
  };
  const src = URL.createObjectURL(blob);
  img.src = src;
  const cleanup = () => {
    URL.revokeObjectURL(src);
  };
});
const characterImageDefaultPrompt = `girl wearing casual adventure clothes`;
const generateCharacter = async (prompt = characterImageDefaultPrompt, {
  stylePrompt = `full body, front view, standing straight, arms at side, neutral expression, white background, high resolution, digimon anime style`,
} = {}) => {
  const jwt = await getJWT();
  const blob = await fetchImageGeneration(`${prompt}${stylePrompt ? `\n${stylePrompt}` : ''}`, {
    image_size: 'portrait_4_3',
  }, {
    jwt,
  });

  const img = await blob2img(blob);
  img.style.cssText = `\
    position: absolute;
    right: 0;
    bottom: 0;
    width: 250px;
    z-index: 100;
  `;
  document.body.appendChild(img);

  const blob2 = await removeBackground(blob, {
    jwt,
  });
  const image = await createImageBitmap(blob2, {
    imageOrientation: 'flipY',
  });
  return {
    blob: blob2,
    image,
  };
};
const generateObjectDefaultPrompt = `ancient health vial`;
const generateObject = async (prompt = generateObjectDefaultPrompt, {
  stylePrompt = `object, concept art, front view, white background, outlined, anime style`,
} = {}) => {
  const jwt = await getJWT();
  const blob = await fetchImageGeneration(`${prompt}${stylePrompt ? `\n${stylePrompt}` : ''}`, {
    image_size: 'square',
  }, {
    jwt,
  });

  const img = await blob2img(blob);
  img.style.cssText = `\
    position: absolute;
    right: 0;
    bottom: 0;
    width: 250px;
    z-index: 100;
  `;
  document.body.appendChild(img);

  const [
    metadata,
    [blob2, image]
  ] = await Promise.all([
    describeJson(blob, dedent`\
      width, height are in meters and can contain decimals.
      weight is in kilograms and can contain decimals.
    `, z.object({
      object_visual_description: z.string(),
      height: z.number(),
      width: z.number(),
      weight: z.number(),
    }), {
      jwt,
    }),
    (async () => {
      const blob2 = await removeBackground(blob, {
        jwt,
      });
      const image = await createImageBitmap(blob2, {
        imageOrientation: 'flipY',
      });
      return [blob2, image];
    })(),
  ]);

  return {
    blob: blob2,
    image,
    metadata,
  };
};

//

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
const getPlanePositioner = ({
  camera,
  scale,
}: {
  camera: Camera,
  scale: Vector3,
}) => {
  // copy camera to avoid modifying the original
  const baseCamera = camera.clone();
  baseCamera.position.set(0, 0, 1);
  baseCamera.quaternion.set(0, 0, 0, 1);
  baseCamera.scale.setScalar(1);
  baseCamera.updateMatrixWorld();
  
  // temporary variables
  const pWorld = new Vector3();
  const pNdc = new Vector3();
  const pNear = new Vector3();
  const pMid = new Vector3();
  const pDirection = new Vector3();
  const pTemp = new Vector3();

  return (p: Vector3, d: number, target: Vector3) => {
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
    return target.copy(pWorld).add(pDelta);
  };
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

  const planePositioner = getPlanePositioner({
    camera,
    scale,
  });

  const planeGeometry = new PlaneGeometry(1, 1, geometryResolution, geometryResolution);
  const positions = planeGeometry.attributes.position.array;
  const p = new Vector3();
  for (let i = 0; i < positions.length; i += 3) {
    // load the point
    p.fromArray(positions, i);

    // sample point depth
    const x = (p.x + 0.5) * width;
    const y = (1 - (p.y + 0.5)) * height;
    const d = bilinearSample(data, x, y, width, height);

    planePositioner(p, d, p);

    // save the point
    p.toArray(positions, i);
  }
  return planeGeometry;
};

const img2blob = async (img: HTMLImageElement | HTMLCanvasElement, type = 'image/webp', quality = 0.8) => {
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

type AnchorXType = number | "center" | "left" | "right" | undefined;
type AnchorYType = number | "top" | "bottom" | "top-baseline" | "middle" | "bottom-baseline" | undefined;
type Text3DProps = {
  children?: string,
  font?: string,
  fontSize?: number,
  lineHeight?: number,
  color?: number,
  bgColor?: number,
  anchorX?: AnchorXType,
  anchorY?: AnchorYType,
};
const Text3D = forwardRef(({
  children = '',
  // font = 'fonts/WinchesterCaps.ttf',
  font = 'fonts/Plaza Regular.ttf',
  fontSize = 0.04,
  lineHeight = 1.2,
  color = 0xFFFFFF,
  bgColor = 0x000000,
  anchorX = "left",
  anchorY = "top",
  ...rest
}: Text3DProps, ref: any) => {
  const numLines = 8;
  const boxWidth = 1;
  const boxHeight = fontSize * lineHeight * numLines;
  const padding = 0.02;
  return (
    <Suspense>
      <object3D {...rest} ref={ref}>
        <mesh position={[-padding, padding, 0]}>
          <planeGeometry args={[boxWidth + padding * 2, boxHeight + padding * 2]} />
          <meshBasicMaterial>
          <GradientTexture
            stops={[0, 1]} // As many stops as you want
            colors={[0x111111, 0x222222]} // Colors need to match the number of stops
            size={1024} // Size is optional, default = 1024
          />
        </meshBasicMaterial>
        </mesh>
        <Text
          position={[-boxWidth / 2 - padding, boxHeight / 2 + padding, 0.001]}
          font={font}
          fontSize={fontSize}
          lineHeight={lineHeight}
          color={color}
          maxWidth={boxWidth}
          anchorX={anchorX}
          anchorY={anchorY}
        >
          {children}
        </Text>
        <Text
          position={[-boxWidth / 2 - padding - 0.005, boxHeight / 2 + padding + 0.005, 0.001 - 0.005]}
          font={font}
          fontSize={fontSize}
          lineHeight={lineHeight}
          color={bgColor}
          maxWidth={boxWidth}
          anchorX={anchorX}
          anchorY={anchorY}
        >
          {children}
        </Text>
      </object3D>
    </Suspense>
  );
});

type DescriptionSpec = {
  boundingBox: Box2,
  safeBoundingBox: Box2,
  clippedImage: HTMLCanvasElement,
  description: string,
};
type ObjectMetadata = {
  description: string,
  height: number,
  width: number,
  weight: number,
};
type ObjectSpec = {
  texture: Texture,
  metadata: ObjectMetadata,
};

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
        if (promptString) {
          eventTarget.dispatchEvent(new MessageEvent('detect', {
            data: {
              prompt: promptString,
            },
          }));
        }
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
      <Button variant="outline" className="text-xs mb-1" onClick={e => {
        const promptString = prompt(`Generate what character? (e.g. "${characterImageDefaultPrompt}")`);
        if (promptString) {
          eventTarget.dispatchEvent(new MessageEvent('generateCharacter', {
            data: {
              prompt: promptString,
            },
          }));
        }
      }}>
        Generate Character
      </Button>
      <Button variant="outline" className="text-xs mb-1" onClick={e => {
        const promptString = prompt(`Generate what object? (e.g. "${generateObjectDefaultPrompt}")`);
        if (promptString) {
          eventTarget.dispatchEvent(new MessageEvent('generateObject', {
            data: {
              prompt: promptString,
            },
          }));
        }
      }}>
        Generate Object
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
  const capsuleGeometry = useMemo(() =>
    new CapsuleGeometry(characterController.capsuleRadius, characterController.capsuleRadius, characterController.capsuleHalfHeight * 2)
      .rotateZ(-Math.PI / 2),
  []);
  const planeMeshRef = useRef<Mesh>(null);
  const capsuleMeshRef = useRef<Mesh>(null);
  const pointerMeshRef = useRef<Mesh>(null);
  const intersectionMeshRef = useRef<Mesh>(null);
  const storyCursorMeshRef = useRef<Mesh>(null);
  const [cameraTarget, setCameraTarget] = useState(new Vector3(0, 0, 0));
  const [depth, setDepth] = useState<DepthSpec | null>(null);
  const [characterTexture, setCharacterTexture] = useState<Texture | null>(null);
  const [objectSpec, setObjectSpec] = useState<ObjectSpec | null>(null);
  const [description, setDescription] = useState<DescriptionSpec | null>(null);
  const descriptionObject3DRef = useRef<Object3D | null>(null);
  const dragBoxRef = useRef<Box3 | null>(null);
  const setDragBox = (v: Box3 | null) => {
    dragBoxRef.current = v;
  };
  const dragUvBoxRef = useRef<Box2 | null>(null);
  const setDragUvBox = (v: Box2 | null) => {
    dragUvBoxRef.current = v;
  };
  const [dragGeometry, setDragGeometry] = useState<BufferGeometry | null>(null);
  const [pressed, _setPressed] = useState(false);
  const pressedRef = useRef(false);
  const setPressed = (v: boolean) => {
    _setPressed(v);
    pressedRef.current = v;
  };
  const [keyboardControlsEnabled, setKeyboardControlsEnabled] = useState(false);
  const [mouseControlsEnabled, _setMouseControlsEnabled] = useState(false);
  const mouseControlsEnabledRef = useRef(false);
  const setMouseControlsEnabled = (v: boolean) => {
    _setMouseControlsEnabled(v);
    mouseControlsEnabledRef.current = v;
  };

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
    const jwt = await getJWT();
    const segmentationUint8Array = await segment(blob, {
      point_coords: [[point.x, point.y]],
      point_labels: [1],
      box: undefined,
    }, {
      jwt,
    });
    return segmentationUint8Array;
  };
  const segmentBox = async (box: Box2) => {
    const image = texture?.source.data as HTMLImageElement;
    const blob = await img2blob(image);
    const jwt = await getJWT();
    const segmentationUint8Array = await segment(blob, {
      point_coords: undefined,
      point_labels: undefined,
      box: [box.min.x, box.min.y, box.max.x, box.max.y],
    }, {
      jwt,
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

  // track description object
  useFrame((state) => {
    const descriptionObject3D = descriptionObject3DRef.current;
    if (description && descriptionObject3D) {
      const boundingBoxCenter = description.safeBoundingBox.min.clone()
        .add(description.safeBoundingBox.max)
        .multiplyScalar(0.5);
      // get the depth at the bounding box center
      let d: number;
      if (depth) {
        const {
          width,
          height,
          data,
        } = depth;
        d = bilinearSample(data, boundingBoxCenter.x, boundingBoxCenter.y, width, height);
      } else {
        d = 0;
      }

      // get the plane position
      const image = texture?.source.data as HTMLImageElement;
      const {
        width,
        height,
      } = image;
      const p = new Vector3(
        boundingBoxCenter.x / width - 0.5,
        0.5 - boundingBoxCenter.y / height,
        0,
      );
      const planePositioner = getPlanePositioner({
        camera,
        scale,
      });
      const boundingBoxCenterWorld = planePositioner(p, d, new Vector3());
      
      // project the point to camera near
      const cameraNearPoint = boundingBoxCenterWorld.clone().project(camera);
      cameraNearPoint.z = -1;
      cameraNearPoint.unproject(camera);
      // get the direction vector
      const cameraToBoundingBoxCenterDirection = boundingBoxCenterWorld.clone().sub(cameraNearPoint).normalize();
      // get the float position
      const floatOffset = 0.9;
      const floatPosition = cameraNearPoint.clone().add(cameraToBoundingBoxCenterDirection.clone().multiplyScalar(floatOffset));

      // set the description object position
      descriptionObject3D.position.copy(floatPosition);
      descriptionObject3D.quaternion.copy(camera.quaternion);
      // console.log('got p', p.toArray().join(','), boundingBoxCenterWorld.toArray().join(','));
      descriptionObject3D.updateMatrixWorld();
      // XXX should push this out to be in front of the camera
    }
  });

  // handle drag
  const { gl } = useThree();
  const canvas = gl.domElement;
  useEffect(() => {
    const pointerMesh = pointerMeshRef.current;
    const intersectionMesh = intersectionMeshRef.current;
    const planeMesh = planeMeshRef.current;

    if (pointerMesh && intersectionMesh && planeMesh) {
      const mousedown = (e: any) => {
        // const dragBox = dragBoxRef.current;
        // const dragUvBox = dragUvBoxRef.current;
        const pressed = pressedRef.current;

        if (e.target === canvas && !mouseControlsEnabledRef.current && pointerMesh.visible && !pressed) {
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
            const newDragBox = new Box3(pointerMesh.position.clone(), pointerMesh.position.clone());
            setDragBox(newDragBox);

            const dragUv = (intersection.uv as Vector2).clone();
            dragUv.y = 1 - dragUv.y;
            const dragUvBox = new Box2(dragUv.clone(), dragUv.clone())
            setDragUvBox(dragUvBox);

            setDragGeometry(makeBoxOutlineGeometry(newDragBox, camera));
          }

          // animate cursor
          setPressed(true);
        }
      };
      document.addEventListener('mousedown', mousedown);
      const mouseup = (e: any) => {
        // const dragBox = dragBoxRef.current;
        const dragUvBox = dragUvBoxRef.current;
        const pressed = pressedRef.current;

        if (dragUvBox && pressed) {
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
              // get the segmentation map
              const point = dragUvBox.max.clone();
              const textureSize = new Vector2(width, height);
              point.multiply(textureSize);
              floorVector2(point);
              const segmentationUint8Array = await segmentPoint(point);
              console.log('got segmentation', segmentationUint8Array, segmentationUint8Array.filter(n => n !== 0));
              const colorArray = colorizePixelsArrayMono(segmentationUint8Array, {
                color: new Color(0, 0, 1),
              });

              // visualize the segmentation map
              const st = new DataTexture(colorArray, width, height, RGBAFormat, UnsignedByteType);
              st.minFilter = NearestFilter;
              st.magFilter = NearestFilter;
              st.flipY = true;
              st.needsUpdate = true;
              setSegmentTexture(st);

              // describe the image
              const description = await describeImageSegment(texture?.source.data, segmentationUint8Array);
              setDescription(description);
              console.log('got description', description.description);
            })();
          } else {
            console.log('select', dragUvBox.min.x, dragUvBox.min.y, dragUvBox.max.x, dragUvBox.max.y);

            (async () => {
              // get the segmentation map
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

              // visualize the segmentation map
              const st = new DataTexture(colorArray, width, height, RGBAFormat, UnsignedByteType);
              st.minFilter = NearestFilter;
              st.magFilter = NearestFilter;
              st.flipY = true;
              st.needsUpdate = true;
              setSegmentTexture(st);

              // describe the image
              const description = await describeImageSegment(texture?.source.data, segmentationUint8Array);
              setDescription(description);
              console.log('got description', description.description);
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
        const dragBox = dragBoxRef.current;
        // const dragUvBox = dragUvBoxRef.current;
        const pressed = pressedRef.current;

        if (dragBox && pointerMesh.visible && pressed) {
          dragBox.max.copy(pointerMesh.position);
          setDragBox(dragBox);
          // getPlaneUvFromMouseEvent(e, dragUvBox.max);
          setDragGeometry(makeBoxOutlineGeometry(dragBox, camera));
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
            setDescription(null);
            intersectionMesh.visible = false;
            break;
          }
          // space
          case ' ': {
            e.preventDefault();
            break;
          }
          // C
          case 'c': {
            if (!mouseControlsEnabledRef.current) {
              setMouseControlsEnabled(true);
            }
            break;
          }
        }
      };
      document.addEventListener('keydown', keydown);
      const keyup = (e: any) => {
        switch (e.key) {
          // C
          case 'c': {
            if (mouseControlsEnabledRef.current) {
              setMouseControlsEnabled(false);
            }
            break;
          }
        }
      };
      document.addEventListener('keyup', keyup);

      return () => {
        document.removeEventListener('mousedown', mousedown);
        document.removeEventListener('mouseup', mouseup);
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('keydown', keydown);
        document.removeEventListener('keyup', keyup);
      };
    }
  }, [
    pointerMeshRef.current,
    storyCursorMeshRef.current,
    planeMeshRef.current,
    // scale.x,
    // scale.y,
    // scale.z,
    // dragBox,
    // dragUvBox,
    // dragGeometry,
    // segmentTexture,
    // highlightTexture,
    // mouseControlsEnabled,
  ]);

  // track events
  useEffect(() => {
    const ondepth = async (e: any) => {
      if (!keyboardControlsEnabled) {
        const {
          type,
        } = e.data;

        const image = texture?.source.data;
        const {
          width,
          height,
        } = image;
        const blob = await img2blob(image);
        const jwt = await getJWT();
        const depthFloat32Array = await getDepth(blob, {
          type,
        }, {
          jwt,
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

        setKeyboardControlsEnabled(true);
      }
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
      const jwt = await getJWT();
      const result = await detect(blob, {
        queries,
      }, {
        jwt,
      });
      console.log('got detect', JSON.stringify(result, null, 2));

      // get the largest box
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
        // get the segmentation map
        floorVector2(largestBox.min);
        floorVector2(largestBox.max);
        const segmentationUint8Array = await segmentBox(largestBox);
        console.log('got segmentation', segmentationUint8Array, segmentationUint8Array.filter(n => n !== 0));
        const colorArray = colorizePixelsArrayMono(segmentationUint8Array, {
          color: new Color(0, 0, 1),
        });

        // visualize the segmentation map
        const st = new DataTexture(colorArray, width, height, RGBAFormat, UnsignedByteType);
        st.minFilter = NearestFilter;
        st.magFilter = NearestFilter;
        st.flipY = true;
        st.needsUpdate = true;
        setSegmentTexture(st);

        // describe the image
        const description = await describeImageSegment(texture?.source.data, segmentationUint8Array);
        setDescription(description);
        console.log('got description', description.description);
      } else {
        setSegmentTexture(null);
      }
    };
    eventTarget.addEventListener('detect', ondetect);

    const onsegment = async (e: any) => {
      // get the multi segmentation map
      const image = texture?.source.data;
      const {
        width,
        height,
      } = image;
      const blob = await img2blob(image);
      const jwt = await getJWT();
      const segmentationUint8Array = await segmentAll(blob, {
        jwt,
      });
      const countUniqueValues = (arr: Uint8Array) => {
        const set = new Set();
        for (let i = 0; i < arr.length; i++) {
          set.add(arr[i]);
        }
        return set.size;
      };
      console.log('got segmentation', segmentationUint8Array, segmentationUint8Array.filter(n => n !== 0), countUniqueValues(segmentationUint8Array));
      
      // visualize the multi segmentation map
      const colorArray = colorizePixelsArrayMulti(segmentationUint8Array);
      const st = new DataTexture(colorArray, width, height, RGBAFormat, UnsignedByteType);
      st.minFilter = NearestFilter;
      st.magFilter = NearestFilter;
      st.flipY = true;
      st.needsUpdate = true;
      setSegmentTexture(st);
    };
    eventTarget.addEventListener('segment', onsegment);
    const onGenerateCharacter = async (e: any) => {
      const {
        prompt,
      } = e.data;
      const {
        blob,
        image,
      } = await generateCharacter(prompt);

      const characterTexture = new Texture(image);
      characterTexture.needsUpdate = true;
      setCharacterTexture(characterTexture);
    };
    eventTarget.addEventListener('generateCharacter', onGenerateCharacter);
    const onGenerateObject = async (e: any) => {
      const {
        prompt,
      } = e.data;
      const objectSpec = await generateObject(prompt);
      const {
        blob,
        image,
        metadata,
      } = objectSpec;
      console.log('object spec', {
        metadata,
      });

      const objectTexture = new Texture(image);
      objectTexture.needsUpdate = true;
      setObjectSpec({
        texture: objectTexture,
        metadata,
      });
    };
    eventTarget.addEventListener('generateObject', onGenerateObject);

    return () => {
      eventTarget.removeEventListener('depth', ondepth);
      eventTarget.removeEventListener('detect', ondetect);
      eventTarget.removeEventListener('segment', onsegment);
      eventTarget.removeEventListener('generateCharacter', onGenerateCharacter);
      eventTarget.removeEventListener('generateObject', onGenerateObject);

    };
  }, [texture, keyboardControlsEnabled]);

  // render
  return <>
    {mouseControlsEnabled && <OrbitControls makeDefault />}
    {/* drag mesh */}
    {dragGeometry && <mesh
      geometry={dragGeometry}
    >
      <meshBasicMaterial color="black" transparent opacity={0.5} />
    </mesh>}

    {/* character capsule */}
    {keyboardControlsEnabled && (
      <KeyboardControls map={keyboardMap}>
        <Ecctrl
          position={spawnOffset}
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
          {!characterTexture && <mesh
            geometry={capsuleGeometry}
            ref={capsuleMeshRef}
          >
            <meshBasicMaterial color="blue" transparent opacity={0.5} />
          </mesh>}
          {characterTexture && <mesh
            scale={[characterTexture.source.data.width / characterTexture.source.data.height, 1, 1]}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={characterTexture} side={DoubleSide} transparent />
          </mesh>}
        </Ecctrl>
      </KeyboardControls>
    )}
    {objectSpec && <mesh
      position={[objectSpawnOffset[0], objectSpawnOffset[1] + objectSpec.metadata.height * 0.5, objectSpawnOffset[2]]}
    >
      <planeGeometry args={[
        objectSpec.metadata.height * objectSpec.texture.source.data.width / objectSpec.texture.source.data.height,
        objectSpec.metadata.height,
      ]} />
      <meshBasicMaterial map={objectSpec.texture} side={DoubleSide} transparent />
    </mesh>}
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
      return keyboardControlsEnabled ? (
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
      <meshBasicMaterial map={highlightTexture} transparent polygonOffset polygonOffsetFactor={0} polygonOffsetUnits={-1} alphaTest={0.01} />
    </mesh>}
    {/* segment mesh */}
    {segmentTexture && <mesh geometry={planeGeometry}>
      <meshBasicMaterial map={segmentTexture} transparent polygonOffset polygonOffsetFactor={0} polygonOffsetUnits={-2} alphaTest={0.01} />
    </mesh>}
    {/* description mesh */}
    {description && <Text3D
      ref={descriptionObject3DRef}
    >{description.description}</Text3D>}
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
