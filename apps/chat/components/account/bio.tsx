'use client'

import { useSupabase } from '@/lib/hooks/use-supabase'
import React from 'react'
import { EditableText } from '@/components/editable-text'


export interface BioProps {
  user: any
  userIsCurrentUser: boolean
}

export function Bio({user, userIsCurrentUser}: BioProps) {
  const { supabase } = useSupabase()

  return (
    <div className="flex m-auto mb-4">
      {userIsCurrentUser ? (
        <EditableText
          callback={async bio => {
            const {error} = await supabase
              .from( 'accounts' )
              .update({ playerSpec: {
                ...user.playerSpec,
                bio,
              }})
              .eq( 'id', user.id )

            if (error) {
              console.error(error)
            } else {
              location.reload()
            }
          }}
          text={user.playerSpec.bio}
        />
      ) : user.playerSpec.bio}
    </div>
  )
}
