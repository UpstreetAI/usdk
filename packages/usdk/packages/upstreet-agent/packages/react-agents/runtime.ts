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
  ActionEvent,
} from './classes/action-event';
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
      } = prompt;
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
    })
    .map((prompt) => dedent(prompt));
  // console.log('got prompts', prompts);
  return prompts;
};

type ActionStep = {
  action?: PendingActionMessage,
  uniforms?: {
    [key: string]: object,
  },
};
export async function generateAgentActionStep(
  generativeAgent: GenerativeAgentObject,
  hint?: string,
  thinkOpts?: AgentThinkOptions,
) {
  // wait for the conversation to be loaded
  {
    const { agent, conversation } = generativeAgent;
    const { appContextValue } = agent;
    const conversationManager = appContextValue.useConversationManager();
    await conversationManager.waitForConversationLoad(conversation);
  }

  // collect the prompts
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
  // perform inference
  return await _generateAgentActionStepFromMessages(generativeAgent, promptMessages, thinkOpts);
}
async function _generateAgentActionStepFromMessages(
  generativeAgent: GenerativeAgentObject,
  promptMessages: ChatMessages,
  thinkOpts?: AgentThinkOptions,
) {
  const { agent, conversation } = generativeAgent;
  const {
    formatters,
    actions,
    uniforms,
  } = agent.registry;
  const formatter = formatters[0];
  if (!formatter) {
    throw new Error('cannot generate action: no formatter registered');
  }

  // resultSchema has { action, uniforms } schema
  const resultSchema = formatter.schemaFn(actions, uniforms, conversation, thinkOpts);

  const completionMessage = await generativeAgent.completeJson(promptMessages, resultSchema);
  if (completionMessage) {
    const result = {} as ActionStep;

    const action = (completionMessage.content as any).action as PendingActionMessage;
    if (action) {
      const { method } = action;
      const actionHandlers = actions.filter((action) => action.name === method);
      if (actionHandlers.length > 0) {
        const actionHandler = actionHandlers[0];
        if (actionHandler.schema) {
          try {
            const actionSchema = z.object({
              method: z.string(),
              args: actionHandler.schema,
            });
            const parsedMessage = actionSchema.parse(action);
            result.action = action;
          } catch (err) {
            console.warn('zod schema action parse error: ' + JSON.stringify(action) + '\n' + JSON.stringify(err.issues));
          }
        }
      } else {
        throw new Error('no action handler found for method: ' + method);
      }
    }

    const uniformObject = (completionMessage.content as any).uniforms as object;
    if (uniformObject) {
      const uniformsResult = {} as {
        [key: string]: object,
      };
      for (const method in uniformObject) {
        const args = uniformObject[method];
        const uniformHandlers = uniforms.filter((uniform) => uniform.name === method);
        if (uniformHandlers.length > 0) {
          const uniformHandler = uniformHandlers[0];
          if (uniformHandler.schema) {
            try {
              const uniformSchema = z.object({
                method: z.string(),
                args: uniformHandler.schema,
              });
              const parsedMessage = uniformSchema.parse({
                method,
                args,
              });
              uniformsResult[method] = args;
            } catch (err) {
              console.warn('zod schema uniform parse error: ' + JSON.stringify(args) + '\n' + JSON.stringify(err.issues));
            }
          }
        } else {
          throw new Error('no uniform handler found for method: ' + method);
        }
      }
      result.uniforms = uniformsResult;
    }

    return result;
  } else {
    throw new Error('failed to generate action completion: invalid schema?');
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

export async function executeAgentActionStep(
  generativeAgent: GenerativeAgentObject,
  step: ActionStep,
) {
  const {
    agent,
    conversation,
  } = generativeAgent;
  const {
    actions,
    actionModifiers,
  } = agent.registry;
  const {
    action: message,
    uniforms: uniformsArgs,
  } = step;

  let aborted = false;

  if (message) {
    // collect action modifiers
    const actionModifiersPerPriority = collectPriorityModifiers(actionModifiers)
      .map((actionModifiers) =>
        actionModifiers.filter((actionModifier) =>
          !actionModifier.conversation || actionModifier.conversation === conversation
        )
      )
      .filter((actionModifiers) => actionModifiers.length > 0);
    // for each priority, run the action modifiers, checking for abort at each step
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
      aborted = messageEvents.some((messageEvent) => messageEvent.abortController.signal.aborted);
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

  if (uniformsArgs) {
    const uniformPromises: Promise<void>[] = [];
    for (const method in uniformsArgs) {
      const args = uniformsArgs[method];
      const uniforms = agent.registry.uniforms.filter((uniform) => uniform.name === method);
      if (uniforms.length > 0) {
        const uniform = uniforms[0];
        if (uniform.handler) {
          const e = new ActionEvent({
            agent: generativeAgent,
            message: {
              method,
              args,
            },
          });
          const p = (async () => {
            await uniform.handler(e);
          })();
          uniformPromises.push(p);
        }
      }
    }
    await Promise.all(uniformPromises);
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
export const bindConversationToAgent = ({
  agent,
  conversation,
}: {
  agent: ActiveAgentObject;
  conversation: ConversationObject;
}) => {
  conversation.addEventListener('localmessage', (e: ActionMessageEvent) => {
    const { message } = e.data;
    e.waitUntil((async () => {
      try {
        // handle the perception
        const {
          aborted,
        } = await handleChatPerception(e.data, {
          agent,
          conversation,
        });
        const {
          hidden,
        } = message;
        if (!aborted && !hidden) {
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
      } catch (err) {
        console.warn('caught new message error', err);
      }
    })());
  });
  conversation.addEventListener('remotemessage', async (e: ExtendableMessageEvent<ActionMessageEventData>) => {
    const { message } = e.data;
    const {
      hidden,
    } = message;
    if (!hidden) {
      // save the new message to the database
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