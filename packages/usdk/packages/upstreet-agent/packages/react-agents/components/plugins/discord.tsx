import React from 'react';
import { useContext, useEffect } from 'react';
import { Action, ConversationProvider, useAgent, useAuthToken, useConversation } from 'react-agents';
import type {
  DiscordArgs,
  DiscordProps,
  PendingActionEvent,
} from '../../types';
import {
  AppContext,
} from '../../context';
import dedent from 'dedent';
import { z } from 'zod';

export const Discord: React.FC<DiscordProps> = (props: DiscordProps) => {
  const {
    token,
    channels,
    dms,
    userWhitelist,
  } = props;
  const agent = useAgent();
  const conversation = useConversation();
  const appContextValue = useContext(AppContext);
  const codecs = appContextValue.useCodecs();
  const authToken = useAuthToken();

  useEffect(() => {
    if (!conversation) {
      const args: DiscordArgs = {
        token,
        channels: channels ? (Array.isArray(channels) ? channels : [channels]) : [],
        dms: dms ? (Array.isArray(dms) ? dms : [dms]) : [],
        userWhitelist,
        agent,
        codecs,
        jwt: authToken,
      };
      const discordBot = agent.discordManager.addDiscordBot(args);
      return () => {
        agent.discordManager.removeDiscordBot(discordBot);
      };
    }
  }, [
    token,
    JSON.stringify(channels),
    JSON.stringify(dms),
    JSON.stringify(userWhitelist),
    conversation,
  ]);

  return (
    <>
     <ConversationProvider>
      <Action
        type="discordMessageReferenceReply"
        description={dedent`
          Use this Action:
          - STRICTLY WITHIN A DISCORD CHANNEL OR DIRECT MESSAGE (DM) SCENE, IF NO SCENE IS PROVIDED OR THE SCENE IS NOT A DISCORD CHANNEL OR DIRECT MESSAGE (DM), THE ACTION MUST NOT BE EXECUTED.
          - To refer back to a specific message in the chat history or when replying to a message where you were specifically tagged using '@<your-discord-id>'.
          
          Ensure the response is contextually relevant to the message being referenced or replied to.
        `}
        schema={
          z.object({
            messageReference: z.string(),
            content: z.string(),
          })
        }
        examples={[
          {
            messageReference: '1234567890',
            content: 'Yes, I understand your point.',
          },
        ]}
        handler={
          async (e: PendingActionEvent) => {
            const {
              message,
              agent,
            } = e.data;

            const {
              messageReference,
              content,
            } = message.args;

            const replyMessage = {
              content: content,
              reply: {
                messageReference: messageReference,
              }
            }
            await agent.say(replyMessage);
          }
        }
      />
     </ConversationProvider>
    </>
  );
};