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
        type="discordMessageReply"
        description={dedent`
          Use this Action to reply to a specific message ONLY within a Discord channel or direct message (DM) when you feel it is necessary to respond according to the context of the message.
          Additionally, use this Action in most cases where you are mentioned using '@' in order to respond back directly to that message.
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
            content: 'Yea, I got it.',
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