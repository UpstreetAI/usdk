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
          If you want to mention a player, use the @userId format.

          You should use replyToMessageId to reference a specific previous message, usage guidelines:
          1. When you are directly tagged or mentioned in a message
          2. When you need to reference a specific previous message according to the conversation context
          3. In all other cases, send your message without a reply reference.

          Not every message needs a reply reference so you should only use it when necessary
        `}
        schema={
          z.object({
            text: z.string(),
            replyToMessageId: z.string().optional(),
          })
        }
        examples={[
          {
            text: 'Hello, there! How are you doing?',

          },
          {
            text: 'What are you talking about?',
          },
          {
            text: 'Not much, what about you?',
            replyToMessageId: '123',
          },
        ]}
        // handler={async (e: PendingActionEvent) => {
        //   await e.commit();
        // }}
      />
    </>
  );
};