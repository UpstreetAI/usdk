import React, { useState, useMemo, useEffect, useContext, forwardRef, useImperativeHandle, memo } from 'react';
import type { Ref } from 'react';
// import type { ZodTypeAny } from 'zod';
import {
  // ActionMessages,
  // AppContextValue,
  // PendingActionMessage,
  // ChatMessages,
  // SubtleAiImageOpts,
  // SubtleAiCompleteOpts,
  // MemoryOpts,
  type AgentProps,
  type RawAgentProps,
  type ActionProps,
  type PromptProps,
  type FormatterProps,
  type ParserProps,
  type PerceptionProps,
  type TaskProps,
  type NameProps,
  type PersonalityProps,
  type ServerProps,
  type ConversationObject,
  type ConversationProps,
  type ConversationInstanceProps,
  // ExtendableMessageEvent,
  type ConversationChangeEvent,
  type ConversationAddEvent,
  type ConversationRemoveEvent,
  type MessagesUpdateEvent,
  AgentRegistry,
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
} from './util/util.mjs';
import {
  GenerativeAgentObject,
} from './classes/generative-agent-object';
import {
  printZodSchema,
} from './util/util.mjs';
// import {
//   SubtleAi,
// } from './classes/subtle-ai';
import {
  RenderLoader,
  RenderLoaderProvider,
} from './classes/render-loader';
// import { AgentContextValue } from './classes/agent-context-value';

// Note: this comment is used to remove imports before running tsdoc
// END IMPORTS

//

// const makeSymbol = () => Symbol('propsKey');

/**
 * Represents an agent component.z
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
  const [conversations, setConversations] = useState<ConversationObject[]>([]);
  const agent = useMemo<ActiveAgentObject>(() => new ActiveAgentObject(agentJson, {
    appContextValue,
  }), []);
  const [agentRegistry, setAgentRegistry] = useState<AgentRegistry>(() => agent.useAgentRegistry());

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
    const onepochchange = (e: MessageEvent) => {
      setAgentRegistry((agentRegistry) => agentRegistry);
    };
    agent.addEventListener('epochchange', onepochchange);

    return () => {
      agent.removeEventListener('conversationadd', onconversationadd);
      agent.removeEventListener('conversationremove', onconversationremove);
      agent.removeEventListener('epochchange', onepochchange);
    };
  }, [agent]);

  // ref
  useImperativeHandle(ref, () => agent, [agent]);

  return (
    <agent value={agent}>
      <AgentContext.Provider value={agent}>
        <ConversationsContext.Provider value={conversations}>
          <AgentRegistryContext.Provider value={agentRegistry}>
            {/* <ConversationContext.Provider value={null}> */}
              {!raw && <DefaultAgentComponents />}
              {children}
            {/* </ConversationContext.Provider> */}
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
    agent,
    conversation,
  } = props;
  const renderLoader = useMemo(() => new RenderLoader(), []);
  const [renderPromises, setRenderPromises] = useState<any[]>([]);

  // events
  const waitForRender = () => {
    const p = makePromise();
    renderLoader.useLoad(p);
    setRenderPromises((renderPromises) => renderPromises.concat([p]));
    return renderLoader.waitForLoad();
  };
  useEffect(() => {
    const onmessagesupdate = (e: MessagesUpdateEvent) => {
      e.waitUntil((async () => {
        await waitForRender();
      })());
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
  }, [renderPromises.length]);

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
export const Action = /*memo(*/(props: ActionProps) => {
  const agent = useContext(AgentContext);
  // console.log('action use epoch', props, new Error().stack);
  agent.useEpoch([
    props.name,
    props.description,
    printZodSchema(props.schema),
    JSON.stringify(props.examples),
    props.handler.toString(),
  ]);

  return <action value={props} />;
}//);
export const Prompt = /*memo(*/(props: PromptProps) => {
  const agent = useContext(AgentContext);
  // agent.useEpoch([
  //   props.children,
  // ]);
  const conversation = useContext(ConversationContext);

  return <prompt value={{
    ...props,
    conversation,
  }} />;
}//);
export const Formatter = /*memo(*/(props: FormatterProps) => {
  const agent = useContext(AgentContext);
  // agent.useEpoch([
  //   props.formatFn.toString(),
  // ]);

  return <formatter value={props} />;
}//);
export const Parser = /*memo(*/(props: ParserProps) => {
  const agent = useContext(AgentContext);
  // agent.useEpoch([
  //   props.parseFn.toString(),
  // ]);

  return <parser value={props} />;
}//);
export const Perception = /*memo(*/(props: PerceptionProps) => {
  const agent = useContext(AgentContext);
  // agent.useEpoch([
  //   props.type,
  //   props.handler.toString(),
  // ]);

  return <perception value={props} />;
}//);
export const Task = /*memo(*/(props: TaskProps) => {
  const agent = useContext(AgentContext);
  // agent.useEpoch([
  //   props.id,
  //   props.handler.toString(),
  //   props.onDone?.toString(),
  // ]);

  return <task value={props} />;
}//);

//

export const Name = /*memo(*/(props: NameProps) => {
  const agent = useContext(AgentContext);
  // agent.useEpoch([
  //   props.children,
  // ]);

  return <name value={props} />;
}//);
export const Personality = /*memo(*/(props: PersonalityProps) => {
  const agent = useContext(AgentContext);
  // agent.useEpoch([
  //   props.children,
  // ]);

  return <personality value={props} />;
}//);

//

export const Server = /*memo(*/(props: ServerProps) => {
  const agent = useContext(AgentContext);
  // agent.useEpoch([
  //   props.children.toString(),
  // ]);

  return <server value={props} />;
}//);