import { useState, useMemo, useContext, useEffect, use } from 'react';
import memoizeOne from 'memoize-one';
import {
  SceneObject,
  AgentObject,
  ActiveAgentObject,
  ActionProps,
  FormatterProps,
  NameProps,
  PersonalityProps,
  ActionMessages,
  ActionMessage,
  ActionHistoryQuery,
  ChatArgs,
  KvArgs,
  TtsArgs,
  Tts,
} from './types';
import {
  AppContext,
  AgentContext,
  AgentRegistryContext,
  ConversationsContext,
  ConversationContext,
} from './context';
import { zbencode, zbdecode } from './lib/zjs/encoding.mjs';
import {
  // ConversationObject,
  CACHED_MESSAGES_LIMIT,
} from './classes/conversation-object';
import {
  loadMessagesFromDatabase,
} from './util/loadMessagesFromDatabase';
import {
  abortError,
  makePromise,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from './util/util.mjs';
import {
  aiHost,
} from './util/endpoints.mjs';

//

export const useAuthToken: () => string = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useAuthToken();
};

//

export const useAgent = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue;
};
export const useConversations = () => {
  const conversationsContext = useContext(ConversationsContext);
  return conversationsContext.conversations;
};
export const useConversation = () => {
  const conversationContextValue = useContext(ConversationContext);
  return conversationContextValue.conversation;
};
/* export const useScene: () => SceneObject = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useScene();
};
export const useAgents: () => Array<AgentObject> = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useAgents();
}; */

export const useActions: () => Array<ActionProps> = () => {
  const agentRegistryValue = useContext(AgentRegistryContext).agentRegistry;
  return agentRegistryValue.actions;
};
export const useFormatters: () => Array<FormatterProps> = () => {
  const agentRegistryValue = useContext(AgentRegistryContext).agentRegistry;
  return agentRegistryValue.formatters;
};

export const useName: () => string = () => {
  const agent = useContext(AgentContext);
  const agentRegistryValue = useContext(AgentRegistryContext).agentRegistry;
  const names = agentRegistryValue.names;
  return names.length > 0 ? names[0].children : agent.name;
};
export const usePersonality: () => string = () => {
  const agent = useContext(AgentContext);
  const agentRegistryValue = useContext(AgentRegistryContext).agentRegistry;
  const personalities = agentRegistryValue.personalities;
  return personalities.length > 0 ? personalities[0].children : agent.bio;
};

export const useCachedMessages = (opts?: ActionHistoryQuery) => {
  const agent = useAgent();
  const supabase = agent.useSupabase();
  const conversation = useConversation();

  if (!conversation.messageCache.loadPromise) {
    conversation.messageCache.loadPromise = (async () => {
      const messages = await loadMessagesFromDatabase({
        supabase,
        conversationId: conversation.getKey(),
        agentId: agent.id,
        limit: CACHED_MESSAGES_LIMIT,
      });
      conversation.messageCache.prependMessages(messages);
      conversation.messageCache.loaded = true;
    })();
  }
  use(conversation.messageCache.loadPromise);
  const messages = conversation.getCachedMessages(opts?.filter);
  return messages;
};
export const useMessageFetch = (opts?: ActionHistoryQuery) => {
  const agent = useAgent();
  const supabase = agent.useSupabase();
  const conversation = useConversation();
  const optsString = JSON.stringify(opts);
  const messagesPromise = useMemo<any>(makePromise, [conversation, optsString]);
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    (async () => {
      try {
        const messages = await conversation.fetchMessages(opts?.filter, {
          supabase,
          signal,
        });
        messagesPromise.resolve(messages);
      } catch (err) {
        if (err === abortError) {
          // nothing
        } else {
          messagesPromise.reject(err);
        }
      }
    })();

    return () => {
      abortController.abort(abortError);
    };
  }, [conversation, optsString]);
  use(messagesPromise);
  return messagesPromise;
};

export const useStripe: () => any = () => {
  const appContextValue = useContext(AppContext);
  const agentJson = appContextValue.useAgentJson();
  const stripeConnectAccountId = (agentJson as any).stripeConnectAccountId as string;

  return {
    checkout: {
      sessions: {
        create: async (args: object) => {
          if (stripeConnectAccountId) {
            const jwt = appContextValue.useAuthToken();
            const res = await fetch(`${aiHost}/stripe/checkout/session`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
              body: JSON.stringify({
                args,
                stripe_connect_account_id: stripeConnectAccountId,
              }),
            });
            const j = await res.json();
            return j;
          } else {
            throw new Error('agent is not connected to stripe');
          }
        },
      }
    },
  };
};

export const useKv = (opts?: KvArgs) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useKv(opts);
};

export const useTts: (opts?: TtsArgs) => Tts = (opts) => {
  return memoizeOne((voiceEndpoint?: string, sampleRate?: number) => {
    const appContextValue = useContext(AppContext);
    return appContextValue.useTts(opts);
  })(opts?.voiceEndpoint, opts?.sampleRate);
};
