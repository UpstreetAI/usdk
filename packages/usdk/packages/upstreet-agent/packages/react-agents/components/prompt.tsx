import React, { useContext } from 'react';
import type {
  PromptProps,
} from '../types';
import {
  ConversationContext,
} from '../context';

/**
 * @summary
 * Define the way your Agent thinks.
 *
 * @description
 * When it's time for your agent to `.think()`, it will concatenate all of its prompts, in the order they are rendered in React, and use that prompt for inference to generate the next action. Therefore the prompts you use form the bread and butter of your agent's thought process and have a large impact on its behavior.
 *
 * @param PromptProps The props for the `Prompt` component.
 * @returns The rendered `Prompt` component.
 *
 * @example
 * 
 * Prompts can be either static (strings) or dynamic (depending on external data or memory). You can render anything you like inside of a `<Prompt>` tag, and your agent will consider it when thinking!
 * 
 * ```tsx
 * import { 
 *     Agent,
 *     Prompt // [!code ++]
 * } from 'react-agents'
 * 
 * const MyAgent = () => {
 *   return (
 *     <Agent>
 *         {/* [!code ++] *\/}
 *         <Prompt>This agent is female</Prompt>
 *         {/* [!code ++] *\/}
 *         <Prompt>They have a sarcastic personality</Prompt>
 *     </Agent>
 *   )
 * }
 * ```
 * 
 * You can have a complete, working Agent with an `agent.tsx` file using just the [`Agent`](/api/components/agent) tag and the `Prompt` tag.
 * 
 */
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