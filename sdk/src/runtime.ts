// import React from 'react';
import { z } from 'zod';
import type { ZodTypeAny } from 'zod';
import { printNode, zodToTs } from 'zod-to-ts';
import 'localstorage-polyfill';
import dedent from 'dedent';
import {
  // Agent,
  // Action,
  // Formatter,
  // Prompt,
  // Parser,
  // Perception,
  // Server,
  // SceneObject,
  // AgentObject,
  // SubtleAi,
} from './components';
import {
  // Agent,
  // Action,
  // Formatter,
  // Prompt,
  // Parser,
  // Perception,
  // Server,
  // SceneObject,
  // AgentObject,
  // SubtleAi,
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

const getActionByName = (actionRegistry: Map<symbol, ActionProps>, name: string) => {
  for (const action of Array.from(actionRegistry.values())) {
    if (action.name === name) {
      return action;
    }
  }
  return null;
};

export async function generateAgentAction(agent: GenerativeAgentObject) {
  const { promptRegistry } = agent.agent;
  const prompts = Array.from(promptRegistry.values())
    .map((prompt) => prompt?.children)
    .filter((prompt) => typeof prompt === 'string' && prompt.length > 0);
  const promptString = prompts.join('\n\n');
  const promptMessages = [
    {
      role: 'user',
      content: promptString,
    },
  ];
  return await _generateAgentActionFromMessages(agent, promptMessages);
}
export async function generateAgentActionFromInstructions(
  agent: GenerativeAgentObject,
  instructions: string,
) {
  const { promptRegistry } = agent;
  const prompts = Array.from(promptRegistry.values())
    .map((prompt) => prompt?.children)
    .filter((prompt) => typeof prompt === 'string' && prompt.length > 0)
    .concat([instructions]);
  const promptString = prompts.join('\n\n');
  const promptMessages = [
    {
      role: 'user',
      content: promptString,
    },
  ];
  return await _generateAgentActionFromMessages(agent, promptMessages);
}
async function _generateAgentActionFromMessages(
  agent: GenerativeAgentObject,
  promptMessages: ChatMessages,
) {
  const { parserRegistry, actionRegistry } = agent.agent;

  const parser = Array.from(parserRegistry.values())[0];

  const numRetries = 5;
  return await retry(async () => {
    const completionMessage = await agent.complete(promptMessages);
    if (completionMessage !== null) {
      let newMessage: PendingActionMessage = null;
      newMessage = await parser.parseFn(completionMessage.content);

      const { method } = newMessage;
      const actionHandler = getActionByName(actionRegistry, method);
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
  agent: GenerativeAgentObject,
  message: PendingActionMessage,
) {
  // console.log('handle agent action 1');
  const { actionRegistry } = agent.agent;

  const { method } = message;
  const actionHandler = getActionByName(actionRegistry, method);
  // console.log('handle agent action 2', actionHandler);
  if (actionHandler) {
    // handle the pending action
    const e = new PendingActionEvent({
      agent,
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
  const agentRegistry = agent.useRegistry();

  const servers = agentRegistry.servers
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
    // const currentAgent = agentRenderer.getCurrentAgent();
    const makeTaskEvent = (agent: ActiveAgentObject, task: TaskObject) => {
      return new ExtendableMessageEvent<TaskEventData>('task', {
        data: {
          agent,
          task,
        },
      });
    };

    // initialize and run tasks
    const agentRegistries = Array.from(registry.agents.values());
    const now = new Date();
    await Promise.all(
      agentRegistries.map(async (agentRegistry) => {
        const agent = agentRegistry.value;
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
    const timestamps = agentRegistries.flatMap((agentRegistry) => {
      const agent = agentRegistry.value;
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
