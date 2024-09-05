'use client';

import React from 'react';
import { useState, useMemo } from 'react';
import { Vector3, Quaternion } from 'three';
import { Canvas, useThree, useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { Button } from '@/components/ui/button';
import { getJWT } from '@/lib/jwt';
import {
  generateCharacterImage,
  generateEmotionImages,
  generate360Images,
} from 'usdk/sdk/src/util/generate-image.mjs';
import {
  generateModel,
} from 'usdk/sdk/src/util/generate-model.mjs';
import {
  removeBackground,
} from 'usdk/sdk/src/util/vision.mjs';
import {
  r2EndpointUrl,
} from 'usdk/sdk/src/util/endpoints.mjs';
import { OrbitControls } from '@react-three/drei';

const getUserImageSrc = (type: string) => (user: any) : (string | string[] | null) => {
  return user.playerSpec.images?.find((imageSpec: any) => imageSpec.type === type)?.url ?? null;
};
type GenerationSpec = {
  imageUrl: string,
  visualDescription: string,
};
const ImageComponent = ({
  src,
}: {
  src: string;
}) => {
  return (
    <a
      href={src}
      target="_blank"
    >
      <img
        src={src}
        className="w-20 h-20 m-2"
      />
    </a>
  );
};
const ModelComponent = ({
  src,
}: {
  src: string;
}) => {
  const model = useLoader(GLTFLoader, src);
  const y180Quaternion = useMemo(() => new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI), []);
  const size = 300;

  return (
    // <div className={`w-[${size}px] h-[${size}px]`}>
      <Canvas
        camera={{
          position: [0, 0, 1],
        }}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <ambientLight />
        <directionalLight position={[1, 2, 3]} />
        <primitive object={model.scene} quaternion={y180Quaternion} />
        <OrbitControls />
      </Canvas>
    // </div>
  );
};
const auxTypeSpecs = [
  {
    name: 'alpha',
    type: 'image/alpha',
    getImageSrc: getUserImageSrc('image/alpha'),
    Component: ImageComponent,
    generate: async (generationSpec: GenerationSpec) => {
      const res = await fetch(generationSpec.imageUrl);
      const blob = await res.blob();

      const jwt = await getJWT();
      const blob2 = await removeBackground(blob, {
        jwt,
      });

      /* // XXX debug
      {
        const img = await blob2img(blob2);
        img.style.cssText = `\
          position: fixed;
          top: 0;
          right: 0;
          width: 300px;
          z-index: 9999;
        `;
        document.body.appendChild(img);
      } */

      const guid = crypto.randomUUID();
      const res2 = await fetch(`${r2EndpointUrl}/${guid}/avatar.webp`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/octet-stream',
        },
        body: blob2,
      });
      const imgUrl = await res2.json();

      return [
        {
          type: 'image/alpha',
          url: imgUrl,
        },
      ];
    },
  },
  {
    name: 'emotions',
    type: 'image/emotions',
    getImageSrc: getUserImageSrc('image/emotions'),
    Component: ImageComponent,
    generate: async (generationSpec: GenerationSpec) => {
      const res = await fetch(generationSpec.imageUrl);
      const blob = await res.blob();

      const visualDescription = generationSpec.visualDescription;

      const jwt = await getJWT();
      const imageBlobs = await generateEmotionImages(blob, visualDescription, undefined, {
        jwt,
      });

      /* // XXX debug
      {
        for (let i = 0; i < imageBlobs.length; i++) {
          const img = await blob2img(imageBlobs[i]);
          img.style.cssText = `
            position: fixed;
            top: 0;
            right: ${i * 200}px;
            width: 200px;
            z-index: 9999;
          `;
          document.body.appendChild(img);
        }
      } */

      // upload the images to r2
      const guid = crypto.randomUUID();
      const imageUrls = await Promise.all(imageBlobs.map(async (imageBlob, i) => {
        const res = await fetch(`${r2EndpointUrl}/${guid}/avatar-emotion-${i}.webp`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/octet-stream',
          },
          body: imageBlob,
        });
        const imgUrl = await res.json();
        // console.log('uploaded image', imgUrl);
        return imgUrl;
      }));

      return [
        {
          type: 'image/emotions',
          url: imageUrls,
        },
      ];
    },
  },
  {
    name: '360',
    type: 'image/360',
    getImageSrc: getUserImageSrc('image/360'),
    Component: ImageComponent,
    generate: async (generationSpec: GenerationSpec) => {
      const res = await fetch(generationSpec.imageUrl);
      const blob = await res.blob();

      const jwt = await getJWT();
      const frameBlobs = await generate360Images(blob, {
        jwt,
      });
      const imageBlobs2 = [
        frameBlobs[20], // Starting point
        frameBlobs[17], // 20 - 3
        frameBlobs[15], // 17 - 2
        frameBlobs[12], // 15 - 3
        frameBlobs[10], // 12 - 2
        frameBlobs[7],  // 10 - 3
        frameBlobs[5],  // 7 - 2
        frameBlobs[2]   // 5 - 3 (Close to the loop point)
      ];

      /* // XXX debug
      {
        for (let i = 0; i < imageBlobs2.length; i++) {
          const imageBlob = imageBlobs2[i];
          const img = await blob2img(imageBlob);
          img.style.cssText = `
            position: fixed;
            top: 0;
            right: ${i * 200}px;
            width: 200px;
            z-index: 9999;
          `;
          document.body.appendChild(img);
        }
      } */

      // upload the images to r2
      const guid = crypto.randomUUID();
      const imageUrls = await Promise.all(imageBlobs2.map(async (imageBlob, i) => {
        const res = await fetch(`${r2EndpointUrl}/${guid}/avatar-360-${i}.webp`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/octet-stream',
          },
          body: imageBlob,
        });
        const imgUrl = await res.json();
        console.log('uploaded image', imgUrl);
        return imgUrl;
      }));

      return [
        {
          type: 'image/360',
          url: imageUrls,
        },
      ];
    },
  },
  {
    name: '3d',
    type: 'model/3d',
    getImageSrc: getUserImageSrc('model/3d'),
    Component: ModelComponent,
    generate: async (generationSpec: GenerationSpec) => {
      const res = await fetch(generationSpec.imageUrl);
      const blob = await res.blob();

      const jwt = await getJWT();
      const modelBlob = await generateModel(blob, {
        jwt,
      });
      console.log('got model blob', modelBlob);

      // upload the model to r2
      const guid = crypto.randomUUID();
      const res2 = await fetch(`${r2EndpointUrl}/${guid}/avatar-3d.glb`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/octet-stream',
        },
        body: modelBlob,
      });
      const modelUrl = await res2.json();

      return [
        {
          type: 'model/3d',
          url: modelUrl,
        },
      ];
    },
  },
];

export const AuxImages = ({
  user,
  setUser,
  visualDescription,
  generate,
}: {
  user: any;
  setUser: (user: any) => void;
  visualDescription: string;
  generate: boolean;
}) => {
  const { supabase } = useSupabase();

  const [auxGenerationType, setAuxGenerationType] = useState(auxTypeSpecs[0].name);

  const onGenerateClick = async () => {
    const typeSpec = auxTypeSpecs.find(typeSpec => typeSpec.name === auxGenerationType);
    if (typeSpec) {
      const generationSpec = {
        imageUrl: user.preview_url,
        visualDescription,
      };
      const newImages = await typeSpec.generate(generationSpec);

      let newPlayerSpec = {
        ...user.playerSpec,
        images: [
          ...(user.playerSpec.images ?? []).filter((imageSpec: any) => imageSpec.type !== typeSpec.type),
          ...newImages,
        ],
      };
      setUser((user: any) => {
        // console.log('setting user', user);
        return {
          ...user,
          playerSpec: newPlayerSpec,
        };
      });

      // save the image to the account
      const result = await supabase
        .from('accounts')
        .update({
          playerSpec: newPlayerSpec,
        })
        .eq('id', user.id);
      const { error } = result;
      if (error) {
        console.error('Error updating user', error);
      }
    } else {
      throw new Error('Invalid type');
    }
  };

  return (
    <>
      <div className="flex flex-col items-start justify-start">
        {auxTypeSpecs.map(typeSpec => {
          let src = typeSpec.getImageSrc(user);
          if (typeof src === 'string') {
            src = [src];
          }
          const {Component} = typeSpec;

          return (
            <div key={typeSpec.name} className="p-2 m-2 rounded bg-zinc-800">
              {typeSpec.name}
              {!!src ? ' ✓' : ' ✗'}
              <div className="flex items-center">
                {(() => {
                  if (src) {
                    return src.map((u, i) => (
                      <Component src={u} key={i} />
                    ));
                  } else {
                    return null;
                  }
                })()}
              </div>
            </div>
          );
        })}
      </div>
      {generate && <div className="flex items-center">
        <select
          className="h-10 p-2 m-2 rounded"
          value={auxGenerationType}
          onChange={e => setAuxGenerationType(e.target.value)}
        >
          {auxTypeSpecs.map(typeSpec => (
            <option key={typeSpec.name} value={typeSpec.name}>
              {typeSpec.name}
            </option>
          ))}
        </select>
        <Button
          onClick={onGenerateClick}
        >
          Generate
        </Button>
      </div>}
    </>
  )
};