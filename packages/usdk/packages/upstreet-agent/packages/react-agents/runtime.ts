// import React from 'react';
import { ReactNode } from 'react';
import { z } from 'zod';
import type { ZodTypeAny } from 'zod';
import { printNode, zodToTs } from 'zod-to-ts';
import dedent from 'dedent';
import {
  ChatMessages,
  PendingActionMessage,
  ActiveAgentObject,
  GenerativeAgentObject,
  ActionMessage,
  ActionProps,
  ActionMessageEvent,
  ActionMessageEventData,
  ConversationObject,
  MessagesUpdateEventData,
  TaskEventData,
  AgentThinkOptions,
} from './types';
import {
  PendingActionEvent,
} from './classes/pending-action-event';
import {
  AbortableActionEvent,
} from './classes/abortable-action-event';
import {
  retry,
} from './util/util.mjs';
import {
  parseCodeBlock,
} from './util/util.mjs';
import {
  PerceptionEvent,
} from './classes/perception-event';
import {
  AbortablePerceptionEvent,
} from './classes/abortable-perception-event';
import {
  ExtendableMessageEvent,
} from './util/extendable-message-event';
import {
  saveMessageToDatabase,
} from './util/saveMessageToDatabase.js';

//

type ServerHandler = {
  fetch(request: Request, env: object): Response | Promise<Response>;
};

//

const getPrompts = (generativeAgent: GenerativeAgentObject) => {
  const {
    agent,
    conversation: agentConversation,
  } = generativeAgent;
  const prompts = agent.registry.prompts
    .filter((prompt) => {
      const {
        conversation: promptConversation,
        children,
      } = prompt as {
        conversation: ConversationObject | null,
        children?: ReactNode,
      };
      return (
        (
          (typeof children === 'string' && children.length > 0) ||
          (Array.isArray(children) && children.filter((child) => typeof child === 'string' && child.length > 0).length > 0)
        ) &&
        (!promptConversation || promptConversation === agentConversation)
      );
    })
    .map((prompt) => {
      return Array.isArray(prompt.children) ? prompt.children.join('\n') : (prompt.children as string);
    });
  // console.log('got prompts', prompts);
  return prompts;
};

export async function generateAgentAction(
  generativeAgent: GenerativeAgentObject,
  hint?: string,
  thinkOpts?: AgentThinkOptions,
) {
  const prompts = getPrompts(generativeAgent);
  if (hint) {
    prompts.push(hint);
  }
  // console.log('prompts', prompts, new Error().stack);
  const promptString = prompts.join('\n\n');
  const promptMessages = [
    {
      role: 'user',
      content: promptString,
    },
  ];
  return await _generateAgentActionFromMessages(generativeAgent, promptMessages, thinkOpts);
}
async function _generateAgentActionFromMessages(
  generativeAgent: GenerativeAgentObject,
  promptMessages: ChatMessages,
  thinkOpts?: AgentThinkOptions,
) {
  const { agent, conversation } = generativeAgent;
  const {
    formatters,
    actions,
  } = agent.registry;
  const formatter = formatters[0];
  const actionsSchema = formatter.schemaFn(actions, conversation, thinkOpts);
  const actionsSchemaResult = z.object({
    result: actionsSchema,
  });

  // validation
  if (!formatter) {
    throw new Error('no formatter found');
  }

  const completionMessage = await generativeAgent.completeJson(promptMessages, actionsSchemaResult);
  if (completionMessage !== null) {
    let newMessage: PendingActionMessage = null;
    newMessage = (completionMessage.content as any).result as PendingActionMessage;

    const { method } = newMessage;
    const actionHandlers = actions.filter((action) => action.name === method);
    if (actionHandlers.length > 0) {
      const actionHandler = actionHandlers[0];
      if (actionHandler.schema) {
        try {
          const actionSchema = z.object({
            method: z.string(),
            args: actionHandler.schema,
          });
          const parsedMessage = actionSchema.parse(newMessage);
        } catch (err) {
          console.warn('zod schema action parse error: ' + JSON.stringify(newMessage) + '\n' + JSON.stringify(err.issues));
        }
      }
      // console.warn('generated new message', {
      //   prompt: promptMessages[0].content,
      //   newMessage,
      // });
      return newMessage;
    } else {
      throw new Error('no action handler found for method: ' + method);
    }
  } else {
    return null;
  }
}

export async function generateJsonMatchingSchema(hint: string, schema: ZodTypeAny) {
  const numRetries = 5;
  return await retry(async () => {
    const prompts = [
      dedent`
        Respond with the following:
      ` + '\n' + hint,
      dedent`
        Output the result as valid JSON matching the following schema:
      ` + '\n' + printNode(zodToTs(schema).node) + '\n' + dedent`
        Wrap your response in a code block e.g.
        \`\`\`json
        "...response goes here..."
        \`\`\`
      `,
    ];
    const promptString = prompts.join('\n\n');
    const promptMessages = [
      {
        role: 'user',
        content: promptString,
      },
    ];
    const completionMessage = await (async () => {
      const message = await this.appContextValue.complete(promptMessages);
      return message;
    })();
    // extract the json string
    const s = parseCodeBlock(completionMessage.content);
    // parse the json
    const rawJson = JSON.parse(s);
    // check that the json matches the schema
    const parsedJson = schema.parse(rawJson);
    return parsedJson;
  }, numRetries);
}
export async function generateString(hint: string) {
  const numRetries = 5;
  return await retry(async () => {
    const prompts = [
      dedent`
        Respond with the following:
      ` + '\n' + hint,
    ];
    const promptString = prompts.join('\n\n');
    const promptMessages = [
      {
        role: 'user',
        content: promptString,
      },
    ];
    const completionMessage = await (async () => {
      const message = await this.appContextValue.complete(promptMessages);
      return message;
    })();
    return completionMessage.content;
  }, numRetries);
}

interface PriorityModifier {
  priority?: number;
  handler: ((e: any) => Promise<void>) | ((e: any) => void);
}
export const collectPriorityModifiers = <T extends PriorityModifier>(modifiers: T[]) => {
  const result = new Map<number, T[]>();
  for (const modifier of modifiers) {
    const priority = modifier.priority ?? 0;
    let modifiers = result.get(priority);
    if (!modifiers) {
      modifiers = [];
      result.set(priority, modifiers);
    }
    modifiers.push(modifier);
  }
  return Array.from(result.entries())
    .sort((aEntry, bEntry) => aEntry[0] - bEntry[0])
    .map((entry) => entry[1]);
};

export async function executeAgentAction(
  generativeAgent: GenerativeAgentObject,
  message: PendingActionMessage,
) {
  const {
    agent,
    conversation,
  } = generativeAgent;
  const {
    actions,
    actionModifiers,
  } = agent.registry;

  // collect action modifiers
  const actionModifiersPerPriority = collectPriorityModifiers(actionModifiers)
    .map((actionModifiers) =>
      actionModifiers.filter((actionModifier) =>
        !actionModifier.conversation || actionModifier.conversation === conversation
      )
    )
    .filter((actionModifiers) => actionModifiers.length > 0);
  // for each priority, run the action modifiers, checking for abort at each step
  let aborted = false;
  for (const actionModifiers of actionModifiersPerPriority) {
    const abortableEventPromises = actionModifiers.filter(actionModifier => {
      return actionModifier.name === message.method;
    }).map(async (actionModifier) => {
      const e = new AbortableActionEvent({
        agent: generativeAgent,
        message,
      });
      await actionModifier.handler(e);
      return e;
    });
    const messageEvents = await Promise.all(abortableEventPromises);
    aborted = aborted || messageEvents.some((messageEvent) => messageEvent.abortController.signal.aborted);
    if (aborted) {
      break;
    }
  }

  if (!aborted) {
    const actionPromises: Promise<void>[] = [];
    for (const action of actions) {
      if (
        action.name === message.method &&
        (!action.conversation || action.conversation === conversation)
      ) {
        const e = new PendingActionEvent({
          agent: generativeAgent,
          message,
        });
        const handler =
          (action.handler as (e: PendingActionEvent) => Promise<void>) ??
          (async (e: PendingActionEvent) => {
            await e.commit();
          });
        const p = handler(e);
        actionPromises.push(p);
      }
    }
    await Promise.all(actionPromises);
  }
}

// run all perception modifiers and perceptions for a given event
// the modifiers have a chance to abort the perception
const handleChatPerception = async (data: ActionMessageEventData, {
  agent,
  conversation,
}: {
  agent: ActiveAgentObject;
  conversation: ConversationObject;
}) => {
  const {
    agent: sourceAgent,
    message,
  } = data;

  const {
    perceptions,
    perceptionModifiers,
  } = agent.registry;

  // collect perception modifiers
  const perceptionModifiersPerPriority = collectPriorityModifiers(perceptionModifiers);
  // for each priority, run the perception modifiers, checking for abort at each step
  let aborted = false;
  for (const perceptionModifiers of perceptionModifiersPerPriority) {
    const abortableEventPromises = perceptionModifiers.filter(perceptionModifier => {
      return perceptionModifier.type === message.method;
    }).map(async (perceptionModifier) => {
      const targetAgent = agent.generative({
        conversation,
      });
      const e = new AbortablePerceptionEvent({
        targetAgent,
        sourceAgent,
        message,
      });
      await perceptionModifier.handler(e);
      return e;
    });
    const messageEvents = await Promise.all(abortableEventPromises);
    aborted = aborted || messageEvents.some((messageEvent) => messageEvent.abortController.signal.aborted);
    if (aborted) {
      break;
    }
  }

  // if no aborts, run the perceptions
  if (!aborted) {
    const perceptionPromises = [];
    for (const perception of perceptions) {
      if (perception.type === message.method) {
        const targetAgent = agent.generative({
          conversation,
        });
        const e = new PerceptionEvent({
          targetAgent,
          sourceAgent,
          message,
        });
        const p = perception.handler(e);
        perceptionPromises.push(p);
      }
    }
    await Promise.all(perceptionPromises);
  }
  return {
    aborted,
  };
};
export const bindAgentConversation = ({
  agent,
  conversation,
}: {
  agent: ActiveAgentObject;
  conversation: ConversationObject;
}) => {
  conversation.addEventListener('localmessage', (e: ActionMessageEvent) => {
    const { message } = e.data;
    e.waitUntil((async () => {
      // XXX move debouncing elsewhere
      // await this.incomingMessageDebouncer.waitForTurn(async () => {
        try {
          // wait for re-render, since we just changed the message cache
          // XXX can this be handled in the message cache?
          const { hidden } = message;
          if (!hidden) {
            const e = new ExtendableMessageEvent<MessagesUpdateEventData>('messagesupdate');
            agent.dispatchEvent(e);
            await e.waitForFinish();
          }

          // handle the perception
          const {
            aborted,
          } = await handleChatPerception(e.data, {
            agent,
            conversation,
          });
          if (!aborted) {
            if (!hidden) {
              // save the perception to the databaase
              (async () => {
                const supabase = agent.useSupabase();
                const jwt = agent.useAuthToken();
                await saveMessageToDatabase({
                  supabase,
                  jwt,
                  userId: agent.id,
                  conversationId: conversation.getKey(),
                  message,
                });
              })();
            }
          }
        } catch (err) {
          console.warn('caught new message error', err);
        }
      // });
    })());
  });
  conversation.addEventListener('remotemessage', async (e: ExtendableMessageEvent<ActionMessageEventData>) => {
    const { message } = e.data;
    e.waitUntil((async () => {
      // save to database
      (async () => {
        const supabase = agent.useSupabase();
        const jwt = agent.useAuthToken();
        await saveMessageToDatabase({
          supabase,
          jwt,
          userId: agent.id,
          conversationId: conversation.getKey(),
          message,
        });
      })();

      // wait for re-render before returning from the handler
      // this must be happening since we just triggered the message cache to update
      const renderRegistry = agent.appContextValue.useRegistry();
      await new Promise((resolve) => {
        renderRegistry.addEventListener('update', () => {
          resolve(null);
        }, {
          once: true,
        });
      });
    })());
  });
};

// XXX can move this to the agent renderer
export const compileUserAgentServer = async ({
  agent,
}: {
  agent: ActiveAgentObject;
}) => {
  const servers = agent.registry.servers
    .map((serverProps) => {
      const childFn = serverProps.children as () => ServerHandler;
      if (typeof childFn === 'function') {
        const server = childFn();
        return server;
      } else {
        console.warn('server child is not a function', childFn);
        return null;
      }
    })
    .filter((server) => server !== null) as Array<ServerHandler>;

  return {
    async fetch(request: Request, env: object) {
      for (const server of servers) {
        // console.log('try server fetch 1', server.fetch.toString());
        const res = await server.fetch(request, env);
        // console.log('try server fetch 2', res);
        if (res instanceof Response) {
          return res;
        }
      }
      console.warn('no server handler found, so returning default 404');
      return new Response(
        JSON.stringify({
          error: `Not found: agent server handler (${servers.length} routes)`,
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    },
  };
};