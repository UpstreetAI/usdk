// import React from 'react';
import { ReactNode } from 'react';
import { z } from 'zod';
import type { ZodTypeAny } from 'zod';
import { printNode, zodToTs } from 'zod-to-ts';
import dedent from 'dedent';
import {
  ChatMessages,
  PendingActionMessage,
  ActionMessage,
  ActionProps,
  ConversationObject,
  TaskEventData,
} from './types';
import {
  PendingActionEvent,
} from './classes/pending-action-event';
import {
  AbortableActionEvent,
} from './classes/abortable-action-event';
// import { AgentRenderer } from './classes/agent-renderer';
// import {
//   TaskObject,
//   TaskResult,
// } from './classes/task-object';
// import {
//   ExtendableMessageEvent,
// } from './util/extendable-message-event';
import {
  retry,
} from './util/util.mjs';
import {
  parseCodeBlock,
} from './util/util.mjs';
import {
  ActiveAgentObject,
} from './classes/active-agent-object';
import {
  GenerativeAgentObject,
} from './classes/generative-agent-object';

//

type ServerHandler = {
  fetch(request: Request, env: object): Response | Promise<Response>;
};

//

export const getActionHandlerByName = (actions: ActionProps[], name: string) => {
  for (const action of actions) {
    if (action.name === name) {
      return action;
    }
  }
  return null;
};
const getGenerativePrompts = (generativeAgent: GenerativeAgentObject) => {
  const {
    agent,
    conversation: agentConversation,
  } = generativeAgent;
  return agent.registry.prompts
    .filter((prompt) => {
      const {
        conversation: promptConversation,
        children,
      } = prompt as {
        conversation: ConversationObject | null,
        children?: ReactNode,
      };
      return (
        (typeof children === 'string' && children.length > 0) &&
        (!promptConversation || promptConversation === agentConversation)
      );
    })
    .map((prompt) => prompt.children as string);
};

export async function generateAgentAction(generativeAgent: GenerativeAgentObject) {
  const prompts = getGenerativePrompts(generativeAgent);
  const promptString = prompts.join('\n\n');
  const promptMessages = [
    {
      role: 'user',
      content: promptString,
    },
  ];
  return await _generateAgentActionFromMessages(generativeAgent, promptMessages);
}
export async function generateAgentActionFromInstructions(
  generativeAgent: GenerativeAgentObject,
  instructions: string,
) {
  const prompts = getGenerativePrompts(generativeAgent)
    .concat([instructions]);
  const promptString = prompts.join('\n\n');
  const promptMessages = [
    {
      role: 'user',
      content: promptString,
    },
  ];
  return await _generateAgentActionFromMessages(generativeAgent, promptMessages);
}

export async function generateResponseWithInstructionAndEnforcedAction(
  generativeAgent: GenerativeAgentObject,
  instructions: string,
  enforcedAction: ActionProps,
) {
  const prompts = getGenerativePrompts(generativeAgent)
    .concat([instructions]);
  const promptString = prompts.join('\n\n');
  const promptMessages = [
    {
      role: 'user',
      content: promptString,
    },
  ];
  // XXX fix this to use structured outputs
  return await _generateAgentActionFromMessages(generativeAgent, promptMessages, enforcedAction);
}

async function _generateAgentActionFromMessages(
  generativeAgent: GenerativeAgentObject,
  promptMessages: ChatMessages,
  enforcedAction?: ActionProps,
) {
  const { agent } = generativeAgent;
  const {
    formatters,
    actions,
  } = agent.registry;
  const formatter = formatters[0];
  
  // validation
  if (!formatter) {
    throw new Error('no formatter found');
  }
  
  const schema = enforcedAction ? formatter.schemaFn([enforcedAction]) : formatter.schemaFn(actions);
  
  // retries
  const numRetries = 5;
  return await retry(async () => {
    const completionMessage = await generativeAgent.completeJson(promptMessages, schema);
    if (completionMessage !== null) {
      let newMessage: PendingActionMessage = null;
      newMessage = completionMessage.content as PendingActionMessage;

      const { method } = newMessage;
      const actionHandlers = actions.filter((action) => action.name === method);
      if (actionHandlers.length > 0) {
        const actionHandler = actionHandlers[0];
        if (actionHandler.schema) {
          try {
            const schema = z.object({
              method: z.string(),
              args: actionHandler.schema,
            });
            const parsedMessage = schema.parse(newMessage);
          } catch (err) {
            console.warn('zod schema action parse error: ' + JSON.stringify(newMessage) + '\n' + JSON.stringify(err.issues));
          }
        }
        return newMessage;
      } else {
        throw new Error('no action handler found for method: ' + method);
      }
    } else {
      return null;
    }
  }, numRetries);
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
    .sort((a, b) => a[0] - b[0])
    .map((entry) => entry[1]);
};

export async function executeAgentAction(
  generativeAgent: GenerativeAgentObject,
  message: PendingActionMessage,
) {
  // console.log('execute agent action 1', {
  //   message,
  // });
  const {
    agent,
  } = generativeAgent;
  const {
    actions,
    actionModifiers,
  } = agent.registry;

  // collect action modifiers
  const actionModifiersPerPriority = collectPriorityModifiers(actionModifiers);
  // for each priority, run the action modifiers, checking for abort at each step
  let aborted = false;
  for (const actionModifiers of actionModifiersPerPriority) {
    const abortableEventPromises = actionModifiers.map(async (perceptionModifier) => {
      if (perceptionModifier.name === message.method) {
        const e = new AbortableActionEvent({
          agent: generativeAgent,
          message,
        });
        await perceptionModifier.handler(e);
        return e;
      }
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
      if (action.name === message.method) {
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
  }
}

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
