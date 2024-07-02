'use client'

import { Button } from '@/components/ui/button'
import { IconEdit } from '@/components/ui/icons'
import { r2Endpoint } from '@/utils/const/endpoints'
import React from 'react'
import Image from 'next/image'
import { useSupabase } from '@/lib/hooks/use-supabase'
import { resolveRelativeUrl } from '@/lib/utils'


export interface ProfileImageProps {
  user: any
  userIsCurrentUser: boolean
}

export function ProfileImage({user, userIsCurrentUser}: ProfileImageProps) {
  const { supabase } = useSupabase()

  return (
    <div className="m-auto mb-3 relative">
      <Image
        alt=""
        className="border-2 rounded-3xl drop-shadow-xl"
        src={resolveRelativeUrl( user.preview_url ?? '' )}
        height={100}
        width={100}
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

                const url = `${r2Endpoint}/${user.id}/${imageID}.${extension}`

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

                // Set the user's preview url to the new URL.
                await supabase
                  .from('accounts')
                  .update({preview_url: url})
                  .eq('id', user.id)

                location.reload()
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
