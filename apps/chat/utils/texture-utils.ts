import { useEffect, useRef, useState } from 'react';
import {
  TextureLoader,
  Texture,
} from 'three';

export const useTextureLoaderUrl = (src: string | null, { textureLoader }: { textureLoader: TextureLoader }) => {
  const textureRef = useRef<Texture | null>(null);
  const srcRef = useRef<string | null>(null);
  const [textureEpoch, setTextureEpoch] = useState(0);

  const gc = () => {
    if (textureRef.current) {
      textureRef.current.dispose();
      textureRef.current = null;
    }
  };
  useEffect(() => {
    return gc;
  }, []);

  if (src !== srcRef.current) {
    gc();
    srcRef.current = src;
  }

  if (!!src && textureRef.current === null) {
    textureLoader.load(src, (texture) => {
      if (srcRef.current === src) {
        // console.log('got source data', [texture, texture?.source, texture?.source?.data]);
        textureRef.current = texture;
        setTextureEpoch(textureEpoch => textureEpoch + 1);
      }
    });
    srcRef.current = src;
  }
  // console.log('returning texture', textureRef.current);
  return textureRef.current;
};

export const useTextureLoaderBlob = (blob: Blob | null, { textureLoader }: { textureLoader: TextureLoader }) => {
  const blobRef = useRef<Blob | null>(null);
  const textureRef = useRef<Texture | null>(null);
  const srcRef = useRef<string | null>(null);
  const [textureEpoch, setTextureEpoch] = useState(0);

  const gc = () => {
    if (textureRef.current) {
      textureRef.current.dispose();
      textureRef.current = null;
    }
    if (srcRef.current) {
      URL.revokeObjectURL(srcRef.current);
      srcRef.current = null;
    }
  };
  useEffect(() => {
    return gc;
  }, []);

  if (blob !== blobRef.current) {
    gc();
    blobRef.current = blob;
  }

  if (!!blob && textureRef.current === null) {
    const src = URL.createObjectURL(blob);
    textureLoader.load(src, (texture) => {
      if (blobRef.current === blob) {
        // console.log('got source data', [texture, texture?.source, texture?.source?.data]);
        textureRef.current = texture;
        setTextureEpoch(textureEpoch => textureEpoch + 1);
      }
    });
    srcRef.current = src;
  }
  // console.log('returning texture', textureRef.current);
  return textureRef.current;
};