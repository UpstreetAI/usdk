import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import dedent from 'dedent';
import { timeAgo } from 'react-agents/util/time-ago.mjs';

import type {
  AppContextValue,
  // AgentProps,
  ActionProps,
  ActionPropsAux,
  UniformPropsAux,
  // PromptProps,
  // ParserProps,
  // PerceptionProps,
  // SchedulerProps,
  // ServerProps,
  SceneObject,
  AgentObject,
  ActiveAgentObject,
  ConversationObject,
  PendingActionEvent,
  ActionEvent,
  ActionMessage,
  PlayableAudioStream,
  Attachment,
  FormattedAttachment,
  GenerativeAgentObject,
  DiscordRoomSpec,
  DiscordRoomSpecs,
  DiscordProps,
  DiscordArgs,
  TwitterProps,
  TwitterArgs,
  TwitterSpacesProps,
  TwitterSpacesArgs,
  TelnyxProps,
  TelnyxBotArgs,
  TelnyxBot,
  VideoPerceptionProps,
  Evaluator,
  LoopProps,
  ActOpts,
} from '../types';
import {
  useAgent,
  useAuthToken,
  useActions,
  useUniforms,
  useName,
  usePersonality,
  useStoreItems,
  usePurchases,
  useKv,
  useTts,
  useConversation,
  useCachedMessages,
  useNumMessages,
} from '../hooks';
import { Prompt } from './prompt';
import { ChatLoop } from '../loops/chat-loop.tsx';
import { ChatActions } from './chat';
import {
  formatActionsPrompt,
} from '../util/format-schema';

// defaults

/**
 * Renders the default agent components.
 * @returns The JSX elements representing the default agent components.
 */
export const DefaultAgentComponents = () => {
  return (
    <>
      <DefaultActions />
      <DefaultPrompts />
      <ChatLoop />
      {/* <InfiniteLoop /> */}
    </>
  );
};

/**
 * Renders the default actions components.
 * @returns The JSX elements representing the default actions components.
 */
export const DefaultActions = () => {
  return (
    <>
      <ChatActions />
      {/* <SocialMediaActions />
      <StoreActions /> */}
    </>
  );
};

/**
 * Renders the default prompts components.
 * @returns The JSX elements representing the default prompts components.
 */
export const DefaultPrompts = () => {
  return (
    <>
      <DefaultHeaderPrompt />
      <ConversationEnvironmentPrompt />
      <ActionsPrompt />
      <StorePrompt />
      <ConversationMessagesPrompt />
      <InstructionsPrompt />
      <DefaultCommunicationGuidelinesPrompt />
    </>
  );
};
export const DefaultHeaderPrompt = () => {
  return (
    <Prompt>
      {dedent`
        Role-play as a character in a chat given the current state.
        Respond with a JSON object specifying the action method and arguments.
      `}
    </Prompt>
  );
};
export const ConversationEnvironmentPrompt = () => {
  return (
    <>
      <ScenePrompt />
      <CharactersPrompt />
    </>
  );
};
export const ScenePrompt = () => {
  const conversation = useConversation();
  const scene = conversation.getScene();
  return (
    <Prompt>
      {scene && dedent`
        # Scene
        ${scene.description}
      `}
    </Prompt>
  );
};
export const CharactersPrompt = () => {
  const conversation = useConversation();
  const agents = conversation.getAgents();
  const name = useName();
  const bio = usePersonality();
  const currentAgentSpec = {
    name,
    // id,
    bio,
  };
  const agentSpecs = agents.map((agent) => agent.getPlayerSpec());

  const formatAgent = (agent: any) => {
    return [
      `Name: ${agent.name}`,
      `UserId: ${agent.id}`,
      `Bio: ${agent.bio}`,
    ].join('\n');
  };

  return (
    <Prompt>
      {dedent`
        # Your Character
      ` +
        '\n\n' +
        formatAgent(currentAgentSpec) +
        (agents.length > 0
          ? (
            '\n\n' +
            dedent`
              # Other Characters
            ` +
            '\n\n' +
            agentSpecs
              .map(formatAgent)
              .join('\n\n')
          )
          : ''
        )
      }
    </Prompt>
  );
};
const ActionsPromptInternal = () => {
  const actions = useActions();
  const uniforms = useUniforms();
  const conversation = useConversation();

  let s = '';
  if (actions.length > 0) {
    s = dedent`\
      # Response format
    ` +
    '\n\n' +
    formatActionsPrompt(Array.from(actions.values()), uniforms, conversation);
  }
  return (
    <Prompt>{s}</Prompt>
  );
};
export const ActionsPrompt = () => {
  return (
    <ActionsPromptInternal />
  );
};
const StoreItemsPrompt = () => {
  const agent = useAgent();
  const storeItems = useStoreItems();
  return !!agent.stripeConnectAccountId && storeItems.length > 0 && (
    <Prompt>
      {dedent`\
        # Store
        Here are the store items available for purchase.
        Amount in cents (e.g. 100 = $1).
        \`\`\`
      ` + '\n' +
      JSON.stringify(storeItems, null, 2) + '\n' +
      dedent`\
        \`\`\`
      `}
    </Prompt>
  );
};
const PurchasesPrompt = () => {
  const conversation = useConversation();
  const purchases = usePurchases();

  const conversationUserIds = Array.from(conversation.agentsMap.keys());
  const userPurchases = purchases.filter(purchase => {
    return conversationUserIds.includes(purchase.buyerUserId);
  });

  return (
    <Prompt>
      {purchases.length > 0 && dedent`\
        # Purchases
        Here are the purchases made so far:
        \`\`\`
      ` + '\n' +
      JSON.stringify(userPurchases, null, 2) + '\n' +
      dedent`\
        \`\`\`
      `}
    </Prompt>
  )
};
export const StorePrompt = () => {
  return (
    <>
      <StoreItemsPrompt />
      <PurchasesPrompt />
    </>
  );
};
export const ConversationMessagesPrompt = () => {
  return (
    <CachedMessagesPrompt />
  );
}
export const CachedMessagesPrompt = () => {
  const cachedMessages = useCachedMessages();

  const formatAttachments = (attachments?: Attachment[]) => {
    if (attachments?.length > 0) {
      return attachments.map((attachment) => formatAttachment(attachment));
    } else {
      return undefined;
    }
  };
  const formatAttachment = (attachment: Attachment): FormattedAttachment => {
    const {
      id,
      type,
      // alt,
    } = attachment;
    return {
      id,
      type,
      // alt,
    };
  };

  return (
    <Prompt>
      {dedent`
        # Message history
        ${
          cachedMessages.length > 0
            ? dedent`
              Here is the chat so far:
            ` +
              '\n' +
              '```' +
              '\n' +
              cachedMessages
                .map((action) => {
                  const { /*userId,*/ name, method, args, attachments = [], timestamp } = action;
                  const j = {
                    // userId,
                    name,
                    method,
                    args,
                    attachments: formatAttachments(attachments),
                  };
                  return JSON.stringify(j) + ' ' + timeAgo(new Date(timestamp));
                })
                .join('\n') +
              '\n' +
              dedent`
                <end of message history, continue from here>
              ` +
              '\n' +
              '```'
            : 'No messages have been sent or received yet. This is the beginning of the conversation.'
        }
      `}
    </Prompt>
  );
};
export const InstructionsPrompt = () => {
  const agent = useAgent();

  return (
    <Prompt>
      {dedent`
        # Instructions
        Respond with the next action taken by your character: ${agent.name}
        The method/args of your response must match one of the allowed actions.

        Before choosing an action, decide if you should respond at all:
        - Return null (no action) if:
          * Message is clearly meant for others (unless you have crucial information)
          * Your input wouldn't add value to the conversation
          * The conversation is naturally concluding
          * You've already responded frequently in the last few messages (2-3 messages max)
          * Multiple other agents are already actively participating
      `}
    </Prompt>
  );
};
export const DefaultCommunicationGuidelinesPrompt = () => {
  return (
    <Prompt>
      {dedent`
        Prioritize responding when:
          - You're directly mentioned or addressed
          - It's a group discussion where you can contribute meaningfully
          - Your personality traits are relevant to the topic

        Communication guidelines:
          - Avoid using names in every message - only use them when:
            * Directly responding to someone for the first time
            * Clarifying who you're addressing in a group
            * There's potential confusion about who you're talking to
          - If you've been very active in the last few messages, wrap up your participation naturally
            * Use phrases like "I'll let you all discuss" or simply stop responding
            * Don't feel obligated to respond to every message
          - Keep responses concise and natural
          - Let conversations breathe - not every message needs a response
          - If multiple agents are responding to the same person, step back and let others take the lead
      `}
    </Prompt>
  );
};