import * as THREE from 'three';
import * as THREEExtra from './three-extra.js';
import * as React from 'react';
import * as ReactThreeFiber from '@react-three/fiber';

globalThis.Metaversefile = {
  exports: {
    THREE,
    THREEExtra,
    React,
    ReactThreeFiber,
  },
};