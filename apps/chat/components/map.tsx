'use client';

import React, { Suspense, useEffect, useRef, useState, useMemo, forwardRef, use } from 'react'
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import localforage from 'localforage';
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
import { getJWT } from '@/lib/jwt';
import {
  QueueManager,
} from '@/utils/queue-manager.mjs';
import { fetchImageGeneration, inpaintImage } from '@/utils/generate-image.mjs';
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

type Coord2D = {
  x: number,
  z: number,
};
type TileSpec = {
  coord: Coord2D,
  name: string,
  description: string,
  biome: string,
  temperature: number,
  wetness: number,
  points_of_interest: string[],
  exits: string[],
  image: Blob | null,
};
type TileLoad = {
  coord: Coord2D,
  loading: boolean,
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
      coord: z.object({
        x: z.number(),
        z: z.number(),
      }),
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
      let tileSpec = row[x];
      if (tileSpec.coord.x !== x || tileSpec.coord.z !== z) {
        throw new Error(`tile at (${x}, ${z}) has x, z of ${tileSpec.x}, ${tileSpec.z}`);
      }
      tileSpec = {
        ...tileSpec,
        image: null,
      };
      tileSpecs.push(tileSpec);
    }
  }
  return tileSpecs;
};

//

class TileLoader {
  queueManager = new QueueManager();
  // constructor() {
  // }
  async load({
    signal,
  }: {
    signal?: AbortSignal,
  } = {}): Promise<TileSpec[]> {
    return await this.queueManager.waitForTurn(async () => {
      let live = true;
      if (signal) {
        signal.addEventListener('abort', () => {
          live = false;
        });
      }

      let tileSpecs = await localforage.getItem('tileSpecs');
      if (!live) return [];
      if (!tileSpecs) {
        tileSpecs = [];
      }

      return tileSpecs;
    });
  }
  async save(tileSpecs: TileSpec[], {
    signal,
  }: {
    signal?: AbortSignal,
  } = {}): Promise<void> {
    if (!tileSpecs) {
      tileSpecs = [];
    }

    return await this.queueManager.waitForTurn(async () => {
      let live = true;
      if (signal) {
        signal.addEventListener('abort', () => {
          live = false;
        });
      }

      await localforage.setItem('tileSpecs', tileSpecs);
      if (!live) return;
    });
  }
}

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
      <Button variant="outline" className="text-xs mb-1" onClick={e => {
        eventTarget.dispatchEvent(new MessageEvent('clearMap', {
          data: null,
        }));
      }}>Clear</Button>
    </form>
  )
};
const MapScene = ({
  eventTarget,
}: {
  eventTarget: EventTarget,
}) => {
  const tileLoader = useMemo(() => new TileLoader(), []);
  const [loading, setLoading] = useState(false);
  const [tileSpecs, setTileSpecs] = useState<TileSpec[]>([]);
  const [tileLoads, setTileLoads] = useState<TileLoad[]>([]);
  const [tileEpoch, setTileEpoch] = useState(0);

  const loadTiles = async ({
    signal,
  }: {
    signal?: AbortSignal,
  } = {}) => {
    setLoading(true);
    const loadedTileSpecs = await tileLoader.load({
      signal,
    });
    setTileSpecs(loadedTileSpecs);
    setLoading(false);
  };
  const saveTiles = async (tileSpecs: TileSpec[], {
    signal,
  }: {
    signal?: AbortSignal,
  } = {}) => {
    await tileLoader.save(tileSpecs, {
      signal,
    });
  };

  // initial load
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    loadTiles({
      signal,
    });

    return () => {
      abortController.abort();
    };
  }, []);

  // generation
  useEffect(() => {
    const onGenerateMap = async (e: any) => {
      setLoading(true);
      setTileSpecs([]);
      setTileLoads([]);

      const prompt = e.data.prompt as string;
      const newTileSpecs = await generateMap({
        prompt,
        width: 3,
        height: 3,
      });
      console.log('newTileSpecs', newTileSpecs);
      setTileSpecs(newTileSpecs);
      saveTiles(newTileSpecs);
      setLoading(false);
    };
    eventTarget.addEventListener('generateMap', onGenerateMap);

    const onClearMap = async (e: any) => {
      setLoading(false);
      setTileSpecs([]);
      setTileLoads([]);
      saveTiles([]);
    };
    eventTarget.addEventListener('clearMap', onClearMap);

    return () => {
      eventTarget.removeEventListener('generateMap', onGenerateMap);
      eventTarget.removeEventListener('clearMap', onClearMap);
    };
  }, []);

  // tiles loading
  useEffect(() => {
    // add missing tile loads
    let added = false;
    for (const tileSpec of tileSpecs) {
      let tileLoad = tileLoads.find(tileLoad =>
        tileLoad.coord.x === tileSpec.coord.x &&
        tileLoad.coord.z === tileSpec.coord.z
      );
      if (!tileLoad) {
        tileLoad = {
          coord: structuredClone(tileSpec.coord),
          loading: false,
        };
        tileLoads.push(tileLoad);
        added = true;
      }
    }
    if (added) {
      setTileEpoch(tileEpoch => tileEpoch + 1);
    }

    const isLoading = tileLoads.some(load => load.loading);
    // console.log('is loading', isLoading);
    if (!isLoading) {
      const missingTile = tileSpecs.find(tile => !tile.image);
      // console.log('missing load', missingLoad);
      if (missingTile) {
        // start loading
        const { coord, name, description } = missingTile;
        const missingLoad = tileLoads.find(load =>
          load.coord.x === coord.x &&
          load.coord.z === coord.z
        );
        if (missingLoad) {
          console.log('loading', name, description);

          (async () => {
            missingLoad.loading = true;
            setTileEpoch(tileEpoch => tileEpoch + 1);

            {
              await new Promise(resolve => setTimeout(resolve, 1000));
              missingTile.image = new Blob([], {
                type: 'image/webp',
              });
              saveTiles(tileSpecs);
            }

            missingLoad.loading = false;
            setTileEpoch(tileEpoch => tileEpoch + 1);
          })();
        } else {
          throw new Error('missing load not found');
        }
      } else {
        // all loaded
      }
    } else {
      // already loading
    }
  }, [tileSpecs, tileLoads, tileEpoch]);

  // render
  return <>
    {/* controls */}
    <MapControls makeDefault target={[0, -1, 0]} />
    {/* lighting */}
    <ambientLight />
    <directionalLight position={[1, 1, 1]} />
    {/* test box */}
    <mesh position={[0, -0.01, 0]} geometry={planeGeometry}>
      <meshPhongMaterial color={loading ? 0x0000FF : 0x333333} />
    </mesh>
    {/* cursor mesh */}
    {/* <StoryCursor pressed={pressed} ref={storyCursorMeshRef} /> */}
    {/* plane mesh */}
    {(() => {
      const children = tileSpecs.map(({
        coord: {
          x,
          z,
        },
        name,
        description,
        image,
      }, index) => {
        const tileLoad = tileLoads.find(load =>
          load.coord.x === x &&
          load.coord.z === z
        );
        const loading = tileLoad?.loading ?? false;
        const loaded = !!image;

        const position = new Vector3(x, 0, z);

        const color = loading ? 0x0000FF : loaded ? 0x00FF00 : 0xFFFFFF;

        return (
          <object3D position={position} key={index}>
            <mesh geometry={planeGeometry}>
              <meshPhongMaterial color={color} />
            </mesh>
            <Text3D position={[0, 0.01, 0]} quaternion={rotateXQuaternion}>{description}</Text3D>
          </object3D>
        );
      });
      return children;
    })()}
  </>
}

function MapComponent() {
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
export {
  MapComponent as Map,
};