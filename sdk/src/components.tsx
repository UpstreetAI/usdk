import React, { useState, useMemo, useEffect, useContext, forwardRef, useImperativeHandle } from 'react';
import type { Ref } from 'react';
// import type { ZodTypeAny } from 'zod';
import type {
  // ActionMessages,
  // AppContextValue,
  // PendingActionMessage,
  // ChatMessages,
  // SubtleAiImageOpts,
  // SubtleAiCompleteOpts,
  // MemoryOpts,
  AgentProps,
  RawAgentProps,
  ActionProps,
  PromptProps,
  FormatterProps,
  ParserProps,
  PerceptionProps,
  TaskProps,
  NameProps,
  PersonalityProps,
  ServerProps,
  Conversation,
  // ExtendableMessageEvent,
  ConversationChangeEvent,
  ConversationsChangeEvent,
  MessagesUpdateEvent,
} from './types';
import {
  AppContext,
  AgentContext,
  ConversationContext,
  ConversationsContext,
  // EpochContext,
} from './context';
import {
  DefaultAgentComponents,
} from './default-components';
// import {
//   SceneObject,
// } from './classes/scene-object';
// import {
//   AgentObject,
// } from './classes/agent-object';
import {
  ActiveAgentObject,
} from './classes/active-agent-object';
// import {
//   SubtleAi,
// } from './classes/subtle-ai';
import {
  makePromise,
} from './util/util.mjs';
// import { AgentContextValue } from './classes/agent-context-value';

// Note: this comment is used to remove imports before running tsdoc
// END IMPORTS

//

const makeSymbol = () => Symbol('propsKey');

/**
 * Represents an agent component.
 *
 * The `Agent` component is used to register an agent with the application context.
 * It takes an `AgentProps` object as its props and registers the agent with the app context.
 * The `Agent` component should be used as a parent component for other components that need access to the agent.
 *
 * @param props The props for the `Agent` component.
 * @returns The rendered `Agent` component.
 *
 * @example
 * ```tsx
 * <Agent>
 *   {/* child components *\/}
 * </Agent>
 * ```
 */
export const Agent = forwardRef((props: AgentProps, ref: Ref<ActiveAgentObject>) => {
  return (
    <RawAgent ref={ref}>
      <DefaultAgentComponents />
      {props.children}
    </RawAgent>
  );
});
export const RawAgent = forwardRef((props: RawAgentProps, ref: Ref<ActiveAgentObject>) => {
  // hooks
  const appContextValue = useContext(AppContext);
  const agentJson = appContextValue.useAgentJson() as any;
  const wallets = appContextValue.useWallets();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesEpoch, setMessagesEpoch] = useState(0);

  // state
  const symbol = useMemo(makeSymbol, []);
  const renderCallbacks = useMemo(() => [], []);
  const agent = useMemo(() => {
    const agent = new ActiveAgentObject(agentJson, {
      appContextValue,
      wallets,
    });
    // bind events
    agent.addEventListener('conversationchange', (e: ConversationChangeEvent) => {
      const p = makePromise();
      renderCallbacks.push(() => p.resolve(null));
      e.waitUntil(p);
      setConversation(() => e.data.conversation);
    });
    agent.addEventListener('conversationschange', (e: ConversationsChangeEvent) => {
      const p = makePromise();
      renderCallbacks.push(() => p.resolve(null));
      e.waitUntil(p);
      setConversations(() => e.data.conversations);
    });
    agent.addEventListener('messagesupdate', (e: MessagesUpdateEvent) => {
      const p = makePromise();
      renderCallbacks.push(() => p.resolve(null));
      e.waitUntil(p);
      setMessagesEpoch((prev) => prev + 1);
    });
    return agent;
  }, []);

  // registry
  useEffect(() => {
    return () => {
      appContextValue.unregisterAgent(symbol);
    };
  }, [appContextValue]);
  appContextValue.registerAgent(symbol, agent);

  // ref
  useImperativeHandle(ref, () => agent, [agent]);

  // render callbacks
  useEffect(() => {
    for (const cb of renderCallbacks) {
      cb();
    }
    renderCallbacks.length = 0;
  });

  // return
  return (
    <AgentContext.Provider value={agent}>
      <ConversationContext.Provider value={conversation}>
        <ConversationsContext.Provider value={conversations}>
          {props.children}
        </ConversationsContext.Provider>
      </ConversationContext.Provider>
    </AgentContext.Provider>
  );
});
export const Action: React.FC<ActionProps> = (props: ActionProps) => {
  const symbol = useMemo(makeSymbol, []);
  const agentContext = useContext(AgentContext);

  useEffect(() => {
    return () => {
      agentContext.unregisterAction(symbol);
    };
  }, []);

  agentContext.registerAction(symbol, props);

  return null;
};
export const Prompt: React.FC<PromptProps> = (props: PromptProps) => {
  const symbol = useMemo(makeSymbol, []);
  const agentContext = useContext(AgentContext);

  useEffect(() => {
    return () => {
      agentContext.unregisterPrompt(symbol);
    };
  }, []);
  agentContext.registerPrompt(symbol, props);

  // return React.createElement(React.Fragment, {}, props.children);
  return props.children;
};
export const Formatter: React.FC<FormatterProps> = (props: FormatterProps) => {
  const symbol = useMemo(makeSymbol, []);
  const agentContext = useContext(AgentContext);

  useEffect(() => {
    return () => {
      agentContext.unregisterFormatter(symbol);
    };
  }, []);
  agentContext.registerFormatter(symbol, props);

  return null;
};
export const Parser: React.FC<ParserProps> = (props: ParserProps) => {
  const symbol = useMemo(makeSymbol, []);
  const agentContext = useContext(AgentContext);

  useEffect(() => {
    return () => {
      agentContext.unregisterParser(symbol);
    };
  }, []);
  agentContext.registerParser(symbol, props);

  return null;
};
export const Perception: React.FC<PerceptionProps> = (props: PerceptionProps) => {
  const symbol = useMemo(makeSymbol, []);
  const agentContext = useContext(AgentContext);

  useEffect(() => {
    return () => {
      agentContext.unregisterPerception(symbol);
    };
  }, []);
  agentContext.registerPerception(symbol, props);

  return null;
};
export const Task: React.FC<TaskProps> = (props: TaskProps) => {
  const symbol = useMemo(makeSymbol, []);
  const agentContext = useContext(AgentContext);

  useEffect(() => {
    return () => {
      agentContext.unregisterTask(symbol);
    };
  }, []);
  agentContext.registerTask(symbol, props);

  return null;
};

//

export const Name: React.FC<NameProps> = (props: NameProps) => {
  const symbol = useMemo(makeSymbol, []);
  const agentContext = useContext(AgentContext);

  useEffect(() => {
    return () => {
      agentContext.unregisterName(symbol);
    };
  }, []);
  agentContext.registerName(symbol, props);

  return null;
};
export const Personality: React.FC<PersonalityProps> = (props: PersonalityProps) => {
  const symbol = useMemo(makeSymbol, []);
  const agentContext = useContext(AgentContext);

  useEffect(() => {
    return () => {
      agentContext.unregisterPersonality(symbol);
    };
  }, []);
  agentContext.registerPersonality(symbol, props);

  return null;
};

//

export const Server: React.FC<ServerProps> = (props: ServerProps) => {
  const symbol = useMemo(makeSymbol, []);
  const agentContext = useContext(AgentContext);

  useEffect(() => {
    return () => {
      agentContext.unregisterServer(symbol);
    };
  }, []);
  agentContext.registerServer(symbol, props);

  return null;
};