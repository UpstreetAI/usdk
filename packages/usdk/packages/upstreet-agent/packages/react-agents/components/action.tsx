import React, { useState, useMemo, useEffect, useContext, forwardRef, useImperativeHandle, memo } from 'react';
import type {
  ActionProps,
  ActionModifierProps,
} from '../types';
import {
  AgentContext,
  ConversationContext,
  AgentRegistryContext,
} from '../context';
import {
  printZodSchema,
} from '../util/util.mjs';

/**
 * @summary
 * Define actions your Agent can perform.
 *
 * @description
 * The `Action` component represents an action that a React AI agent can perform. It registers a new action with an agent registry, allowing the agent to trigger the action in response to certain events.
 * 
 * This component is useful for defining discrete, reusable actions with associated schemas and event handlers, making it easier to define and handle actions within an AI-driven context.
 *
 * @param ActionProps The props for the `Action` component.
 * @returns The rendered `Action` component.
 *
 * @example
 * 
 * Here is an example of how the Action component might be used:
 * 
 * ```tsx
 * import { Action } from 'react-agents';
 * import { z } from 'zod';
 *  
 * const sendMessageSchema = z.object({
 *   message: z.string(),
 *   recipientId: z.string(),
 * });
 *  
 * const handleSendMessage = async (e) => {
 *   console.log("Sending message:", e);
 *   // Code to send a message goes here
 * };
 *  
 * function MyComponent() {
 *   return (
 *     <Action
 *       name="SendMessage"
 *       description="Sends a message to a specific recipient."
 *       state="ready"
 *       schema={sendMessageSchema}
 *       examples={[
 *         { message: "Hello!", recipientId: "12345" },
 *         { message: "How are you?", recipientId: "67890" },
 *       ]}
 *       handler={handleSendMessage}
 *     />
 *   );
 * }
 * ```
 * 
 * Here's a breakdown of the example:
 * - The `name` prop is set to "SendMessage" to identify the action.
 * - The `description` provides a brief summary of the action's purpose. 
 * - The `state` is set to "ready" to indicate the current status of the action.
 * - The `schema` defines the expected input parameters, validating that `message` and `recipientId` are strings.
 * - The `examples` show sample data for the `message` and `recipientId` inputs.
 * - The `handler` is an asynchronous function that handles the SendMessage action when it is triggered.
 * - **Component Lifecycle**: When the Action component is mounted, it registers the action with the agent registry using the registerAction method, associating the action with a unique symbol. When unmounted, it unregisters the action, ensuring no memory leaks.
 * 
 */
export const Action = /*memo(*/(props: ActionProps) => {
  const agent = useContext(AgentContext);
  const agentRegistry = useContext(AgentRegistryContext).agentRegistry;
  const symbol = useMemo(Symbol, []);
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
  const symbol = useMemo(Symbol, []);
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