import type { ReactNode, FC, Ref } from 'react';
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
  getMemory: (query: string, opts?: MemoryOpts) => Promise<Array<Memory>>;
}

// messages

export type ChatMessage = {
  role: string;
  content: string;
};
export type ChatMessages = Array<ChatMessage>;

export type ChatArgs = {
  endpointUrl: string;
  playerId: string;
};

// tts

export type TtsArgs = {
  voiceEndpoint: string;
  sampleRate?: number;
}

// actions

export type ActionMessage = {
  userId: string;
  name: string;
  method: string;
  args: object;
  human: boolean;
  hidden: boolean;
  timestamp: Date;
};
export type PendingActionMessage = {
  method: string;
  args: object;
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
export type MemoryOpts = {
  matchThreshold?: number;
  matchCount?: number;
};
export interface ActiveAgentObject extends AgentObject {
  wallets: any;
  addAction: (action: PendingActionMessage) => Promise<any>;
  addMemory: (
    text: string,
    content?: any,
    opts?: MemoryOpts,
  ) => Promise<void>;
  say: (text: string) => Promise<any>;
  monologue: (text: string) => Promise<any>;
  think: (hint?: string) => Promise<any>;
  generate: (hint: string, schema?: ZodTypeAny) => Promise<any>;
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
  timestamp: Date,
};
export type TaskEventData = {
  agent: ActiveAgentObject;
  task: TaskObject;
};
export interface TaskEvent extends ExtendableMessageEvent {
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
  children?: ReactNode;
};

export type AgentProps = {
  children?: ReactNode;
  ref?: Ref<any>;
};
export type RawAgentProps = {
  children?: ReactNode;
  ref?: Ref<any>;
};

export type ActionProps = {
  name: string;
  description: string;
  schema: ZodTypeAny;
  examples: Array<object>,
  handler: (e: PendingActionEvent) => void | Promise<void>;
};
export type PromptProps = {
  children: ReactNode;
};
export type FormatterProps = {
  formatFn: (m: ActionProps) => string;
};
export type ParserProps = {
  parseFn: (s: string) => PendingActionMessage | Promise<PendingActionMessage>;
};
export type PerceptionProps = {
  type: string;
  handler: (e: PerceptionEvent) => any | Promise<any>;
};
// type ScheduleFnReturnType = number;
// export type SchedulerProps = {
//   scheduleFn: () => ScheduleFnReturnType | Promise<ScheduleFnReturnType>;
// };
export enum TaskResultEnum {
  Schedule = 'schedule',
  Idle = 'idle',
  Done = 'done',
}
export type TaskResult = {
  type: TaskResultEnum;
  args: object;
};
export type TaskProps = {
  id: any;
  handler: (e: TaskEvent) => TaskResult | Promise<TaskResult>;
  onDone?: (e: TaskEvent) => void | Promise<void>;
};

//

export type NameProps = {
  children: string;
};
export type PersonalityProps = {
  children: string;
};

//

export type ServerProps = {
  children: ReactNode | (() => void);
};

//

// export type SdkDefaultComponentArgs = {
//   DefaultAgentComponents: FC<void>;
//   DefaultActions: FC<void>;
//   DefaultPrompts: FC<void>;
//   DefaultParsers: FC<void>;
//   DefaultPerceptions: FC<void>;
//   // DefaultSchedulers: FC<void>;
//   DefaultServers: FC<void>;
// };

// contexts

type Compartment = {
  evaluate: (s: string) => any;
};

type Tts = {
  getAudioStream: (text: string, opts?: any) => ReadableStream<any>;
}

type Chat = {
  playAudioStream: (readableStream: ReadableStream) => { id: string };
};

export type AppContextValue = {
  // UserCompartment: new (...args: any[]) => Compartment;

  // Agent: FC<AgentProps>;
  // Action: FC<ActionProps>;
  // Prompt: FC<PromptProps>;
  // Formatter: FC<FormatterProps>;
  // Parser: FC<ParserProps>;
  // Perception: FC<PerceptionProps>;
  // Server: FC<ServerProps>;

  subtleAi: SubtleAi;

  useAuthToken: () => string;

  useScene: () => SceneObject;
  useAgents: () => Array<AgentObject>;
  useCurrentAgent: () => ActiveAgentObject;

  useActions: () => Array<ActionProps>;
  useFormatters: () => Array<FormatterProps>;

  useNames: () => Array<NameProps>;
  usePersonalities: () => Array<PersonalityProps>;
  
  useName: () => string;
  usePersonality: () => string;

  useActionHistory: (query?: ActionHistoryQuery) => ActionMessages;

  useTts: (ttsArgs: TtsArgs) => Tts;
  useChat: (chatArgs: ChatArgs) => Chat;

  registerAgent: (key: symbol, props: AgentProps) => void;
  unregisterAgent: (key: symbol) => void;
  registerAction: (key: symbol, props: ActionProps) => void;
  unregisterAction: (key: symbol) => void;
  registerPrompt: (key: symbol, props: PromptProps) => void;
  unregisterPrompt: (key: symbol) => void;
  registerFormatter: (key: symbol, props: FormatterProps) => void;
  unregisterFormatter: (key: symbol) => void;
  registerParser: (key: symbol, props: ParserProps) => void;
  unregisterParser: (key: symbol) => void;
  registerPerception: (key: symbol, props: PerceptionProps) => void;
  unregisterPerception: (key: symbol) => void;
  registerTask: (key: symbol, props: TaskProps) => void;
  unregisterTask: (key: symbol) => void;

  registerName: (key: symbol, props: NameProps) => void;
  unregisterName: (key: symbol) => void;
  registerPersonality: (key: symbol, props: PersonalityProps) => void;
  unregisterPersonality: (key: symbol) => void;

  registerServer: (key: symbol, props: ServerProps) => void;
  unregisterServer: (key: symbol) => void;
  
  isEnabled: () => boolean;
  
  addAction: (
    agent: ActiveAgentObject,
    action: PendingActionMessage,
  ) => Promise<any>;

  think: (agent: ActiveAgentObject, hint?: string) => Promise<any>;
  generate: (agent: ActiveAgentObject, hint: string, schema?: ZodTypeAny) => Promise<any>;
  say: (agent: ActiveAgentObject, text: string) => Promise<any>;
  monologue: (agent: ActiveAgentObject, text: string) => Promise<any>;

  addMemory: (
    agent: ActiveAgentObject,
    text: string,
    content?: any,
    opts?: MemoryOpts,
  ) => Promise<void>;
  getMemory: (
    agent: AgentObject,
    query: string,
    opts?: MemoryOpts,
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
export type ConfigurationContextValue = {
  get: (key: string) => any;
  set: (key: string, value: any) => void;
};

// messages

export type AgentFilter = {
  idMatches?: string[],
  capabilityMatches?: string[],
};
export type MessageFilter = {
  agent?: AgentFilter,
  query?: string,
  before?: Date,
  after?: Date,
  limit?: number,
};
export type ActionHistoryQuery = {
  filter?: MessageFilter,
};

// user handler

export type UserHandler = FC<void>;

// hooks

export type useAgents = () => Array<AgentObject>;