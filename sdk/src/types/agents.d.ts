import type { ZodTypeAny } from 'zod';

// events

export type ExtendableMessageEvent = MessageEvent & {
  waitUntil: (promise: Promise<any>) => void;
  waitForFinish: () => Promise<void>;
};

// agents

export interface AgentObject extends EventTarget {
  id: string;
  name: string;
  description: string;
  bio: string;
  model: string;
  address: string;
  ctx: AppContextValue;
  getMemory: (query: string, opts?: GetMemoryOpts) => Promise<Array<Memory>>;
}

// messages

export type ChatMessage = {
  role: string;
  content: string;
};
export type ChatMessages = Array<ChatMessage>;

// actions

export type ActionMessage = {
  userId: string;
  name: string;
  method: string;
  args: object;
  hidden: boolean;
  timestamp: Date;
};
export type PendingActionMessage = {
  method: string;
  args: object;
  timestamp: Date;
};
export type PerceptionMessage = {
  method: string;
  args: object;
  timestamp: Date;
};
export type ActionMessages = Array<ActionMessage>;
export type AgentActionMessage = {
  agent: AgentObject;
  message: ActionMessage;
};
export type AgentActionMessages = Array<AgentActionMessage>;

// memory

export type Memory = {
  text: string;
  embedding: Array<number>;
  content: any;
};

// active agents

export type SubtleAiCompleteOpts = {
  model: string;
};
export type SubtleAiImageOpts = {
  model: string;
  width: number;
  height: number;
  quality: string;
};
export type SubtleAi = {
  context: AppContextValue;
  complete: (
    messages: ChatMessages,
    opts?: SubtleAiCompleteOpts,
  ) => Promise<ChatMessage>;
  generateImage: (
    prompt: string,
    opts?: SubtleAiImageOpts,
  ) => Promise<ArrayBuffer>;
};
export type GetMemoryOpts = {
  matchThreshold?: number;
  matchCount?: number;
};
export type AddMemoryOpts = GetMemoryOpts;
export interface ActiveAgentObject extends AgentObject {
  wallets: any;
  addAction: (action: PendingActionMessage) => Promise<any>;
  addMemory: (
    text: string,
    content?: any,
    opts?: AddMemoryOpts,
  ) => Promise<void>;
  say: (text: string) => Promise<any>;
  monologue: (text: string) => Promise<any>;
  think: (hint?: string) => Promise<any>;
  ponder: (hint: string, schema?: ZodTypeAny) => Promise<any>;
}

// action events

export type ActionEventData = {
  agent: AgentObject;
  message: ActionMessage;
};
export interface ActionEvent extends MessageEvent {
  data: ActionEventData;
}

export type PendingActionEventData = {
  agent: ActiveAgentObject;
  message: PendingActionMessage;
};
export interface PendingActionEvent extends ExtendableMessageEvent {
  data: PendingActionEventData;
  commit: () => Promise<void>;
}

export type AgentEventData = {
  agent: AgentObject;
};
export interface AgentEvent extends MessageEvent {
  data: AgentEventData;
}

export type PerceptionEventData = {
  agent: ActiveAgentObject;
  message: PerceptionMessage;
};
export interface PerceptionEvent extends ExtendableMessageEvent {
  data: PerceptionEventData;
}

export type TaskObject = {
  id: any;
  name: string;
  description: string;
};
export type TaskEventData = {
  agent: ActiveAgentObject;
  task: TaskObject;
};
export interface TaskEvent extends MessageEvent {
  data: TaskEventData;
}

// scenes

export interface SceneObject extends EventTarget {
  description: string;
}

// inits

export type ActionInit = {
  description: string;
  args: object;
  handler: (action: ActionEvent) => Promise<any>;
};

// props

export type AgentAppProps = {
  children?: React.ReactNode;
};

export type AgentProps = {
  children?: React.ReactNode;
};

export type ActionProps = {
  name: string;
  description: string;
  // example: string;
  handler: (e: PendingActionEvent) => void | Promise<void>;
};
export type PromptProps = {
  children: React.ReactNode;
};
export type ParserProps = {
  parseFn: (s: string) => PendingActionMessage | Promise<PendingActionMessage>;
};
export type PerceptionProps = {
  type: string;
  handler: (e: PerceptionEvent) => Promise<any>;
};
// type ScheduleFnReturnType = number;
// export type SchedulerProps = {
//   scheduleFn: () => ScheduleFnReturnType | Promise<ScheduleFnReturnType>;
// };
export enum TaskResultEnum {
  Schedule = 'schedule',
  Done = 'done',
}
export type TaskResult = {
  type: TaskResultEnum;
  args: object;
};
export type TaskProps = {
  id: any;
  handler: (e: TaskEvent) => TaskResult | Promise<TaskResult>;
};

// type AgentConsole = {
//   log: (args: Array<any>) => void;
//   warn: (args: Array<any>) => void;
// };

export type ServerProps = {
  children: React.ReactNode | (() => void);
};

export type SdkDefaultComponentArgs = {
  DefaultAgentComponents: React.FC<void>;
  DefaultActions: React.FC<void>;
  DefaultPrompts: React.FC<void>;
  DefaultParsers: React.FC<void>;
  DefaultPerceptions: React.FC<void>;
  // DefaultSchedulers: React.FC<void>;
  DefaultServers: React.FC<void>;
};

// contexts

type Compartment = {
  evaluate: (s: string) => any;
};
export type AppContextValue = {
  // UserCompartment: new (...args: any[]) => Compartment;

  Agent: React.FC<AgentProps>;
  Action: React.FC<ActionProps>;
  Prompt: React.FC<PromptProps>;
  Parser: React.FC<ParserProps>;
  Perception: React.FC<PerceptionProps>;
  // Scheduler: React.FC<SchedulerProps>;
  Server: React.FC<ServerProps>;

  subtleAi: SubtleAi;

  useAuthToken: () => string;

  useScene: () => SceneObject;
  useAgents: () => Array<AgentObject>;
  useCurrentAgent: () => ActiveAgentObject;
  useActions: () => Array<ActionProps>;
  useActionHistory: (opts?: ActionHistoryOpts) => ActionMessages;

  // useLoad: (p: Promise<any>) => void;

  registerAgent: (key: symbol, props: AgentProps) => void;
  unregisterAgent: (key: symbol) => void;
  registerAction: (key: symbol, props: ActionProps) => void;
  unregisterAction: (key: symbol) => void;
  registerPrompt: (key: symbol, props: PromptProps) => void;
  unregisterPrompt: (key: symbol) => void;
  registerParser: (key: symbol, props: ParserProps) => void;
  unregisterParser: (key: symbol) => void;
  registerPerception: (key: symbol, props: PerceptionProps) => void;
  unregisterPerception: (key: symbol) => void;
  // registerScheduler: (key: symbol, props: SchedulerProps) => void;
  // unregisterScheduler: (key: symbol) => void;
  registerServer: (key: symbol, props: ServerProps) => void;
  unregisterServer: (key: symbol) => void;
  registerTask: (key: symbol, props: TaskProps) => void;
  unregisterTask: (key: symbol) => void;

  addAction: (
    agent: ActiveAgentObject,
    action: PendingActionMessage,
  ) => Promise<any>;

  think: (agent: ActiveAgentObject, hint?: string) => Promise<any>;
  ponder: (agent: ActiveAgentObject, hint: string, schema?: ZodTypeAny) => Promise<any>;
  say: (agent: ActiveAgentObject, text: string) => Promise<any>;
  monologue: (agent: ActiveAgentObject, text: string) => Promise<any>;

  addMemory: (
    agent: ActiveAgentObject,
    text: string,
    content?: any,
    opts?: AddMemoryOpts,
  ) => Promise<void>;
  getMemory: (
    agent: AgentObject,
    query: string,
    opts?: GetMemoryOpts,
  ) => Promise<Array<Memory>>;

  embed: (text: string) => Promise<Array<number>>;
  complete: (
    messages: ChatMessages,
    opts?: SubtleAiCompleteOpts,
  ) => Promise<ChatMessage>;
  generateImage: (
    text: string,
    opts?: SubtleAiImageOpts,
  ) => Promise<ArrayBuffer>;
};

// messages

export type MessageFilter = {
  agentIds?: string[],
  before?: Date,
  after?: Date,
  limit?: number,
};
export type ActionHistoryOpts = {
  filter?: MessageFilter,
};

// user handler

export type UserHandler = React.FC<void>;

// hooks

export type useAgents = () => Array<AgentObject>;