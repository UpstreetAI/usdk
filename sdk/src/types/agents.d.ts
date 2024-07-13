import type { ReactNode, FC, Ref } from 'react';
import type { ZodTypeAny } from 'zod';

// events

export type ExtendableMessageEvent<T> = MessageEvent<T> & {
  waitUntil: (promise: Promise<any>) => void;
  waitForFinish: () => Promise<void>;
};

// agents

export type AgentObject = EventTarget & {
  id: string;
  name: string;
  description: string;
  bio: string;
  model: string;
  address: string;
}

export type GenerativeAgentObject =  {
  agent: ActiveAgentObject;
  conversation: ConversationObject;

  embed: (text: string) => Promise<Array<number>>;
  complete: (
    messages: ChatMessages,
  ) => Promise<ChatMessage>;

  think: (hint?: string) => Promise<any>;
  generate: (hint: string, schema?: ZodTypeAny) => Promise<any>;
  say: (text: string) => Promise<any>;
  monologue: (text: string) => Promise<any>;
};

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
  voiceEndpoint?: string;
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
export type ActionOpts = {
  conversation?: ConversationObject;
};
export type MemoryOpts = {
  matchThreshold?: number;
  matchCount?: number;
};
export type QueueManager = {
  isIdle: () => boolean;
  waitForTurn: (fn: () => Promise<any>) => Promise<void>;
};

type MessageCache {
  messages: ActionMessage[];
  loaded: boolean;
  loadPromise: Promise<void>;

  pushMessage(message: ActionMessage): void;
  prependMessages(messages: ActionMessage[]): void;
}
export type ConversationObject = EventTarget & {
  id: string;
  messageCache: MessageCache;

  getCachedMessages: (filter?: MessageFilter) => ActionMessage[];
  fetchMessages: (filter?: MessageFilter, opts: {
    supabase: any,
    signal: AbortSignal;
  }) => Promise<ActionMessage[]>;

  typing: (handlerAsyncFn: () => Promise<void>) => Promise<void>;
  addLocalMessage: (message: ActionMessage) => Promise<void>;
  addLocalAndRemoteMessage: (message: ActionMessage) => void;
}
export type ActiveAgentObject = AgentObject & {
  actionRegistry: Map<symbol, ActionProps>;
  formatterRegistry: Map<symbol, FormatterProps>;
  promptRegistry: Map<symbol, PromptProps>;
  parserRegistry: Map<symbol, ParserProps>;
  perceptionRegistry: Map<symbol, PerceptionProps>;
  taskRegistry: Map<symbol, TaskProps>;

  nameRegistry: Map<symbol, NameProps>;
  personalityRegistry: Map<symbol, PersonalityProps>;

  serverRegistry: Map<symbol, ServerProps>;

  generativeQueueManager: QueueManager;
  tasks: Map<symbol, TaskObject>;

  //

  useSupabase: () => any;

  // useScene: () => SceneObject | null;
  // useAgents: () => Array<AgentObject>;
  // useCurrentConversation: () => Conversation | null;

  useActions: () => Array<ActionProps>;
  useFormatters: () => Array<FormatterProps>;

  useName: () => string;
  usePersonality: () => string;

  // useActionHistory: (query?: ActionHistoryQuery) => ActionMessages;

  //

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

  //

  generative: ({
    conversation,
  }: {
    conversation: ConversationObject,
  }) => GenerativeAgentObject;

  // addAction: (pendingActionMessage: PendingActionMessage, opts?: ActionOpts) => Promise<any>;
  getMemory: (query: string, opts?: MemoryOpts) => Promise<Array<Memory>>;
  addMemory: (
    text: string,
    content?: any,
    opts?: MemoryOpts,
  ) => Promise<void>;

  join: (opts: {
    room: string;
    endpointUrl: string;
  }) => Promise<void>;
  leave: (opts: {
    room: string;
    endpointUrl: string;
  }) => void;
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
  agent: GenerativeAgentObject;
  message: PendingActionMessage;
};
export interface PendingActionEvent extends MessageEvent<PendingActionEventData> {
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
export type PerceptionEvent = MessageEvent<PerceptionEventData>;

export type ActionMessageEventData = {
  message: ActionMessage;
};
export type ActionMessageEvent = ExtendableMessageEvent<ActionMessageEventData>;

export type ConversationChangeEventData = {
  conversation: ConversationObject;
};
export type ConversationChangeEvent = ExtendableMessageEvent<ConversationChangeEventData>;

export type ConversationAddEventData = {
  conversation: ConversationObject;
};
export type ConversationAddEvent = MessageEvent<ConversationAddEventData>;

export type ConversationRemoveEventData = {
  conversation: ConversationObject;
};
export type ConversationRemoveEvent = MessageEvent<ConversationRemoveEventData>;

export type MessagesUpdateEventData = undefined;
export type MessagesUpdateEvent = ExtendableMessageEvent<MessagesUpdateEventData>;

export type TaskObject = {
  id: any;
  // name: string;
  // description: string;
  timestamp: Date,
};
export type TaskEventData = {
  agent: ActiveAgentObject;
  task: TaskObject;
};
export type TaskEvent = ExtendableMessageEvent<TaskEventData>;

// scenes

export interface SceneObject extends EventTarget {
  name: string;
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

export type ConversationProps = {
  children?: ReactNode;
};
export type GenerativeAgentProps = {
  agent: ActiveAgentObject;
  conversation: ConversationObject;
  children?: ReactNode;
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
  subtleAi: SubtleAi;

  useAgentJson: () => object;
  useWallets: () => object[];
  useAuthToken: () => string;
  useSupabase: () => any;

  useTts: (ttsArgs: TtsArgs) => Tts;
  useChat: (chatArgs: ChatArgs) => Chat;

  registerAgent: (key: symbol, props: ActiveAgentObject) => void;
  unregisterAgent: (key: symbol) => void;

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
/* export type AgentContextValue = {
  actionRegistry: Map<symbol, ActionProps>;
  formatterRegistry: Map<symbol, FormatterProps>;
  promptRegistry: Map<symbol, PromptProps>;
  parserRegistry: Map<symbol, ParserProps>;
  perceptionRegistry: Map<symbol, PerceptionProps>;
  taskRegistry: Map<symbol, TaskProps>;

  nameRegistry: Map<symbol, NameProps>;
  personalityRegistry: Map<symbol, PersonalityProps>;

  serverRegistry: Map<symbol, ServerProps>;

  tasks: Map<symbol, TaskObject>;

  //

  useCurrentAgent: () => ActiveAgentObject;
  useScene: () => SceneObject | null;
  useAgents: () => Array<AgentObject>;

  useActions: () => Array<ActionProps>;
  useFormatters: () => Array<FormatterProps>;

  useName: () => string;
  usePersonality: () => string;

  useActionHistory: (query?: ActionHistoryQuery) => ActionMessages;

  //

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
}; */
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