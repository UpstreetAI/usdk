import React, { useState, useMemo, useEffect, useContext, forwardRef, useImperativeHandle, memo } from 'react';
import type {
  ActionProps,
  ActionModifierProps,
  PromptProps,
  PerceptionProps,
  PerceptionModifierProps,
  DeferProps,
  TaskProps,
  NameProps,
  PersonalityProps,
  ServerProps,
  ConversationProps,
  ConversationInstanceProps,
  PaymentProps,
  SubscriptionProps,
  UniformProps,
} from '../types';
import {
  AppContext,
  AgentContext,
  ConversationContext,
  ConversationsContext,
  AgentRegistryContext,
} from '../context';

//

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
export const Task = /*memo(*/(props: TaskProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(Symbol, []);

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
  const symbol = useMemo(Symbol, []);

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
  const symbol = useMemo(Symbol, []);

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
  const symbol = useMemo(Symbol, []);

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
  const symbol = useMemo(Symbol, []);

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
  const symbol = useMemo(Symbol, []);

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