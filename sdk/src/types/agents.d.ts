import type { ReactNode, FC, Ref } from 'react';
import type { ZodTypeAny } from 'zod';

// intrinsics

declare global {
  namespace JSX {
    interface IntrinsicElements {
      agent: any;
      action: any;
      prompt: any;
      formatter: any;
      parser: any;
      perception: any;
      task: any;

      name: any;
      personality: any;
      
      server: any;
    }
  }
}

// network

export type NetworkRealms = any;

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

export type MessageCache = {
  messages: ActionMessage[];
  loaded: boolean;
  loadPromise: Promise<void>;

  pushMessage(message: ActionMessage): void;
  prependMessages(messages: ActionMessage[]): void;
  trim(): void;
};
export type Player = {
  playerId: string;
  playerSpec: object;
  getPlayerSpec(): object;
  setPlayerSpec(playerSpec: object): void;
};
export type ConversationObject = EventTarget & {
  id: string;
  scene: SceneObject | null;
  agent: ActiveAgentObject;
  agentsMap: Map<string, Player>;
  messageCache: MessageCache;
  numTyping: number;

  getCachedMessages: (filter?: MessageFilter) => ActionMessage[];
  fetchMessages: (filter?: MessageFilter, opts?: {
    supabase: any,
    signal: AbortSignal,
  }) => Promise<ActionMessage[]>;

  typing: (handlerAsyncFn: () => Promise<void>) => Promise<void>;
  addLocalMessage: (message: ActionMessage) => Promise<void>;
  addLocalAndRemoteMessage: (message: ActionMessage) => void;

  getScene: () => SceneObject | null;
  setScene: (scene: SceneObject | null) => void;

  getAgent: () => ActiveAgentObject | null;
  setAgent: (agent: ActiveAgentObject) => void;

  getAgents: () => Player[];
  addAgent: (agentId: string, player: Player) => void;
  removeAgent: (agentId: string) => void;
}
export type ActiveAgentObject = AgentObject & {
  appContextValue: AppContextValue;
  rooms: Map<string, NetworkRealms>;
  incomingMessageQueueManager: QueueManager;
  generativeQueueManager: QueueManager;
  tasks: Map<any, TaskObject>;

  // static hooks

  embed: (text: string) => Promise<Array<number>>;
  complete: (
    messages: ChatMessages,
  ) => Promise<ChatMessage>;

  //

  useAuthToken: () => string;
  useSupabase: () => any;

  useActions: () => Array<ActionProps>;
  useFormatters: () => Array<FormatterProps>;
  useName: () => string;
  usePersonality: () => string;
  useWallets: () => object[];
  useRegistry: () => AgentRegistry;

  // useActionHistory: (query?: ActionHistoryQuery) => ActionMessages;

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
  agent: GenerativeAgentObject;
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
export type ConversationInstanceProps = {
  agent: ActiveAgentObject;
  conversation: ConversationObject;
  children?: ReactNode;
  key?: any;
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

export type Instance = {
  type: string;
  props: any;
  children: InstanceChild[];
  visible: boolean;
  recurse(fn: (instance: Instance) => void): void;
};
export type TextInstance = {
  value: string;
  visible: boolean;
};
export type InstanceChild = Instance | TextInstance;
export type AgentRegistry = {
  actions: ActionProps[];
  prompts: PromptProps[];
  formatters: FormatterProps[];
  parsers: ParserProps[];
  perceptions: PerceptionProps[];
  tasks: TaskProps[];
  names: NameProps[];
  personalities: PersonalityProps[];
  servers: ServerProps[];
}
export type RenderRegistry = {
  agents: Map<ActiveAgentObject, AgentRegistry>;
  load(container: Instance): void;
};

export type AppContextValue = {
  subtleAi: SubtleAi;

  useAgentJson: () => object;
  useWallets: () => object[];
  useAuthToken: () => string;
  useSupabase: () => any;
  useRegistry: () => RenderRegistry;

  useTts: (ttsArgs: TtsArgs) => Tts;
  useChat: (chatArgs: ChatArgs) => Chat;

  embed: (text: string) => Promise<Array<number>>;
  complete: (
    messages: ChatMessages,
    opts: SubtleAiCompleteOpts,
  ) => Promise<ChatMessage>;
  generateImage: (
    text: string,
    opts: SubtleAiImageOpts,
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

export type UserHandler = FC;