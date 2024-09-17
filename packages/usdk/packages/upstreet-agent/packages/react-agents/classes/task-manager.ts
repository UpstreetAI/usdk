import { useContext, useEffect } from 'react';
// import type { Context } from 'react';
import { z } from 'zod';
import * as Y from 'yjs';
// import type { ZodTypeAny } from 'zod';
import dedent from 'dedent';
// import {
//   EpochContext,
// } from '../context';
import {
  AgentObject,
} from './agent-object';
import {
  TaskObject,
  TaskResult,
} from './task-object';
import type {
  AppContextValue,
  ActionProps,
  FormatterProps,
  PromptProps,
  PerceptionProps,
  TaskProps,
  NameProps,
  PersonalityProps,
  ServerProps,
  PendingActionMessage,
  SubtleAiCompleteOpts,
  SubtleAiImageOpts,
  ChatMessages,
  ActionHistoryQuery,
  Memory,
  ActionOpts,
  PerceptionEventData,
  ConversationChangeEventData,
  ConversationAddEventData,
  ConversationRemoveEventData,
  ActionMessageEventData,
  ActionMessageEvent,
  MessagesUpdateEventData,
  PlayableAudioStream,
  ActiveAgentObject,
  TaskEventData,
} from '../types';
import {
  ConversationObject,
} from './conversation-object';
import {
  QueueManager,
} from '../util/queue-manager.mjs';
import {
  makePromise,
  parseCodeBlock,
} from '../util/util.mjs';
import { Player } from './player';
import { NetworkRealms } from '../lib/multiplayer/public/network-realms.mjs';
// import {
//   loadMessagesFromDatabase,
// } from '../util/loadMessagesFromDatabase.js';
import {
  ExtendableMessageEvent,
} from '../util/extendable-message-event';
import {
  retry,
} from '../util/util.mjs';
import {
  GenerativeAgentObject,
} from './generative-agent-object';
import {
  SceneObject,
} from './scene-object';
import { AgentRegistry, emptyAgentRegistry } from './render-registry';

//

const getTaskKey = (props: TaskProps, index: number) => {
  return [
    index + '',
    props.handler.toString(),
    props.onDone?.toString(),
  ].join(':');
};

//

// tracks an agent's current tasks
export class TaskManager extends EventTarget {
  // members
  agent: ActiveAgentObject;
  // state
  tasks: Map<symbol, TaskObject> = new Map();

  constructor({
    agent,
  }: {
    agent: ActiveAgentObject,
  }) {
    super();

    this.agent = agent;
  }

  // return the next alarm time
  async tick() {
    const { agent } = this;
 
    const ensureTask = (taskId: any) => {
      const task = this.tasks.get(taskId);
      if (task) {
        return task;
      } else {
        const task = new TaskObject({
          id: taskId,
        });
        this.tasks.set(taskId, task);
        return task;
      }
    };
    const makeTaskEvent = (task: TaskObject) => {
      return new ExtendableMessageEvent<TaskEventData>('task', {
        data: {
          agent,
          task,
        },
      });
    };

    // initialize and run tasks
    const now = new Date();
    const agentRegistry = agent.registry;
    const agentTasksProps = agentRegistry.tasks;

    // clear out any unseen tasks
    const seenTasks = new Set<any>();
    for (let i = 0; i < agentTasksProps.length; i++) {
      const taskProps = agentTasksProps[i];
      const taskId = getTaskKey(taskProps, i);
      if (!seenTasks.has(taskId)) {
        seenTasks.add(taskId);
      }
    }
    for (const [id, task] of Array.from(this.tasks.entries())) {
      if (!seenTasks.has(id)) {
        this.tasks.delete(id);
      }
    }

    // add new task
    await Promise.all(agentTasksProps.map(async (taskProps, i) => {
      // const { id: taskId } = taskProps;
      const taskId = getTaskKey(taskProps, i);
      const task = ensureTask(taskId);
      if (task.timestamp <= now) {
        // it's time to run the task
        const e = makeTaskEvent(task);
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
                const e = makeTaskEvent(task);
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
    // compute the earliest timeout
    const timestamps = Array.from(this.tasks.values()).map((task) => {
      return +task.timestamp;
    }).filter(n => !isNaN(n)).concat([Infinity]);
    const minTimestamp = Math.min(...timestamps);
    return minTimestamp;
  }
}
