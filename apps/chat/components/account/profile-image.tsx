'use client'

import { Button } from '@/components/ui/button'
import { IconEdit } from '@/components/ui/icons'
import { r2EndpointUrl } from '@/utils/const/endpoints'
import React from 'react'
import Image from 'next/image'
import { useSupabase } from '@/lib/hooks/use-supabase'
import { isValidUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'


export interface ProfileImageProps {
  user: any,
  setUser: (user: any) => void,
  userIsCurrentUser: boolean,
  className?: string,
}

export function ProfileImage({user, setUser, userIsCurrentUser, className}: ProfileImageProps) {
  const { supabase } = useSupabase();

  return (
    <div className={cn("md:mr-8 relative inline-block", className)}>
      <Image
        alt=""
        src={isValidUrl(user.preview_url) ? user.preview_url : '/images/user-small.png'}
        height={100}
        width={100}
        className="border-2 rounded-xl drop-shadow-xl size-48 min-w-48 object-cover object-[50%_0%]"
      />
      {userIsCurrentUser ? (
        <Button
          className="absolute top-0 right-0 p-2 h-fit"
          onClick={async () => {
            // Get image from user.
            const file = await getFile()

            if (file) {
              const fileExtensionRegex = /(?:\.([^.]+))?$/
              const extension = fileExtensionRegex.exec(file.name)?.[1]

              if (extension) {
                const imageID = crypto.randomUUID()

                const url = `${r2EndpointUrl}/${user.id}/${imageID}.${extension}`

                try {
                  const res = await fetch(url, {
                    body: file,
                    method: 'PUT',
                  })
                } catch(e) {
                  if (e) {
                    if ( typeof e === 'string' ) {
                      if (e !== 'NetworkError when attempting to fetch resource.') {
                        throw new Error(e)
                      }
                    } else if (e instanceof Error) {
                      if (e.message !== 'NetworkError when attempting to fetch resource.') {
                        throw new Error(e.message)
                      }
                    }

                  }
                }

                setUser((user: any) => ({
                  ...user,
                  preview_url: url,
                }));

                // Set the user's preview url to the new URL.
                const result = await supabase
                  .from('accounts')
                  .update({
                    preview_url: url,
                  })
                  .eq('id', user.id);
                const { error } = result;
                if (error) {
                  console.error('Error updating user', error);
                }
              } else {
                console.error( 'Missing file extension.' )
              }
            }
          }}
          variant="ghost"
        >
          <IconEdit />
        </Button>
        ): null}
    </div>
  )
}


export async function getFile(): Promise<File|null> {
  return new Promise((resolve, reject) => {
    const inputElemenet = document.createElement('input');
    inputElemenet.accept='.jpeg,.jpg,.png,.webp'
    inputElemenet.style.display = 'none';
    inputElemenet.type = 'file';

    inputElemenet.addEventListener('change', () => {
      if (inputElemenet.files) {
        resolve(inputElemenet.files[0]);
      } else {
        resolve(null)
      }
    });

    const teardown = () => {
      document.body.removeEventListener('focus', teardown, true);
      setTimeout(() => {
        document.body.removeChild(inputElemenet);
      }, 1000);
    }
    document.body.addEventListener('focus', teardown, true);

    document.body.appendChild(inputElemenet);
    inputElemenet.click();
  })
}
