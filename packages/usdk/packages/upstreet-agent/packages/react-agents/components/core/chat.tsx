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

          You should use replyToMessageId in two specific cases:
          1. When you are directly tagged or mentioned in a message
          2. When you need to reference a specific previous message according to the conversation context
          3. Not every message needs a reply reference so you should only use it when necessary

          In all other cases, send your message without a reply reference.
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