import type {
  ActiveAgentObject,
  // AgentProps,
  ActionProps,
  PromptProps,
  FormatterProps,
  // ParserProps,
  PerceptionProps,
  TaskProps,
  NameProps,
  PersonalityProps,
  ServerProps,
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

export class AgentRegistry {
  prompts: PromptProps[] = [];

  // set to null to maintain registration order
  actionsMap: Map<symbol, ActionProps | null> = new Map();
  formattersMap: Map<symbol, FormatterProps | null> = new Map();
  // parsersMap: Map<symbol, ParserProps | null> = new Map();
  perceptionsMap: Map<symbol, PerceptionProps | null> = new Map();
  tasksMap: Map<symbol, TaskProps | null> = new Map();
  
  namesMap: Map<symbol, NameProps | null> = new Map();
  personalitiesMap: Map<symbol, PersonalityProps | null> = new Map();
  
  serversMap: Map<symbol, ServerProps | null> = new Map();

  get actions() {
    return Array.from(this.actionsMap.values()).filter(Boolean);
  }
  get formatters() {
    return Array.from(this.formattersMap.values()).filter(Boolean);
  }
  // get parsers() {
  //   return Array.from(this.parsersMap.values()).filter(Boolean);
  // }
  get perceptions() {
    return Array.from(this.perceptionsMap.values()).filter(Boolean);
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
  get servers() {
    return Array.from(this.serversMap.values()).filter(Boolean);
  }

  registerAction(key: symbol, action: ActionProps) {
    this.actionsMap.set(key, action);
  }
  unregisterAction(key: symbol) {
    this.actionsMap.set(key, null);
  }
  registerFormatter(key: symbol, formatter: FormatterProps) {
    this.formattersMap.set(key, formatter);
  }
  unregisterFormatter(key: symbol) {
    this.formattersMap.set(key, null);
  }
  // registerParser(key: symbol, parser: ParserProps) {
  //   this.parsersMap.set(key, parser);
  // }
  // unregisterParser(key: symbol) {
  //   this.parsersMap.set(key, null);
  // }
  registerPerception(key: symbol, perception: PerceptionProps) {
    this.perceptionsMap.set(key, perception);
  }
  unregisterPerception(key: symbol) {
    this.perceptionsMap.set(key, null);
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
    this.namesMap.set(key, null);
  }
  registerPersonality(key: symbol, personality: PersonalityProps) {
    this.personalitiesMap.set(key, personality);
  }
  unregisterPersonality(key: symbol) {
    this.personalitiesMap.set(key, null);
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