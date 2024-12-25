import React from 'react';
import dedent from 'dedent';
import { z } from 'zod';
import { Action } from './action';

export const ChatActions = () => {
  return (
    <>
      <Action
        type="say"
        description={dedent`\
          Say something in the chat.

          If you want to mention a player, use the @username format.
        `}
        schema={
          z.object({
            text: z.string(),
          })
        }
        examples={[
          {
            text: 'Hello, there! How are you doing?',
          },
        ]}
        // handler={async (e: PendingActionEvent) => {
        //   await e.commit();
        // }}
      />
    </>
  );
};