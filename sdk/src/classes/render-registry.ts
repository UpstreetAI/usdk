import type {
  ActiveAgentObject,
  AgentProps,
  ActionProps,
  PromptProps,
  FormatterProps,
  ParserProps,
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
  actions: ActionProps[] = [];
  prompts: PromptProps[] = [];
  formatters: FormatterProps[] = [];
  parsers: ParserProps[] = [];
  perceptions: PerceptionProps[] = [];
  tasks: TaskProps[] = [];
  
  names: NameProps[] = [];
  personalities: PersonalityProps[] = [];
  
  servers: ServerProps[] = [];
}
export class RenderRegistry {
  agents: Map<ActiveAgentObject, AgentRegistry> = new Map();
  load(container: Instance) {
    this.agents.clear();
    container.recurse((instance) => {
      if (instance.type === 'agent') {
        const agent = instance.props.value as ActiveAgentObject;
        const agentRegistry = new AgentRegistry();
        this.agents.set(agent, agentRegistry);

        instance.recurse((childInstance) => {
          if (childInstance.type === 'action') {
            agentRegistry.actions.push(childInstance.props.value);
          }
          if (childInstance.type === 'prompt') {
            agentRegistry.prompts.push(childInstance.props.value);
          }
          if (childInstance.type === 'formatter') {
            agentRegistry.formatters.push(childInstance.props.value);
          }
          if (childInstance.type === 'parser') {
            agentRegistry.parsers.push(childInstance.props.value);
          }
          if (childInstance.type === 'perception') {
            agentRegistry.perceptions.push(childInstance.props.value);
          }
          if (childInstance.type === 'task') {
            agentRegistry.tasks.push(childInstance.props.value);
          }
          if (childInstance.type === 'name') {
            agentRegistry.names.push(childInstance.props.value);
          }
          if (childInstance.type === 'personality') {
            agentRegistry.personalities.push(childInstance.props.value);
          }
          if (childInstance.type === 'server') {
            agentRegistry.servers.push(childInstance.props.value);
          }
        });
      }
    });
  }
}

export const emptyAgentRegistry = new AgentRegistry();