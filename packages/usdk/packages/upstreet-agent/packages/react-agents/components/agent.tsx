import React, { useState, useMemo, useEffect, useContext, forwardRef, useImperativeHandle, memo } from 'react';
import type { Ref } from 'react';
import type {
  AgentProps,
  RawAgentProps,
  ConversationObject,
  ConversationEventData,
} from '../types';
import {
  AppContext,
  AgentContext,
  ConversationsContext,
  AgentRegistryContext,
} from '../context';
import {
  DefaultAgentComponents,
} from './default-components';
import {
  AgentRegistry,
} from '../classes/render-registry';
import {
  ActiveAgentObject,
} from '../classes/active-agent-object';
import { ExtendableMessageEvent } from '../util/extendable-message-event';

//

/**
 * @summary
 * Lays out the foundation of your Agent.
 *
 * @description
 * The `Agent` component serves as a high-level wrapper component that provides the core infrastructure for AI agent functionality in a React application. It acts as a container that:
 * - Establishes the communication context for AI interactions
 * - Manages the state and lifecycle of AI agent operations
 * - Provides necessary context and configuration to child components
 * - Enables action handling and event processing for nested agent functionalities
 *
 * @param AgentProps The props for the `Agent` component.
 * @returns The rendered `Agent` component.
 *
 * @example
 * 
 * The `Agent` class has represents a currently running agent. It corresponds 1:1 to an `<Agent>` tag in your code.
 * 
 * ```tsx
 * import { Agent } from 'react-agents'
 * 
 * const MyAgent = () => {
 *   return (
 *     <Agent>
 *       {/* Child components that need access to agent capabilities *\/}
 *       <YourAgentLogic />
 *     </Agent>
 *   )
 * }
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
