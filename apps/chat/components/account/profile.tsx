'use client';

import React, { useState, useMemo } from 'react'
import { useSupabase } from '@/lib/hooks/use-supabase'
import { ProfileImage } from '@/components/account/profile-image'
import { Button } from '@/components/ui/button';
import { getJWT } from '@/lib/jwt';
import { blob2img } from '@/lib/blob';
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

const getUserImageSrc = (type: string) => (user: any) => {
  return user.images?.find((imageSpec: any) => imageSpec.type === type) ?? null;
};
const auxTypeSpecs = [
  {
    name: 'pfp',
    getImageSrc: (user: any) => user.preview_url,
    generate: async (user: any) => {
      const jwt = await getJWT();
      const {
        fullPrompt,
        blob,
      } = await generateCharacterImage(user.visualDescription, undefined, {
        jwt,
      });
      
      const img = await blob2img(blob);
      img.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 300px;
        z-index: 9999;
      `;
      document.body.appendChild(img);

      return user;
    },
  },
  {
    name: 'alpha',
    getImageSrc: getUserImageSrc('image/alpha'),
    generate: async (user: any) => {
      const res = await fetch(user.preview_url);
      const blob = await res.blob();

      const jwt = await getJWT();
      const blob2 = await removeBackground(blob, {
        jwt,
      });

      const img = await blob2img(blob2);
      img.style.cssText = `\
        position: fixed;
        top: 0;
        right: 0;
        width: 300px;
        z-index: 9999;
      `;
      document.body.appendChild(img);

      return user;
      // // remove background
      // return {
      //   ...user,
      //   images: [
      //     ...user.images,
      //     {
      //       type: 'image/alpha',
      //       url: 'https://example.com/image.png',
      //     }
      //   ],
      // };
    },
  },
  {
    name: 'emotions',
    getImageSrc: getUserImageSrc('image/emotions'),
    generate: async (user: any) => {
      const res = await fetch(user.preview_url);
      const blob = await res.blob();

      const visualDescription = user.playerSpec.visualDescription;

      const jwt = await getJWT();
      const imageBlobs = await generateEmotionImages(blob, visualDescription, undefined, {
        jwt,
      });
      console.log('got images', imageBlobs);

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

      return user;
      // // generate emotions
      // // generate 360
      // return {
      //   ...user,
      //   images: [
      //     ...user.images,
      //     {
      //       type: 'image/emotions',
      //       url: 'https://example.com/image.png',
      //     },
      //   ],
      // };
    },
  },
  {
    name: '360',
    getImageSrc: getUserImageSrc('image/360'),
    generate: async (user: any) => {
      const res = await fetch(user.preview_url);
      const blob = await res.blob();

      const jwt = await getJWT();
      const images = await generate360Images(blob, {
        jwt,
      });
      console.log('got images', images);
      for (let i = 0; i < images.length; i++) {
        const img = await blob2img(images[i]);
        img.style.cssText = `
          position: fixed;
          top: 0;
          right: ${i * 200}px;
          width: 200px;
          z-index: 9999;
        `;
        document.body.appendChild(img);
      }

      return user;
      // // generate 360
      // return {
      //   ...user,
      //   images: [
      //     ...user.images,
      //     {
      //       type: 'image/360',
      //       url: 'https://example.com/image.png',
      //     },
      //   ],
      // };
    },
  },
  {
    name: '3d',
    getImageSrc: getUserImageSrc('image/3d'),
    generate: async (user: any) => {
      const res = await fetch(user.preview_url);
      const blob = await res.blob();

      const jwt = await getJWT();
      const modelBlob = await generateModel(blob, {
        jwt,
      });
      console.log('got model blob', modelBlob);

      return user;
      // // generate 360
      // return {
      //   ...user,
      //   images: [
      //     ...user.images,
      //     {
      //       type: 'image/360',
      //       url: 'https://example.com/image.png',
      //     },
      //   ],
      // };
    },
  },
];

export interface ProfileProps {
  user: any,
  userIsCurrentUser: boolean,
}

export function Profile({
  user: userInit,
  userIsCurrentUser,
}: ProfileProps) {
  const { supabase } = useSupabase();

  const [user, setUser] = useState(() => userInit);
  const [name, _setName] = useState<string>(user.name);
  const setName = (name: string) => {
    _setName(name);
    // user.name = name;
  };
  const [bio, _setBio] = useState<string>(user.playerSpec.bio);
  const setBio = (bio: string) => {
    _setBio(bio);
    // user.playerSpec.bio = bio;
  };
  const [visualDescription, _setVisualDescription] = useState<string>(user.playerSpec.visualDescription);
  const setVisualDescription = (visualDescription: string) => {
    _setVisualDescription(visualDescription);
    // user.playerSpec.visualDescription = visualDescription;
  };
  const avatarAlphaImageUrl = useMemo(() => {
    const alphaImageSpec = user.images?.find((image: any) => image.type === 'image/alpha');
    return alphaImageSpec?.url ?? null;
  }, [user.images?.length ?? 0]);
  const avatarEmotionsImageUrl = useMemo(() => {
    const emotionsImageSpec = user.images?.find((image: any) => image.type === 'image/emotions');
    return emotionsImageSpec?.url ?? null;
  }, [user.images?.length ?? 0]);
  const avatar360ImageUrl = useMemo(() => {
    const image360Spec = user.images?.find((image: any) => image.type === 'image/360');
    return image360Spec?.url ?? null;
  }, [user.images?.length ?? 0]);
  
  const [auxGenerationType, setAuxGenerationType] = useState(auxTypeSpecs[0].name);

  const generate = async () => {
    const typeSpec = auxTypeSpecs.find(typeSpec => typeSpec.name === auxGenerationType);
    if (typeSpec) {
      console.log('generate 1', structuredClone(user));
      const newUser = await typeSpec.generate(user);
      setUser(newUser);
      console.log('generate 2', structuredClone(user));
    } else {
      throw new Error('Invalid type');
    }
  };
  const saveInfo = async () => {
    const o = {
      name,
      playerSpec: {
        ...user.playerSpec,
        bio,
        visualDescription,
      },
    };
    const result = await supabase
      .from('accounts')
      .update(o)
      .eq('id', user.id);
    const { error } = result;
    if (error) {
      console.error(error)
    }
  };

  return (
    <div className="m-auto w-full max-w-4xl">
      <div className="sm:flex sm:flex-col sm:align-center py-2 md:py-4">
        <h1 className="text-2xl font-extrabold text-white sm:text-center sm:text-4xl">
          Profile
        </h1>
        <p className="max-w-2xl m-auto md:mt-4 text-lg text-zinc-200 sm:text-center sm:text-xl">
          Update your profile information.
        </p>
      </div>
      <div className="w-full m-auto my-4 border rounded-md p border-zinc-700">
        <div className="px-5 py-4">
          <div className="mt-5 mb-4 text-xl text-center font-semibold md:flex">
            <ProfileImage user={user} setUser={setUser} userIsCurrentUser={userIsCurrentUser} />
            <div className='flex flex-col w-full mt-4 md:mt-0 items-end'>
              <input
                type="text"
                name="fullName"
                className="w-full p-3 rounded-md bg-zinc-800 mb-2"
                placeholder="Display name"
                maxLength={64}
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <textarea
                name="fullName"
                className="w-full h-32 p-3 rounded-md bg-zinc-800 mb-2 text-sm"
                value={bio}
                placeholder="Bio"
                onChange={e => setBio(e.target.value)}
              />
              <textarea
                name="visualDescription"
                className="w-full h-12 p-3 rounded-md bg-zinc-800 mb-2 text-sm"
                value={visualDescription}
                placeholder="Visual description"
                onChange={e => setVisualDescription(e.target.value)}
              />
              <Button
                onClick={saveInfo}
              >
                Save Info
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t rounded-b-md border-zinc-700 text-zinc-500">
          <div className="flex flex-col items-start justify-start">
            {/* <p className="pb-4 sm:pb-0">64 characters maximum</p> */}
            <div className="flex flex-col items-start justify-start">
              {auxTypeSpecs.map(typeSpec => {
                const src = typeSpec.getImageSrc(user);
                return (
                  <p key={typeSpec.name} className="p-2 m-2 rounded bg-zinc-800">
                    {typeSpec.name}
                    {!!src ? ' ✓' : ' ✗'}
                    {!!src && (
                      <img
                        className="w-20 h-20"
                        src={src}
                      />
                    )}
                  </p>
                );
              })}
            </div>
            <div className="flex items-center">
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
                onClick={generate}
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
