import React, { useState, useMemo, useEffect, useContext, forwardRef, useImperativeHandle, memo } from 'react';
import type { Ref } from 'react';
// import type { ZodTypeAny } from 'zod';
import type {
  AgentProps,
  RawAgentProps,
  ActionProps,
  ActionModifierProps,
  PromptProps,
  PerceptionProps,
  PerceptionModifierProps,
  FormatterProps,
  DeferProps,
  TaskProps,
  NameProps,
  PersonalityProps,
  ServerProps,
  // ConversationManager,
  ConversationObject,
  ConversationProps,
  ConversationInstanceProps,
  // MessagesUpdateEvent,
  PaymentProps,
  SubscriptionProps,
  ConversationEventData,
  UniformProps,
} from './types';
import {
  AppContext,
  AgentContext,
  ConversationContext,
  ConversationsContext,
  AgentRegistryContext,
} from './context';
import {
  DefaultAgentComponents,
} from './default-components';
import {
  AgentRegistry,
} from './classes/render-registry';
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
  makePromise,
  printZodSchema,
} from './util/util.mjs';
// import {
//   GenerativeAgentObject,
// } from './classes/generative-agent-object';
// import {
//   SubtleAi,
// } from './classes/subtle-ai';
// import {
//   RenderLoader,
//   RenderLoaderProvider,
// } from './classes/render-loader';
import { ExtendableMessageEvent } from './util/extendable-message-event';

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
export const Agent = forwardRef(({
  raw,
  children,
}: AgentProps, ref: Ref<ActiveAgentObject>) => {
  // hooks
  const appContextValue = useContext(AppContext);
  const agentJson = appContextValue.useAgentJson() as any;
  const conversationManger = appContextValue.useConversationManager();
  const [conversations, setConversations] = useState<ConversationObject[]>([]);
  const agentRegistry = useMemo(() => new AgentRegistry(), []);
  const agent = useMemo<ActiveAgentObject>(() => new ActiveAgentObject(agentJson, {
    appContextValue,
    registry: agentRegistry,
  }), []);
  const [registryEpoch, setRegistryEpoch] = useState(0);

  // cleanup binding
  useEffect(() => {
    agent.live();

    return () => {
      agent.destroy();
    };
  }, [agent]);

  useEffect(() => {
    const updateConversations = (e: ExtendableMessageEvent<ConversationEventData>) => {
      setConversations(() => conversationManger.getConversations());

      // wait for re-render before returning from the handler
      e.waitUntil((async () => {
        const renderRegistry = agent.appContextValue.useRegistry();
        await renderRegistry.waitForUpdate();
      })());
    };
    conversationManger.addEventListener('conversationadd', updateConversations);
    conversationManger.addEventListener('conversationremove', updateConversations);
    return () => {
      conversationManger.removeEventListener('conversationadd', updateConversations);
      conversationManger.removeEventListener('conversationremove', updateConversations);
    };
  }, [conversationManger]);

  // epoch (for re-rendering)
  useEffect(() => {
    const onepochchange = (e: MessageEvent) => {
      setRegistryEpoch((registryEpoch) => registryEpoch + 1);
    };
    agent.addEventListener('epochchange', onepochchange);

    return () => {
      agent.removeEventListener('epochchange', onepochchange);
    };
  }, [agent]);

  // ref
  useImperativeHandle(ref, () => agent, [agent]);

  return (
    <agent value={agent}>
      <AgentContext.Provider value={agent}>
        <ConversationsContext.Provider value={{conversations}}>
          <AgentRegistryContext.Provider value={{agentRegistry}}>
            {!raw && <DefaultAgentComponents />}
            {children}
          </AgentRegistryContext.Provider>
        </ConversationsContext.Provider>
      </AgentContext.Provider>
    </agent>
  );
});
export const RawAgent = forwardRef((props: RawAgentProps, ref: Ref<ActiveAgentObject>) => {
  return <Agent {...props} raw ref={ref} />;
});
const ConversationInstance = (props: ConversationInstanceProps) => {
  const {
    // agent,
    conversation,
  } = props;
  // const renderLoader = useMemo(() => new RenderLoader(), []);
  // const [renderPromises, setRenderPromises] = useState<any[]>([]);

  // events
  /* const waitForRender = () => {
    const p = makePromise();
    renderLoader.useLoad(p);
    setRenderPromises((renderPromises) => renderPromises.concat([p]));
    return renderLoader.waitForLoad();
  };
  useEffect(() => {
    const onmessagesupdate = (e: MessagesUpdateEvent) => {
      e.waitUntil(waitForRender());
    };
    agent.addEventListener('messagesupdate', onmessagesupdate);

    return () => {
      agent.removeEventListener('messagesupdate', onmessagesupdate);
    };
  }, [agent]);
  useEffect(() => {
    if (renderPromises.length > 0) {
      for (const renderPromise of renderPromises) {
        renderPromise.resolve(null);
      }
      setRenderPromises([]);
    }
  }, [renderPromises.length]); */

  return (
    <ConversationContext.Provider value={{conversation}}>
      {/* <RenderLoaderProvider renderLoader={renderLoader}> */}
        {props.children}
      {/* </RenderLoaderProvider> */}
    </ConversationContext.Provider>
  );
};
// XXX rename this to ConversationProvider (?)
export const Conversation = (props: ConversationProps) => {
  const agent = useContext(AgentContext);
  const conversations = useContext(ConversationsContext).conversations;
  return conversations.map((conversation) => {
    return (
      <ConversationInstance
        agent={agent}
        conversation={conversation}
        key={conversation.getKey()}
      >
        {props.children}
      </ConversationInstance>
    );
  });
};
// use this to defer rendering until the conversation is actually used
export const DeferConversation = (props: DeferProps) => {
  const appContextValue = useContext(AppContext);
  const conversationManager = appContextValue.useConversationManager();
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const conversation = useContext(ConversationContext).conversation;
  if (!conversation) {
    throw new Error('DeferConversation can only be used within a conversation');
  }
  const symbol = useMemo(makeSymbol, []);
  const deferRender = conversationManager.useDeferRender(conversation);

  useEffect(() => {
    const props2 = {
      ...props,
      conversation,
    };
    agentRegistry.registerDefer(symbol, props2);
    return () => {
      agentRegistry.unregisterDefer(symbol);
    };
  }, []);

  return deferRender && props.children;
};
export const Uniform = (props: UniformProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);
  const conversation = useContext(ConversationContext).conversation;

  const deps = [
    props.name,
    props.description,
    printZodSchema(props.schema),
    JSON.stringify(props.examples),
    props.handler?.toString() ?? '',
    conversation,
  ];

  useEffect(() => {
    const props2 = {
      ...props,
      conversation,
    };
    agentRegistry.registerUniform(symbol, props2);
    return () => {
      agentRegistry.unregisterUniform(symbol);
    };
  }, deps);

  agent.useEpoch(deps);

  return null;
};
export const Action = /*memo(*/(props: ActionProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);
  const conversation = useContext(ConversationContext).conversation;

  const deps = [
    props.name,
    props.description,
    printZodSchema(props.schema),
    JSON.stringify(props.examples),
    props.handler?.toString() ?? '',
    conversation,
  ];

  useEffect(() => {
    const props2 = {
      ...props,
      conversation,
    };
    agentRegistry.registerAction(symbol, props2);
    return () => {
      agentRegistry.unregisterAction(symbol);
    };
  }, deps);

  // console.log('action use epoch', props, new Error().stack);
  agent.useEpoch(deps);

  // return <action value={props} />;
  return null;
}//);
export const ActionModifier = /*memo(*/(props: ActionModifierProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);
  const conversation = useContext(ConversationContext).conversation;

  const deps = [
    props.name,
    props.handler.toString(),
    props.priority ?? null,
  ];

  useEffect(() => {
    const props2 = {
      ...props,
      conversation,
    };
    agentRegistry.registerActionModifier(symbol, props2);
    return () => {
      agentRegistry.unregisterActionModifier(symbol);
    };
  }, deps);

  // console.log('action use epoch', props, new Error().stack);
  agent.useEpoch(deps);

  // return <action value={props} />;
  return null;
}//);
export const Prompt = /*memo(*/(props: PromptProps) => {
  // const agent = useContext(AgentContext);
  const conversation = useContext(ConversationContext).conversation;

  // const deps = [
  //   props.children,
  // ];
  // agent.useEpoch(deps);

  return <prompt value={{
    ...props,
    conversation,
  }} />;
}//);
export const Formatter = /*memo(*/(props: FormatterProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);

  const deps = [
    props.schemaFn.toString(),
    props.formatFn.toString(),
  ];

  useEffect(() => {
    agentRegistry.registerFormatter(symbol, props);
    return () => {
      agentRegistry.unregisterFormatter(symbol);
    };
  }, deps);

  agent.useEpoch(deps);

  // return <formatter value={props} />;
  return null;
}//);
export const Perception = /*memo(*/(props: PerceptionProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);
  const conversation = useContext(ConversationContext).conversation;

  const deps = [
    props.type,
    props.handler.toString(),
  ];

  useEffect(() => {
    const props2 = {
      ...props,
      conversation,
    };
    agentRegistry.registerPerception(symbol, props2);
    return () => {
      agentRegistry.unregisterPerception(symbol);
    };
  }, deps);

  agent.useEpoch(deps);

  // return <perception value={props} />;
  return null;
}//);
export const PerceptionModifier = /*memo(*/(props: PerceptionModifierProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);
  const conversation = useContext(ConversationContext).conversation;

  const deps = [
    props.type,
    props.handler.toString(),
    props.priority ?? null,
  ];

  useEffect(() => {
    const props2 = {
      ...props,
      conversation,
    };
    agentRegistry.registerPerceptionModifier(symbol, props2);
    return () => {
      agentRegistry.unregisterPerceptionModifier(symbol);
    };
  }, deps);

  // console.log('action use epoch', props, new Error().stack);
  agent.useEpoch(deps);

  // return <action value={props} />;
  return null;
}//);
export const Task = /*memo(*/(props: TaskProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);

  const deps = [
    props.handler.toString(),
    props.onDone?.toString(),
  ];

  useEffect(() => {
    agentRegistry.registerTask(symbol, props);
    return () => {
      agentRegistry.unregisterTask(symbol);
    };
  }, deps);

  agent.useEpoch(deps);

  // return <task value={props} />;
  return null;
}//);

//

export const Name = /*memo(*/(props: NameProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);

  const deps = [
    props.children,
  ];

  useEffect(() => {
    agentRegistry.registerName(symbol, props);
    return () => {
      agentRegistry.unregisterName(symbol);
    };
  }, deps);

  agent.useEpoch(deps);

  // return <name value={props} />;
  return null;
}//);
export const Personality = /*memo(*/(props: PersonalityProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);

  const deps = [
    props.children,
  ];

  useEffect(() => {
    agentRegistry.registerPersonality(symbol, props);
    return () => {
      agentRegistry.unregisterPersonality(symbol);
    };
  }, deps);

  agent.useEpoch(deps);

  // return <personality value={props} />;
  return null;
}//);

//

export const Payment = (props: PaymentProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);

  const deps = [
    props.amount,
    props.currency,
    props.name,
    props.description,
    props.previewUrl,
  ];

  useEffect(() => {
    agentRegistry.registerPayment(symbol, props);
    return () => {
      agentRegistry.unregisterPayment(symbol);
    };
  }, deps);

  agent.useEpoch(deps);

  return null;
};
export const Subscription = (props: SubscriptionProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);

  const deps = [
    props.amount,
    props.currency,
    props.name,
    props.description,
    props.previewUrl,
  ];

  useEffect(() => {
    agentRegistry.registerSubscription(symbol, props);
    return () => {
      agentRegistry.unregisterSubscription(symbol);
    };
  }, deps);

  agent.useEpoch(deps);

  return null;
};

//

export const Server = /*memo(*/(props: ServerProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(makeSymbol, []);

  const deps = [
    props.children.toString(),
  ];

  useEffect(() => {
    agentRegistry.registerServer(symbol, props);
    return () => {
      agentRegistry.unregisterServer(symbol);
    };
  }, deps);

  agent.useEpoch(deps);

  // return <server value={props} />;
  return null;
}//);