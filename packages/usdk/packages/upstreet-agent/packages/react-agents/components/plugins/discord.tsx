import { useContext, useEffect } from 'react';
import { useAgent, useAuthToken, useConversation } from 'react-agents';
import type {
  DiscordArgs,
  DiscordProps,
} from '../../types';
import {
  AppContext,
} from '../../context';

export const Discord: React.FC<DiscordProps> = (props: DiscordProps) => {
  const {
    token,
    channels,
    dms,
    userWhitelist,
    appId,
  } = props;
  const agent = useAgent();
  const conversation = useConversation();
  const appContextValue = useContext(AppContext);
  const codecs = appContextValue.useCodecs();
  const authToken = useAuthToken();

  useEffect(() => {
    if (!conversation) {
      
      if (!token) {
        throw new Error('Discord Bot token is required');
      }
      if (!appId) {
        throw new Error('Discord Bot appId is required');
      }

      const args: DiscordArgs = {
        token,
        channels: channels ? (Array.isArray(channels) ? channels : [channels]) : [],
        dms: dms ? (Array.isArray(dms) ? dms : [dms]) : [],
        userWhitelist,
        agent,
        codecs,
        jwt: authToken,
        appId,
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

  return null;
};