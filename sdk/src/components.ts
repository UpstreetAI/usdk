import React, { useState, useEffect, createContext, useContext } from 'react';
import type { ZodTypeAny } from 'zod';
import type {
  ActionMessages,
  AppContextValue,
  PendingActionMessage,
  ChatMessages,
  SubtleAiImageOpts,
  SubtleAiCompleteOpts,
  GetMemoryOpts,
  AgentProps,
  ActionProps,
  PromptProps,
  ParserProps,
  PerceptionProps,
  TaskProps,
  // SchedulerProps,
  ServerProps,
} from './types';
import {
  TaskResultEnum,
} from './types';
import {
  AppContext,
  EpochContext,
} from './context';
import {
  DefaultAgentComponents,
} from './default-components';

// Note: this comment is used to remove imports before running tsdoc
// END IMPORTS

//

const makeSymbol = () => Symbol('propsKey');

/**
 * Represents an agent component.
 *
 * The `Agent` component is used to register an agent with the application context.
 * It takes an `AgentProps` object as its props and registers the agent with the app context.
 * The `Agent` component should be used as a parent component for other components that need access to the agent.
 *
 * @param props The props for the `Agent` component.
 * @returns The rendered `Agent` component.
 *
 * @example
 * ```tsx
 * <Agent>
 *   {/* child components *\/}
 * </Agent>
 * ```
 */
export const Agent: React.FC<AgentProps> = (props: AgentProps) => {
  const [symbol, setSymbol] = useState(makeSymbol);
  // bind to app context
  const appContext = (useContext(AppContext) as unknown) as AppContextValue;
  useEffect(() => {
    // console.log('Agent component useEffect', props, appContext);
    return () => {
      // console.log('Agent component cleanup', props, appContext);
      appContext.unregisterAgent(symbol);
    };
  }, [appContext]);

  appContext.registerAgent(symbol, props);

  return React.createElement(RawAgent, {}, [
    React.createElement(DefaultAgentComponents, { key: 0 }),
    React.createElement(React.Fragment, { key: 1 }, props.children),
  ]);
};
export const RawAgent: React.FC<AgentProps> = (props: AgentProps) => {
  const [symbol, setSymbol] = useState(makeSymbol);
  // bind to app context
  const appContext = (useContext(AppContext) as unknown) as AppContextValue;
  useEffect(() => {
    // console.log('Agent component useEffect', props, appContext);
    return () => {
      // console.log('Agent component cleanup', props, appContext);
      appContext.unregisterAgent(symbol);
    };
  }, [appContext]);

  appContext.registerAgent(symbol, props);

  return React.createElement(React.Fragment, {}, props.children);
};
export const Action: React.FC<ActionProps> = (props: ActionProps) => {
  const [symbol, setSymbol] = useState(makeSymbol);
  // bind to app context
  const appContext = (useContext(AppContext) as unknown) as AppContextValue;
  useEffect(() => {
    // console.log('Action component useEffect', props, appContext);
    return () => {
      // console.log('Action component cleanup', props, appContext);
      appContext.unregisterAction(symbol);
    };
  }, [appContext]);

  appContext.registerAction(symbol, props);

  return null;
};
export const Prompt: React.FC<PromptProps> = (props: PromptProps) => {
  const [symbol, setSymbol] = useState(makeSymbol);
  // bind to app context
  const appContext = (useContext(AppContext) as unknown) as AppContextValue;
  useEffect(() => {
    // console.log('Prompt unregister', props, appContext);
    return () => {
      // console.log('Prompt register', props, appContext);
      appContext.unregisterPrompt(symbol);
    };
  }, [appContext]);

  appContext.registerPrompt(symbol, props);

  return React.createElement(React.Fragment, {}, props.children);
};
export const Parser: React.FC<ParserProps> = (props: ParserProps) => {
  const [symbol, setSymbol] = useState(makeSymbol);
  // bind to app context
  const appContext = (useContext(AppContext) as unknown) as AppContextValue;
  useEffect(() => {
    // console.log('Parser component useEffect', props, appContext);
    return () => {
      // console.log('Parser component cleanup', props, appContext);
      appContext.unregisterParser(symbol);
    };
  }, [appContext]);

  appContext.registerParser(symbol, props);

  return null;
};
export const Perception: React.FC<PerceptionProps> = (props: PerceptionProps) => {
  const [symbol, setSymbol] = useState(makeSymbol);
  // bind to app context
  const appContext = (useContext(AppContext) as unknown) as AppContextValue;
  useEffect(() => {
    // console.log('Perception component useEffect', props, appContext);
    return () => {
      // console.log('Perception component cleanup', props, appContext);
      appContext.unregisterPerception(symbol);
    };
  }, [appContext]);

  appContext.registerPerception(symbol, props);

  return null;
};
export const Task: React.FC<TaskProps> = (props: TaskProps) => {
  const [symbol, setSymbol] = useState(makeSymbol);
  // bind to app context
  const appContext = (useContext(AppContext) as unknown) as AppContextValue;
  useEffect(() => {
    // console.log('Schedule component useEffect', props, appContext);
    return () => {
      // console.log('Schedule component cleanup', props, appContext);
      appContext.unregisterTask(symbol);
    };
  }, [appContext]);

  appContext.registerTask(symbol, props);

  return null;
};
/* export const Scheduler: React.FC<SchedulerProps> = (props: SchedulerProps) => {
  const [symbol, setSymbol] = useState(makeSymbol);
  // bind to app context
  const appContext = (useContext(AppContext) as unknown) as AppContextValue;
  useEffect(() => {
    // console.log('Schedule component useEffect', props, appContext);
    return () => {
      // console.log('Schedule component cleanup', props, appContext);
      appContext.unregisterScheduler(symbol);
    };
  }, [appContext]);

  appContext.registerScheduler(symbol, props);

  return null;
}; */

export const Server: React.FC<ServerProps> = (props: ServerProps) => {
  const [symbol, setSymbol] = useState(makeSymbol);
  // bind to app context
  const appContext = (useContext(AppContext) as unknown) as AppContextValue;
  useEffect(() => {
    // console.log('Schedule component useEffect', props, appContext);
    return () => {
      // console.log('Schedule component cleanup', props, appContext);
      appContext.unregisterServer(symbol);
    };
  }, [appContext]);

  appContext.registerServer(symbol, props);

  // return React.createElement(React.Fragment, {}, props.children);
  return null;
};

//

export class ExtendableMessageEvent extends MessageEvent<object> {
  private promises: Array<Promise<any>> = [];
  constructor(type: string, opts: object) {
    super(type, opts);
  }
  waitUntil(promise: Promise<any>) {
    this.promises.push(promise);
  }
  async waitForFinish() {
    await Promise.all(this.promises);
  }
}
export class SceneObject extends EventTarget {
  description: string;
  constructor({
    description = 'A parallel virtual world populated by humans + AIs',
  }) {
    super();
    this.description = description;
  }
}
export class AgentObject extends EventTarget {
  id: string;
  name: string;
  description: string;
  bio: string;
  model: string;
  address: string;
  ctx: AppContextValue;
  constructor({
    id,
    name,
    description,
    bio,
    model,
    address,
  }: {
    id: string;
    name: string;
    description: string;
    bio: string;
    model: string;
    address: string;
  }, {
    context,
  }: {
    context: AppContextValue;
  }) {
    super();
    this.id = id;
    this.name = name;
    this.description = description;
    this.bio = bio;
    this.model = model;
    this.address = address;
    this.ctx = context;
  }
  async getMemory(query: string, opts?: GetMemoryOpts) {
    const result = await this.ctx.getMemory(this, query, opts);
    return result;
  }
}
export class SubtleAi {
  context: AppContextValue;
  constructor({
    context,
  }: {
    context?: AppContextValue;
  } = {}) {
    this.context = context as AppContextValue;
  }
  async complete(messages: ChatMessages, opts?: SubtleAiCompleteOpts) {
    return await this.context.complete(messages, opts);
  }
  async generateImage(prompt: string, opts?: SubtleAiImageOpts) {
    return await this.context.generateImage(prompt, opts);
  }
}
export class ActiveAgentObject extends AgentObject {
  wallets: any;
  constructor(
    agent: AgentObject,
    {
      wallets,
    }: {
      wallets: any;
    }
  ) {
    super(agent, {
      context: agent.ctx,
    });
    this.wallets = wallets;
  }

  async addAction(action: PendingActionMessage) {
    await this.ctx.addAction(this, action);
  }

  async addMemory(text: string, content?: any) {
    // console.log('active agent object addMemory 1', {
    //   agent: this,
    //   text,
    // });
    const result = await this.ctx.addMemory(this, text, content);
    // console.log('active agent object addMemory 2', result);
    return result;
  }

  async say(text: string) {
    const result = await this.ctx.say(this, text);
    return result;
  }
  async monologue(text: string) {
    const result = await this.ctx.monologue(this, text);
    return result;
  }
  async think(hint?: string): Promise<void> {
    return await this.ctx.think(this, hint);
  }
  async ponder(hint?: string, schema?: ZodTypeAny): Promise<void> {
    return await this.ctx.ponder(this, hint, schema);
  }
}
export class TaskObject {
  id: any;
  name: string;
  description: string;
  timestamp: Date;
  constructor({
    id = null,
    name = '',
    description = '',
    timestamp = new Date(0),
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.timestamp = timestamp;
  }
}
export class TaskResult {
  type: TaskResultEnum;
  args: object;

  static SCHEDULE = TaskResultEnum.Schedule;
  static DONE = TaskResultEnum.Done;

  constructor(type: TaskResultEnum, args: object = null) {
    switch (type) {
      case TaskResult.SCHEDULE: {
        const timestamp = (args as any)?.timestamp;
        if (!(timestamp instanceof Date)) {
          throw new Error('Invalid timestamp: ' + timestamp);
        }
        break;
      }
      case TaskResult.DONE: {
        break;
      }
      default: {
        throw new Error('Invalid task result type: ' + type);
      }
    }

    this.type = type;
    this.args = args;
  }
}
