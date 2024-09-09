import React from 'react';
import { useState, useMemo } from 'react';
import { Vector3, Quaternion } from 'three';
import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';

export const Model = ({
  src,
  width = 300,
  height = width,
}: {
  src: string;
  width?: number;
  height?: number;
}) => {
  const model = useLoader(GLTFLoader, src);
  const y180Quaternion = useMemo(() => new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI), []);

  return (
    <Canvas
      camera={{
        position: [0, 0, 1],
      }}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <ambientLight />
      <directionalLight position={[1, 2, 3]} />
      <primitive object={model.scene} quaternion={y180Quaternion} />
      <OrbitControls />
    </Canvas>
  );
};