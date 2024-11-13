'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconArrowRight, IconCheck, IconEdit } from '@/components/ui/icons'


interface EditableTextProps {
  callback: (text: string) => void | Promise<void>
  text: string
  type?: 'text' | 'textarea'
}


export function EditableText({
  callback,
  text,
  type,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  let currentText = text

  return (
    <>
      {isEditing ? (
          type === 'textarea' ? (
            <textarea>
              {currentText}
            </textarea>
          ) : (
            <div className="flex focus-within:border-neutral-400 border-l-4 items-center">
              <span
                className="bg-neutral-700 focus:outline-none p-2"
                contentEditable
                onInput={e =>
                  currentText = e.currentTarget.textContent || ''
                }
                suppressContentEditableWarning={true}
              >
                {currentText}
              </span>
              <Button
                className="aspect-square bg-neutral-700 flex h-full items-center justify-center p-0 rounded-none"
                onClick={async () => {
                  setIsEditing(false)
                  await callback(currentText.trim())
                }}
                variant="ghost"
              >
                <IconCheck />
              </Button>
            </div>
          )
      ):(
        <>
          {text}
          <Button
            className="p-0 m-0 h-fit"
            onClick={() => setIsEditing( true )}
            variant="ghost"
          >
            <IconEdit className="ml-1"/>
          </Button>
        </>
      )}
    </>
  )
}
