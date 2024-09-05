import type {
  ActiveAgentObject,
  // AgentProps,
  ActionProps,
  ActionModifierProps,
  PromptProps,
  FormatterProps,
  // ParserProps,
  PerceptionProps,
  PerceptionModifierProps,
  TaskProps,
  NameProps,
  PersonalityProps,
  ServerProps,
  // StoreItemProps,
  StoreItem,
  PaymentProps,
  SubscriptionProps,
} from '../types';

//

export class Instance {
  type: string;
  props: any;
  children: InstanceChild[];
  visible: boolean = true;
  constructor(
    type: string = '',
    props: any = {},
    children: InstanceChild[] = [],
  ) {
    this.type = type;
    this.props = props;
    this.children = children;
  }
  recurse(fn: (instance: Instance) => void) {
    if (this.visible) {
      fn(this);
      for (const child of this.children) {
        if (child instanceof Instance) {
          child.recurse(fn);
        }
      }
    }
  }
}
export class TextInstance {
  value: string;
  visible: boolean = true;
  constructor(value: string) {
    this.value = value;
  }
}
type InstanceChild = Instance | TextInstance;

export class AgentRegistry extends EventTarget {
  constructor() {
    super();
  }

  prompts: PromptProps[] = [];

  // set to null to maintain registration order
  actionsMap: Map<symbol, ActionProps | null> = new Map();
  actionModifiersMap: Map<symbol, ActionModifierProps | null> = new Map();
  formattersMap: Map<symbol, FormatterProps | null> = new Map();
  perceptionsMap: Map<symbol, PerceptionProps | null> = new Map();
  perceptionModifiersMap: Map<symbol, PerceptionModifierProps | null> = new Map();
  tasksMap: Map<symbol, TaskProps | null> = new Map();

  namesMap: Map<symbol, NameProps | null> = new Map();
  personalitiesMap: Map<symbol, PersonalityProps | null> = new Map();

  storeItemsMap: Map<symbol, StoreItem | null> = new Map();
  
  serversMap: Map<symbol, ServerProps | null> = new Map();

  get actions() {
    return Array.from(this.actionsMap.values()).filter(Boolean);
  }
  get actionModifiers() {
    return Array.from(this.actionModifiersMap.values()).filter(Boolean);
  }
  get formatters() {
    return Array.from(this.formattersMap.values()).filter(Boolean);
  }
  get perceptions() {
    return Array.from(this.perceptionsMap.values()).filter(Boolean);
  }
  get perceptionModifiers() {
    return Array.from(this.perceptionModifiersMap.values()).filter(Boolean);
  }
  get tasks() {
    return Array.from(this.tasksMap.values()).filter(Boolean);
  }
  get names() {
    return Array.from(this.namesMap.values()).filter(Boolean);
  }
  get personalities() {
    return Array.from(this.personalitiesMap.values()).filter(Boolean);
  }
  get storeItems() {
    return Array.from(this.storeItemsMap.values()).filter(Boolean);
  }
  get servers() {
    return Array.from(this.serversMap.values()).filter(Boolean);
  }

  registerAction(key: symbol, action: ActionProps) {
    const actionExists = Array.from(this.actionsMap.values())
      .some((a) => a?.name === action.name);
    if (!actionExists) {
      this.actionsMap.set(key, action);
    } else {
      throw new Error(`Duplicate action with name ${JSON.stringify(action.name)}`);
    }
  }
  unregisterAction(key: symbol) {
    this.actionsMap.set(key, null);
  }
  registerActionModifier(key: symbol, action: ActionModifierProps) {
    this.actionModifiersMap.set(key, action);
  }
  unregisterActionModifier(key: symbol) {
    this.actionModifiersMap.set(key, null);
  }
  registerFormatter(key: symbol, formatter: FormatterProps) {
    const formatterExists = Array.from(this.formattersMap.values())
      .some(Boolean);
    if (!formatterExists) {
      this.formattersMap.set(key, formatter);
    } else {
      throw new Error(`Multiple formatters`); 
    }
  }
  unregisterFormatter(key: symbol) {
    this.formattersMap.set(key, null);
  }
  registerPerception(key: symbol, perception: PerceptionProps) {
    this.perceptionsMap.set(key, perception);
  }
  unregisterPerception(key: symbol) {
    this.perceptionsMap.set(key, null);
  }
  registerPerceptionModifier(key: symbol, perception: PerceptionModifierProps) {
    this.perceptionModifiersMap.set(key, perception);
  }
  unregisterPerceptionModifier(key: symbol) {
    this.perceptionModifiersMap.set(key, null);
  }
  registerTask(key: symbol, task: TaskProps) {
    this.tasksMap.set(key, task);
  }
  unregisterTask(key: symbol) {
    this.tasksMap.set(key, null);
  }
  registerName(key: symbol, name: NameProps) {
    this.namesMap.set(key, name);
  }
  unregisterName(key: symbol) {
    const nameExists = Array.from(this.namesMap.values())
      .some(Boolean);
    if (!nameExists) {
      this.namesMap.set(key, null);
    } else {
      throw new Error(`Multiple names`);
    }
  }
  registerPersonality(key: symbol, personality: PersonalityProps) {
    const personalityExists = Array.from(this.personalitiesMap.values())
      .some(Boolean);
    if (!personalityExists) {
      this.personalitiesMap.set(key, personality);
    } else {
      throw new Error(`Multiple personalities`);
    }
  }
  unregisterPersonality(key: symbol) {
    this.personalitiesMap.set(key, null);
  }
  registerPayment(key: symbol, payment: PaymentProps) {
    this.storeItemsMap.set(key, {
      type: 'payment',
      props: payment,
    });
  }
  unregisterPayment(key: symbol) {
    this.storeItemsMap.set(key, null);
  }
  registerSubscription(key: symbol, subscription: SubscriptionProps) {
    this.storeItemsMap.set(key, {
      type: 'subscription',
      props: subscription,
    });
  }
  unregisterSubscription(key: symbol) {
    this.storeItemsMap.set(key, null);
  }
  registerServer(key: symbol, server: ServerProps) {
    this.serversMap.set(key, server);
  }
  unregisterServer(key: symbol) {
    this.serversMap.set(key, null);
  }
}
export class RenderRegistry {
  agents: ActiveAgentObject[] = [];
  load(container: Instance) {
    this.agents.length = 0;

    container.recurse((instance) => {
      // collect prompts for each agent
      if (instance.type === 'agent') {
        const agent = instance.props.value as ActiveAgentObject;
        this.agents.push(agent);

        const agentRegistry = agent.registry;
        agentRegistry.prompts.length = 0;

        instance.recurse((childInstance) => {
          // if (childInstance.type === 'action') {
          //   agentRegistry.actions.push(childInstance.props.value);
          // }
          if (childInstance.type === 'prompt') {
            agentRegistry.prompts.push(childInstance.props.value);
          }
          // if (childInstance.type === 'formatter') {
          //   agentRegistry.formatters.push(childInstance.props.value);
          // }
          // if (childInstance.type === 'parser') {
          //   agentRegistry.parsers.push(childInstance.props.value);
          // }
          // if (childInstance.type === 'perception') {
          //   agentRegistry.perceptions.push(childInstance.props.value);
          // }
          // if (childInstance.type === 'task') {
          //   agentRegistry.tasks.push(childInstance.props.value);
          // }
          // if (childInstance.type === 'name') {
          //   agentRegistry.names.push(childInstance.props.value);
          // }
          // if (childInstance.type === 'personality') {
          //   agentRegistry.personalities.push(childInstance.props.value);
          // }
          // if (childInstance.type === 'server') {
          //   agentRegistry.servers.push(childInstance.props.value);
          // }
        });
      }
    });
  }
}

export const emptyAgentRegistry = new AgentRegistry();