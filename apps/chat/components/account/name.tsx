'use client'

import { useSupabase } from '@/lib/hooks/use-supabase'
import React from 'react'
import { EditableText } from '@/components/editable-text'


export interface NameProps {
  user: any
  userIsCurrentUser: boolean
}

export function Name({user, userIsCurrentUser}: NameProps) {
  const { supabase } = useSupabase()

  return (
    <div className="flex m-auto mb-2 text-2xl">
      {userIsCurrentUser ? (
        <EditableText
          callback={async name => {
            const {error} = await supabase
              .from( 'accounts' )
              .update({ name })
              .eq( 'id', user.id )

            if (error) {
              console.error(error)
            } else {
              location.reload()
            }
          }}
          text={user.name}
        />
      ) : user.name}
    </div>
  )
}
