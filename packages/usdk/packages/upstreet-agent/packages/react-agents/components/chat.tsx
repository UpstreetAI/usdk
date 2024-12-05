import React from 'react';
import dedent from 'dedent';
import { Action } from './action';

export const ChatActions = () => {
  return (
    <>
      <Action
        name="say"
        description={dedent`\
          Say something in the chat.
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