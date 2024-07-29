// import React from 'react';
import { ReactNode } from 'react';
import { z } from 'zod';
import type { ZodTypeAny } from 'zod';
import { printNode, zodToTs } from 'zod-to-ts';
import 'localstorage-polyfill';
import dedent from 'dedent';
import {
  ChatMessages,
  PendingActionMessage,
  ActionProps,
  ConversationObject,
  TaskEventData,
} from './types';
import {
  PendingActionEvent,
} from './classes/pending-action-event';
import { AgentRenderer } from './classes/agent-renderer';
import {
  TaskObject,
  TaskResult,
} from './classes/task-object';
import {
  ExtendableMessageEvent,
} from './util/extendable-message-event';
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

const getActionHandlerByName = (actions: ActionProps[], name: string) => {
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
async function _generateAgentActionFromMessages(
  generativeAgent: GenerativeAgentObject,
  promptMessages: ChatMessages,
) {
  const { agent } = generativeAgent;
  const {
    parsers,
    actions,
  } = agent.registry;
  const parser = parsers[0];

  const numRetries = 5;
  return await retry(async () => {
    const completionMessage = await generativeAgent.complete(promptMessages);
    if (completionMessage !== null) {
      let newMessage: PendingActionMessage = null;
      newMessage = await parser.parseFn(completionMessage.content);

      const { method } = newMessage;
      const actionHandler = getActionHandlerByName(actions, method);
      if (actionHandler) {
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

export async function handleAgentAction(
  generativeAgent: GenerativeAgentObject,
  message: PendingActionMessage,
) {
  // console.log('handle agent action 1');
  const {
    agent,
  } = generativeAgent;
  const {
    actions,
  } = agent.registry;

  const { method } = message;
  const actionHandler = getActionHandlerByName(actions, method);
  // console.log('handle agent action 2', actionHandler);
  if (actionHandler) {
    // handle the pending action
    const e = new PendingActionEvent({
      agent: generativeAgent,
      message,
    });
    // console.log('handle agent action 3', actionHandler);
    if (actionHandler.handler) {
      await actionHandler.handler(e);
    } else {
      await e.commit();
    }
    // console.log('handle agent action 4', actionHandler);
  } else {
    throw new Error('no action handler found for method: ' + method);
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

export const compileUserAgentTasks = async ({
  agentRenderer,
}: {
  agentRenderer: AgentRenderer;
}) => {
  const registry = agentRenderer.registry;

  const update = async () => {
    const ensureTask = (agent: ActiveAgentObject, taskId: any) => {
      const task = agent.tasks.get(taskId);
      if (task) {
        return task;
      } else {
        const task = new TaskObject({
          id: taskId,
        });
        agent.tasks.set(taskId, task);
        return task;
      }
    };
    const makeTaskEvent = (agent: ActiveAgentObject, task: TaskObject) => {
      return new ExtendableMessageEvent<TaskEventData>('task', {
        data: {
          agent,
          task,
        },
      });
    };

    // initialize and run tasks
    const agents = registry.agents;
    const now = new Date();
    await Promise.all(
      agents.map(async (agent) => {
        const agentRegistry = agent.registry;
        const agentTasksProps = agentRegistry.tasks;

        // clear out any unnseen tasks
        const seenTasks = new Set<any>();
        for (const taskProps of agentTasksProps) {
          const { id: taskId } = taskProps;
          if (!seenTasks.has(taskId)) {
            seenTasks.add(taskId);
          }
        }
        for (const [id, task] of Array.from(agent.tasks.entries())) {
          if (!seenTasks.has(id)) {
            agent.tasks.delete(id);
          }
        }

        // add new task
        await Promise.all(agentTasksProps.map(async (taskProps) => {
          const { id: taskId } = taskProps;
          const task = ensureTask(agent, taskId);
          if (task.timestamp <= now) {
            // time to run the task
            const e = makeTaskEvent(agent, task);
            let taskResult = null;
            let taskErr = null;
            let hadError = false;
            try {
              // console.log('task handler 1');
              taskResult = await taskProps.handler(e);
              // console.log('task handler 2');
              if (taskResult instanceof TaskResult) {
                // ok
              } else {
                throw new Error('task handler must return a TaskResult');
              }
            } catch (err) {
              taskErr = err;
              hadError = true;
            }
            if (!hadError) {
              const { type, args } = taskResult;
              switch (type) {
                case 'schedule': {
                  const { timestamp } = args;
                  task.timestamp = timestamp;
                  break;
                }
                case 'done': {
                  if (taskProps.onDone) {
                    task.timestamp = new Date(Infinity);
                    const e = makeTaskEvent(agent, task);
                    taskProps.onDone && taskProps.onDone(e);
                  }
                  break;
                }
                default: {
                  throw new Error('unknown task result type: ' + type);
                }
              }
            } else {
              console.warn('task error: ' + taskErr);
            }
          } else {
            // else it's not time to run the task yet
          }
        }));
      }),
    );
    // compute the earliest timeout
    const timestamps = agents.flatMap((agent) => {
      return Array.from(agent.tasks.values()).map((task) => {
        return +task.timestamp;
      });
    }).filter(n => !isNaN(n)).concat([Infinity]);
    const minTimestamp = Math.min(...timestamps);
    return minTimestamp;
  };
  return {
    update,
  };
};
