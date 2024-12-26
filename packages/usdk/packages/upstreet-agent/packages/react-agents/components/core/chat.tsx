import React from 'react';
import dedent from 'dedent';
import { z } from 'zod';
import { Action } from './action';
import { PendingActionEvent } from '../../types/react-agents';

export const ChatActions = () => {
  return (
    <>
      <Action
        type="say"
        description={dedent`\
          Say something in the chat.

          If you want to mention a player, use the @name format.
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
      <Action
        type="messageReaction"
        description="React to a message"
        schema={
          z.object({
            reaction: z.string(),
            messageId: z.string(),
            userId: z.string(),
          })
        }
        examples={[
          {
            reaction: '👍',
            messageId: '123',
            userId: '456',
          },
          {
            reaction: '👎',
            messageId: '123',
            userId: '456',
          },
        ]}
        handler={async (e: PendingActionEvent) => {
          await e.commit();
        }}
      />
    </>
  );
};