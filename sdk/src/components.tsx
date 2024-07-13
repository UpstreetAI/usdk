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
  ConversationObject,
  ConversationProps,
  ConversationInstanceProps,
  // ExtendableMessageEvent,
  ConversationChangeEvent,
  ConversationAddEvent,
  ConversationRemoveEvent,
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
import {
  GenerativeAgentObject,
} from './classes/generative-agent-object';
// import {
//   SubtleAi,
// } from './classes/subtle-ai';
// import {
//   makePromise,
// } from './util/util.mjs';
import {
  RenderLoader,
  RenderLoaderProvider,
} from './classes/render-loader';
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
  const [conversations, setConversations] = useState<ConversationObject[]>([]);

  // state
  // const symbol = useMemo(makeSymbol, []);
  const agent = useMemo(() => {
    const agent = new ActiveAgentObject(agentJson, {
      appContextValue,
    });
    return agent;
  }, []);

  // events
  useEffect(() => {
    const onconversationadd = (e: ConversationAddEvent) => {
      setConversations((conversations) => conversations.concat([e.data.conversation]));
    };
    agent.addEventListener('conversationadd', onconversationadd);
    const onconversationremove = (e: ConversationRemoveEvent) => {
      setConversations((conversations) => conversations.filter((c) => c !== e.data.conversation));
    };
    agent.addEventListener('conversationremove', onconversationremove);

    return () => {
      agent.removeEventListener('conversationadd', onconversationadd);
      agent.removeEventListener('conversationremove', onconversationremove);
    };
  }, [agent]);

  // ref
  useImperativeHandle(ref, () => agent, [agent]);

  // return
  return (
    <agent value={agent}>
      <AgentContext.Provider value={agent}>
        <ConversationsContext.Provider value={conversations}>
         <ConversationContext.Provider value={null}>
            {props.children}
          </ConversationContext.Provider>
        </ConversationsContext.Provider>
      </AgentContext.Provider>
    </agent>
  );
});
const ConversationInstance = (props: ConversationInstanceProps) => {
  const {
    agent,
    conversation,
  } = props;
  const renderLoader = useMemo(() => new RenderLoader(), []);
  const [messagesEpoch, setMessagesEpoch] = useState<number>(0);

  // events
  useEffect(() => {
    const onmessagesupdate = (e: MessagesUpdateEvent) => {
      e.waitUntil(renderLoader.waitForLoad());
      setMessagesEpoch((prev) => prev + 1);
    };
    agent.addEventListener('messagesupdate', onmessagesupdate);

    return () => {
      agent.removeEventListener('messagesupdate', onmessagesupdate);
    };
  }, [agent]);

  return (
    <ConversationContext.Provider value={conversation}>
      <RenderLoaderProvider renderLoader={renderLoader}>
        {props.children}
      </RenderLoaderProvider>
    </ConversationContext.Provider>
  );
};
export const Conversation = (props: ConversationProps) => {
  const agent = useContext(AgentContext);
  const conversations = useContext(ConversationsContext);
  return conversations.map((conversation) => {
    return (
      <ConversationInstance
        agent={agent}
        conversation={conversation}
        key={conversation.id}
      >
        {props.children}
      </ConversationInstance>
    );
  });
};
export const Action: React.FC<ActionProps> = (props: ActionProps) => {
  // const symbol = useMemo(makeSymbol, []);
  // const agentContext = useContext(AgentContext);

  // useEffect(() => {
  //   return () => {
  //     agentContext.unregisterAction(symbol);
  //   };
  // }, []);

  // agentContext.registerAction(symbol, props);

  return <action value={props} />;
};
export const Prompt: React.FC<PromptProps> = (props: PromptProps) => {
  // const symbol = useMemo(makeSymbol, []);
  // const agentContext = useContext(AgentContext);
  const conversation = useContext(ConversationContext);

  // useEffect(() => {
  //   return () => {
  //     agentContext.unregisterPrompt(symbol);
  //   };
  // }, []);
  // agentContext.registerPrompt(symbol, props);

  // return React.createElement(React.Fragment, {}, props.children);
  // return props.children;
  return <prompt value={{
    ...props,
    conversation,
  }} />;
};
export const Formatter: React.FC<FormatterProps> = (props: FormatterProps) => {
  // const symbol = useMemo(makeSymbol, []);
  // const agentContext = useContext(AgentContext);

  // useEffect(() => {
  //   return () => {
  //     agentContext.unregisterFormatter(symbol);
  //   };
  // }, []);
  // agentContext.registerFormatter(symbol, props);

  // return null;
  return <formatter value={props} />;
};
export const Parser: React.FC<ParserProps> = (props: ParserProps) => {
  // const symbol = useMemo(makeSymbol, []);
  // const agentContext = useContext(AgentContext);

  // useEffect(() => {
  //   return () => {
  //     agentContext.unregisterParser(symbol);
  //   };
  // }, []);
  // agentContext.registerParser(symbol, props);

  // return null;
  return <parser value={props} />;
};
export const Perception: React.FC<PerceptionProps> = (props: PerceptionProps) => {
  // const symbol = useMemo(makeSymbol, []);
  // const agentContext = useContext(AgentContext);

  // useEffect(() => {
  //   return () => {
  //     agentContext.unregisterPerception(symbol);
  //   };
  // }, []);
  // agentContext.registerPerception(symbol, props);

  // return null;
  return <perception value={props} />;
};
export const Task: React.FC<TaskProps> = (props: TaskProps) => {
  // const symbol = useMemo(makeSymbol, []);
  // const agentContext = useContext(AgentContext);

  // useEffect(() => {
  //   return () => {
  //     agentContext.unregisterTask(symbol);
  //   };
  // }, []);
  // agentContext.registerTask(symbol, props);

  // return null;
  return <task value={props} />;
};

//

export const Name: React.FC<NameProps> = (props: NameProps) => {
  // const symbol = useMemo(makeSymbol, []);
  // const agentContext = useContext(AgentContext);

  // useEffect(() => {
  //   return () => {
  //     agentContext.unregisterName(symbol);
  //   };
  // }, []);
  // agentContext.registerName(symbol, props);

  // return null;
  return <name value={props} />;
};
export const Personality: React.FC<PersonalityProps> = (props: PersonalityProps) => {
  // const symbol = useMemo(makeSymbol, []);
  // const agentContext = useContext(AgentContext);

  // useEffect(() => {
  //   return () => {
  //     agentContext.unregisterPersonality(symbol);
  //   };
  // }, []);
  // agentContext.registerPersonality(symbol, props);

  // return null;
  return <personality value={props} />;
};

//

export const Server: React.FC<ServerProps> = (props: ServerProps) => {
  // const symbol = useMemo(makeSymbol, []);
  // const agentContext = useContext(AgentContext);

  // useEffect(() => {
  //   return () => {
  //     agentContext.unregisterServer(symbol);
  //   };
  // }, []);
  // agentContext.registerServer(symbol, props);

  // return null;
  return <server value={props} />;
};