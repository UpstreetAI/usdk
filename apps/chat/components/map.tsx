'use client';

import React, { Suspense, useEffect, useRef, useState, useMemo, forwardRef, use } from 'react'
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber'
import { Physics, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { OrbitControls, KeyboardControls, Text, GradientTexture, MapControls } from '@react-three/drei'
// import Ecctrl from 'ecctrl';
import dedent from 'dedent';
// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  Vector2,
  Vector3,
  Quaternion,
  Object3D,
  Scene,
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
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Button } from '@/components/ui/button';
// import { CapsuleGeometry } from '@/utils/three/CapsuleGeometry.mjs';
import {
  // r2EndpointUrl,
  aiProxyHost,
} from '@/utils/const/endpoints';
// import {
//   defaultQuality,
// } from '@/utils/const/defaults';
import {
  describe,
  describeJson,
  getDepth,
  detect,
  segment,
  segmentAll,
  removeBackground,
} from '@/utils/vision';
// import {
//   generateSound,
// } from '@/utils/sound';
// import {
//   generateModel,
// } from '@/utils/generate-model';
import { getJWT } from '@/lib/jwt';
// import { fetchImageGeneration, inpaintImage } from '@/utils/generate-image.mjs';
import { defaultOpenAIModel } from '@/utils/const/defaults.js';

//

const mapDefaultPrompt = `isekai style anime adventure`;

const planeScale = 0.9;
const planeGeometry = new PlaneGeometry(1, 1)
  .scale(planeScale, planeScale, 1)
  .rotateX(-Math.PI / 2);
const rotateXQuaternion = new Quaternion()
  .setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);

const biomesEnum = z.enum([
  "badlands",
  "bamboo_jungle",
  "basalt_deltas",
  "beach",
  "birch_forest",
  "cherry_grove",
  "cold_ocean",
  "crimson_forest",
  "dark_forest",
  "deep_cold_ocean",
  "deep_dark",
  "deep_frozen_ocean",
  "deep_lukewarm_ocean",
  "deep_ocean",
  "desert",
  "dripstone_caves",
  "end_barrens",
  "end_highlands",
  "end_midlands",
  "eroded_badlands",
  "flower_forest",
  "forest",
  "frozen_ocean",
  "frozen_peaks",
  "frozen_river",
  "grove",
  "ice_spikes",
  "jagged_peaks",
  "jungle",
  "lukewarm_ocean",
  "lush_caves",
  "mangrove_swamp",
  "meadow",
  "mushroom_fields",
  "nether_wastes",
  "ocean",
  "old_growth_birch_forest",
  "old_growth_pine_taiga",
  "old_growth_spruce_taiga",
  "plains",
  "river",
  "savanna",
  "savanna_plateau",
  "small_end_islands",
  "snowy_beach",
  "snowy_plains",
  "snowy_slopes",
  "snowy_taiga",
  "soul_sand_valley",
  "sparse_jungle",
  "stony_peaks",
  "stony_shore",
  "sunflower_plains",
  "swamp",
  "taiga",
  "the_end",
  "the_void",
  "warm_ocean",
  "warped_forest",
  "windswept_forest",
  "windswept_gravelly_hills",
  "windswept_hills",
  "windswept_savanna",
  "wooded_badlands"
]);

type TileSpec = {
  x: number,
  z: number,
  name: string,
  description: string,
  biome: string,
  temperature: number,
  wetness: number,
  points_of_interest: string[],
  exits: string[],
};

// const getWidth = (i: any) => i.naturalWidth ?? i.videoWidth ?? i.width;
// const getHeight = (i: any) => i.naturalHeight ?? i.videoHeight ?? i.height;

const fetchJsonCompletion = async (messages: any[], format: z.ZodTypeAny) => {
  const jwt = await getJWT();

  // console.log('got response format', zodResponseFormat(format, 'json_tiles'));

  const res = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      // 'OpenAI-Beta': 'assistants=v1',
      Authorization: `Bearer ${jwt}`,
    },

    body: JSON.stringify({
      model: defaultOpenAIModel,
      messages,

      response_format: zodResponseFormat(format, 'json_tiles'),

      // stream,
    }),
    // signal,
  });
  if (res.ok) {
    const j = await res.json();
    const s = j.choices[0].message.content;
    const o = JSON.parse(s);
    return o;
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};
const generateMap = async ({
  prompt,
  width = 3,
  height = 3,
}: {
  prompt: string,
  width?: number,
  height?: number,
}) => {
  const messages = [
    {
      role: 'user',
      content: dedent`\
        Generate an array of JSON map tile descriptions for an RPG game overworld.
        The tiles are roughly 100x100 meters, so they should change gradually. That is, a lush jungle tile should not be next to a city or a glacier.
        The tiles are shown from an overhead view, in a ${width}x${height} grid.
        The top-left tile is at (x, z) = (0, 0), and the bottom-right tile is at (${width - 1}, ${height - 1}).
        The JSON representation is a 2D array of objects, west to east, north to south.
        \`temperature\` is a number from 0 to 1 representing how hot or cold the tile is.
        \`wetness\` is a number from 0 to 1 representing how wet or dry the tile is.
        The \`exits\` key represents whether it is possible for a character to traverse to the next tile in that direction.

        Use the following prompt:
      ` + '\n' +
        prompt,
    },
  ];
  const format = z.object({
    tiles: z.array(z.array(z.object({
      x: z.number(),
      z: z.number(),
      name: z.string(),
      description: z.string(),
      biome: biomesEnum,
      temperature: z.number(),
      wetness: z.number(),
      points_of_interest: z.array(z.string()),
      exits: z.array(z.enum(['north', 'south', 'east', 'west'])),
    }))),
  });
  const grid = await fetchJsonCompletion(messages, format);

  const tileSpecs: TileSpec[] = [];
  for (let z = 0; z < height; z++) {
    const row = grid.tiles[z];
    if (row.length !== width) {
      throw new Error(`row ${z} has length ${row.length} instead of ${width}`);
    }
    for (let x = 0; x < width; x++) {
      const tileSpec = row[x];
      if (tileSpec.x !== x || tileSpec.z !== z) {
        throw new Error(`tile at (${x}, ${z}) has x, z of ${tileSpec.x}, ${tileSpec.z}`);
      }
      tileSpecs.push(tileSpec);
    }
  }
  return tileSpecs;
};

//

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
  position?: [number, number, number] | Vector3,
  quaternion?: [number, number, number, number] | Quaternion,
  scale?: [number, number, number] | Vector3,
};

const Text3D = forwardRef(({
  children = '',
  position,
  quaternion,
  scale,
  // font = 'fonts/WinchesterCaps.ttf',
  font = 'fonts/Plaza Regular.ttf',
  fontSize = 0.05,
  lineHeight = 1.2,
  color = 0xFFFFFF,
  bgColor = 0x000000,
  anchorX = "left",
  anchorY = "top",
  // ...rest
}: Text3DProps, ref: any) => {
  const numLines = 8;
  const boxWidth = 0.75;
  const boxHeight = fontSize * lineHeight * numLines;
  const padding = 0.02;
  return (
    <Suspense>
      <object3D
        position={position}
        quaternion={quaternion}
        scale={scale}
        ref={ref}
      >
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
Text3D.displayName = 'Text3D';

const MapForm = ({
  eventTarget,
}: {
  eventTarget: EventTarget,
}) => {
  return (
    <form className="flex" onSubmit={e => {
      e.preventDefault();
      e.stopPropagation();
    }}>
      <Button variant="outline" className="text-xs mb-1" onClick={e => {
        const promptString = prompt(`Generate what scene? (e.g. "${mapDefaultPrompt}")`, mapDefaultPrompt);
        if (promptString) {
          eventTarget.dispatchEvent(new MessageEvent('generateMap', {
            data: {
              prompt: promptString,
            },
          }));
        }
      }}>Generate</Button>
    </form>
  )
};
const MapScene = ({
  eventTarget,
}: {
  eventTarget: EventTarget,
}) => {
  // const grid = useMemo(() => {
  //   const result = [];
  //   for (let z = -1; z <= 1; z++) {
  //     for (let x = -1; x <= 1; x++) {
  //       const position = new Vector3(x, 0, z);
  //       const description = `(${x}, ${z})`;
  //       result.push({
  //         position,
  //         description,
  //       });
  //     }
  //   }
  //   return result;
  // }, []);
  // const camera = useMemo(() => {
  //   const camera = new PerspectiveCamera();
  //   camera.position.set(0, 1, 1);
  //   camera.up.set(0, 0, -1);
  //   return camera;
  // }, []);
  const [tileSpecs, setTileSpecs] = useState<TileSpec[]>([]);

  useEffect(() => {
    const onGenerateMap = async (e: any) => {
      const prompt = e.data.prompt as string;
      const newTileSpecs = await generateMap({
        prompt,
        width: 3,
        height: 3,
      });
      console.log('got new tile specs', newTileSpecs);
      setTileSpecs(newTileSpecs);
    };
    eventTarget.addEventListener('generateMap', onGenerateMap);

    return () => {
      eventTarget.removeEventListener('generateMap', onGenerateMap);
    };
  }, []);

  // render
  return <>
    {/* controls */}
    <MapControls makeDefault target={[0, -1, 0]} />
    {/* lighting */}
    <ambientLight />
    <directionalLight position={[1, 1, 1]} />
    {/* test box */}
    <mesh position={[0, -0.01, 0]} geometry={planeGeometry}>
      <meshPhongMaterial color={0xFF00FF} />
    </mesh>
    {/* cursor mesh */}
    {/* <StoryCursor pressed={pressed} ref={storyCursorMeshRef} /> */}
    {/* plane mesh */}
    {(() => {
      const children = tileSpecs.map(({
        x,
        z,
        name,
        description,
      }, index) => {
        const position = new Vector3(x, 0, z);
        return (
          <object3D position={position} key={index}>
            <mesh geometry={planeGeometry}>
              <meshBasicMaterial color={0xFFFFFF} />
            </mesh>
            <Text3D position={[0, 0.01, 0]} quaternion={rotateXQuaternion}>{description}</Text3D>
          </object3D>
        );
      });
      return children;
    })()}
  </>
}

export function Map() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eventTarget = useMemo(() => new EventTarget(), []);

  return (
    <div className="relative w-screen h-[calc(100vh-64px)]">
      <Canvas
        camera={{
          position: [0, 1, 0],
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = NoToneMapping;
        }}
        ref={canvasRef}
      >
        {/* <Suspense> */}
          {/* <Physics
            timeStep='vary'
            // debug
          > */}
            <MapScene eventTarget={eventTarget} />
          {/* </Physics> */}
        {/* </Suspense> */}
      </Canvas>
      <MapForm eventTarget={eventTarget} />
    </div>
  )
}
