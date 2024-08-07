'use client';

// import { createRoot } from 'react-dom/client'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
// import { useAspect } from '@react-three/drei'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  Vector2,
  Vector3,
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
} from 'three';

const geometryResolution = 256;
const outlineWidth = 0.005;

export function useAspectContain(width: number, height: number, factor: number = 1): [number, number, number] {
  const v = useThree((state) => state.viewport)
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
const colorizePixelsArray = (uint8Array: Uint8Array) => {
  const rgbaArray = new Uint8Array(uint8Array.length * 4);
  {
    let j = 0;
    for (let i = 0; i < uint8Array.length; i++) {
      const v = uint8Array[i] ? 255 : 0;
      const a = uint8Array[i] ? 255 * 0.2 : 0;
      rgbaArray[j++] = 0;
      rgbaArray[j++] = v;
      rgbaArray[j++] = 0;
      rgbaArray[j++] = a;
    }
  }
  return rgbaArray;
};

const makeDepthSpec = ({
  width = 256,
  height = 256,
}: {
  width?: number,
  height?: number,
} = {}) => {
  const cutoff = 0.25;

  const data = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const py = y / (height - 1);
      let d = 0;
      if (y < height * cutoff) {
        d = (py / cutoff);
      } else {
        d = 1 - (py - cutoff) / (1 - cutoff);
      }
      data[index] = d;
    }
  }
  return {
    width,
    height,
    data,
  };
};
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const sampleData = (data: Float32Array, x: number, y: number, w: number, h: number) => {
  // x *= (w - 1) / w;
  // y *= (h - 1) / h;

  let topLeftX = Math.floor(x);
  let topLeftY = Math.floor(y);
  let bottomRightX = Math.ceil(x);
  let bottomRightY = Math.ceil(y);

  topLeftX = clamp(topLeftX, 0, w - 1);
  topLeftY = clamp(topLeftY, 0, h - 1);
  bottomRightX = clamp(bottomRightX, 0, w - 1);
  bottomRightY = clamp(bottomRightY, 0, h - 1);

  const topLeftIndex = topLeftY * w + topLeftX;
  const topLeft = data[topLeftIndex];

  const bottomLeftIndex = bottomRightY * w + topLeftX;
  const bottomLeft = data[bottomLeftIndex];

  const topRightIndex = topLeftY * w + bottomRightX;
  const topRight = data[topRightIndex];

  const bottomRightIndex = bottomRightY * w + bottomRightX;
  const bottomRight = data[bottomRightIndex];

  const pw = bottomRightX - topLeftX;
  const ph = bottomRightY - topLeftY;

  const left = ph > 0 ? (
    topLeft * (y - topLeftY) +
    bottomLeft * (bottomRightY - y)
  ) : topLeft;
  const right = ph > 0 ? (
    topRight * (y - topLeftY) +
    bottomRight * (bottomRightY - y)
  ) : topRight;
  const middle = pw > 0 ? (
    left * (x - topLeftX) +
    right * (bottomRightX - x)
  ) : left;
  return middle;
};

//

const JourneyScene = () => {
  const [planeGeometry, setPlaneGeometry] = useState<BufferGeometry>(() => {
    const planeGeometry = new PlaneGeometry(1, 1, geometryResolution, geometryResolution);
    const depthSpec = makeDepthSpec();
    const {
      width,
      height,
      data,
    } = depthSpec;
    // console.log('got depth spec', depthSpec);
    const positions = planeGeometry.attributes.position.array;
    const p = new Vector3();
    for (let i = 0; i < positions.length; i += 3) {
      p.fromArray(positions, i);
      const x = (p.x + 0.5) * width;
      const y = (p.y + 0.5) * height;
      const d = sampleData(data, x, y, width, height);
      // console.log('sample', x, y, d);
      positions[i + 2] = -d;
    }
    return planeGeometry;
  });
  const [texture, setTexture] = useState<Texture | null>(null);
  const [highlightTexture, setHighlightTexture] = useState<Texture | null>(null);
  const scale = useAspectContain(
    texture ? texture.source.data.width : 512, // Pixel-width
    texture ? texture.source.data.height : 512, // Pixel-height
    1                         // Optional scaling factor
  );
  const raycaster = useMemo(() => new Raycaster(), []);
  const plane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), []);
  const planeMeshRef = useRef<Mesh>(null);
  const pointerMeshRef = useRef<Mesh>(null);
  const [dragBox, setDragBox] = useState<Box3 | null>(null);
  const [dragUvBox, setDragUvBox] = useState<Box2 | null>(null);
  const [dragGeometry, setDragGeometry] = useState<BufferGeometry>(() => new BufferGeometry());
  // const [mousePosition, setMousePosition] = useState(() => new Vector2(0, 0));

  const getUvFromMouseEvent = (e: MouseEvent, target: Vector2) => {
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
  };

  useEffect(() => {
    const t = new TextureLoader().load('/images/test-bg.webp', () => {
      // const img = t.source.data;
      setTexture(t);
    });
  }, []);

  // const { size } = useThree();
  const { camera } = useThree();
  useFrame((state) => {
    const pointerMesh = pointerMeshRef.current;
    const planeMesh = planeMeshRef.current;
    if (planeMesh && pointerMesh) {
      const mousePosition = new Vector2(
        // state.mouse.x * 2 - 1,
        // -state.mouse.y * 2 + 1
        state.mouse.x,
        state.mouse.y,
      );
      // setMousePosition(mousePosition);

      raycaster.setFromCamera(mousePosition, camera);
      raycaster.ray.intersectPlane(plane, pointerMesh.position);

      // get the bounding box of the plane mesh
      const planeBox = new Box3().setFromObject(planeMesh);
      planeBox.min.z = -1;
      planeBox.max.z = 1;

      pointerMesh.visible = planeBox.containsPoint(pointerMesh.position);

      // pointerMesh.position.x = mousePosition.x;
      // pointerMesh.position.y = mousePosition.y;
      // pointerMesh.position.z = 0;
      // pointerMesh.position.project(camera);
      // console.log('got', pointerMesh.position);
      // const p = new Vector3(mousePosition.x, mousePosition.y, 0).project(camera);
      // pointerMesh.position.set(mousePosition.x, mousePosition.y, 0.1);
      // pointerMesh.updateMatrixWorld();
    }
  });
  // get the canvas using useThree
  const { gl } = useThree();
  const canvas = gl.domElement;
  useEffect(() => {
    const pointerMesh = pointerMeshRef.current;

    if (pointerMesh) {
      const mousedown = (e: any) => {
        if (e.target === canvas) {
          if (pointerMesh.visible) {
            // set states
            const dragBox = new Box3(pointerMesh.position.clone(), pointerMesh.position.clone());
            setDragBox(dragBox);

            const dragUv = getUvFromMouseEvent(e, new Vector2());
            const dragUvBox = new Box2(dragUv.clone(), dragUv.clone())
            setDragUvBox(dragUvBox);

            setDragGeometry(makeBoxOutlineGeometry(dragBox));
          }
        }
      };
      document.addEventListener('mousedown', mousedown);
      const mouseup = (e: any) => {
        if (dragUvBox) {
          const width = texture?.source.data.width as number;
          const height = texture?.source.data.height as number;

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

          const distance = dragUvBox.min.distanceTo(dragUvBox.max);
          if (w === 0 || h === 0 || distance <= 0.01) {
            console.log('click', dragUvBox.max.x, dragUvBox.max.y);
          } else {
            console.log('select', distance, dragUvBox.min.x, dragUvBox.min.y, dragUvBox.max.x, dragUvBox.max.y);

            const pixelsArray = makePixelsArray({
              width,
              height,
              x1,
              y1,
              x2,
              y2,
            });
            const colorArray = colorizePixelsArray(pixelsArray);
            const ht = new DataTexture(colorArray, width, height, RGBAFormat, UnsignedByteType);
            ht.minFilter = NearestFilter;
            ht.magFilter = NearestFilter;
            ht.flipY = true;
            ht.needsUpdate = true;
            setHighlightTexture(ht);
          }
          setDragBox(null);
          setDragUvBox(null);
        }
      };
      document.addEventListener('mouseup', mouseup);
      const mousemove = (e: any) => {
        if (dragBox && dragUvBox && pointerMesh.visible) {
          dragBox.max.copy(pointerMesh.position);
          getUvFromMouseEvent(e, dragUvBox.max);
          setDragGeometry(makeBoxOutlineGeometry(dragBox));
        }
      };
      document.addEventListener('mousemove', mousemove);

      return () => {
        document.removeEventListener('mousedown', mousedown);
        document.removeEventListener('mouseup', mouseup);
        document.removeEventListener('mousemove', mousemove);
      };
    }
  }, [pointerMeshRef.current, scale, dragBox, dragUvBox]);

  return <>
    {/* <ambientLight intensity={Math.PI / 2} />
    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} /> */}
    {/* <Box position={[-1.2, 0, 0]} />
    <Box position={[1.2, 0, 0]} /> */}
    {/* drag mesh */}
    {dragBox && <mesh
      geometry={dragGeometry}
    >
      {/* <boxGeometry args={[0.2, 0.2, 0.2]} /> */}
      <meshBasicMaterial color="black" />
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
    {/* plane mesh */}
    {planeGeometry && texture && <mesh geometry={planeGeometry} scale={scale} ref={planeMeshRef}>
      {/* <planeGeometry args={planeGeometry} /> */}
      <meshBasicMaterial map={texture} />
    </mesh>}
    {/* plane mesh */}
    {highlightTexture && <mesh position={[0, 0, 0.001]} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={highlightTexture} transparent />
    </mesh>}
  </>
}

export function Journey() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        <JourneyScene />
      </Canvas>
    </div>
  )
}
