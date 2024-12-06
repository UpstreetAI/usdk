import React, { useContext, useMemo, useEffect } from 'react';
import type {
  PerceptionProps,
  PerceptionModifierProps,
} from './types';
import {
  AgentContext,
  AgentRegistryContext,
  ConversationContext,
} from '../context';

export const Perception = /*memo(*/(props: PerceptionProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(Symbol, []);
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
  const symbol = useMemo(Symbol, []);
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