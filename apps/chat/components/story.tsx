'use client';

// import { useRouter } from 'next/navigation'
import React, { Suspense, useEffect, useRef, useState, useMemo, forwardRef, use } from 'react'
// import { z } from 'zod';
// import { zodResponseFormat } from 'openai/helpers/zod';
import { Canvas, useThree, useFrame } from '@react-three/fiber'
// import { Physics, RapierRigidBody, RigidBody } from "@react-three/rapier";
// import { LocalforageLoader } from '@/utils/localforage-loader';

// import { OrbitControls, KeyboardControls, Text, GradientTexture, MapControls, KeyboardControlsEntry, useKeyboardControls } from '@react-three/drei'
// import dedent from 'dedent';
// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  Vector3,
  Quaternion,
  NoToneMapping,
} from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Button } from '@/components/ui/button';
// import { CapsuleGeometry } from '@/utils/three/CapsuleGeometry.mjs';
// import {
//   // r2EndpointUrl,
//   aiProxyHost,
// } from '@/utils/const/endpoints';
// import { getJWT } from '@/lib/jwt';
// import { fetchJsonCompletion } from '@/utils/fetch';
// import { ChatMessage } from '@/utils/fetch';

//

// const mapDefaultPrompt = `epic anime adventure`;
// const mapStyle = `anime style map segment, top down overhead view`;

//

const StoryScene = ({
  id,
  user,
  edit,
}: {
  id: string,
  user: any,
  edit: boolean,
}) => {
  return <>
    {/* lighting */}
    <ambientLight />
    <directionalLight position={[1, 1, 1]} />
  </>
}

function StoryComponent({
  id,
  user,
  edit = false,
}: {
  id: string,
  user: any,
  edit?: boolean,
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="relative w-screen h-[calc(100vh-64px)]">
      <Canvas
        // camera={{
        //   position: [coord.x, 1, coord.z],
        // }}
        onCreated={({ gl }) => {
          gl.toneMapping = NoToneMapping;
        }}
        // onFocus={() => {
        //   setFocused(true);
        // }}
        // onBlur={() => {
        //   setFocused(false);
        // }}
        tabIndex={-1}
        ref={canvasRef}
        className="outline-none"
      >
        {/* <Suspense> */}
          {/* <Physics
            timeStep='vary'
            // debug
          > */}
            <StoryScene
              id={id}
              user={user}
              edit={edit}
              // coord={coord}
              // onMove={onMove}
              // loadState={[loadState, setLoadState]}
              // eventTarget={eventTarget}
              // focused={focused}
            />
          {/* </Physics> */}
        {/* </Suspense> */}
      </Canvas>
      {/* <MapForm eventTarget={eventTarget} /> */}
    </div>
  );
}
function Story({
  id,
  user,
}: {
  id: string,
  user: any,
}) {
  const loadUrl = new URL(location.href);
  const query = loadUrl.searchParams;
  const edit = query.get('edit') !== null;

  return (
    <StoryComponent
      id={id}
      user={user}
      edit={edit}
      // coord={coord}
      // onMove={onMove}
    />
  );
}
export {
  Story,
};