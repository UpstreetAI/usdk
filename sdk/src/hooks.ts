import { useState, useMemo, useContext, useEffect, use } from 'react';
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
  TtsArgs,
  Tts,
  Chat,
} from './types';
import {
  AppContext,
  AgentContext,
  AgentRegistryContext,
  ConversationsContext,
  ConversationContext,
} from './context';
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
} from './util/util.mjs';

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
  return conversationsContext;
};
export const useConversation = () => {
  const conversationContextValue = useContext(ConversationContext);
  return conversationContextValue;
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
  const agentRegistryValue = useContext(AgentRegistryContext);
  return agentRegistryValue.actions;
};
export const useFormatters: () => Array<FormatterProps> = () => {
  const agentRegistryValue = useContext(AgentRegistryContext);
  return agentRegistryValue.formatters;
};

export const useName: () => string = () => {
  const agent = useContext(AgentContext);
  const agentRegistryValue = useContext(AgentRegistryContext);
  const names = agentRegistryValue.names;
  return names.length > 0 ? names[0].children : agent.name;
};
export const usePersonality: () => string = () => {
  const agent = useContext(AgentContext);
  const agentRegistryValue = useContext(AgentRegistryContext);
  const personalities = agentRegistryValue.personalities;
  return personalities.length > 0 ? personalities[0].children : agent.bio;
};

/* export const useActionHistory: (opts?: ActionHistoryQuery) => ActionMessages = (opts) => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useActionHistory(opts);
}; */
export const useCachedMessages = (opts?: ActionHistoryQuery) => {
  const agent = useAgent();
  const supabase = agent.useSupabase();
  const conversation = useConversation();

  if (!conversation.messageCache.loadPromise) {
    conversation.messageCache.loadPromise = (async () => {
      const messages = await loadMessagesFromDatabase({
        supabase,
        conversationId: agent.id,
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

export const useTts: (opts?: TtsArgs) => Tts = (opts) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useTts(opts);
};
export const useChat: (opts?: ChatArgs) => Chat = (opts) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useChat(opts);
};
