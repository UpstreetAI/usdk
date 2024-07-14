import React from 'react';
// import dedent from 'dedent';
import 'localstorage-polyfill';
// import { z } from 'zod';
// import type { ZodTypeAny } from 'zod';
// import { zodToTs, printNode } from 'zod-to-ts';
import ReactReconciler from 'react-reconciler';
import {
  ConcurrentRoot,
  DefaultEventPriority,
} from 'react-reconciler/constants'
import {
  SubtleAi,
} from './subtle-ai';
import { AppContext, EpochContext, ConfigurationContext } from '../context';
import type {
  // AppContextValue,
  // AgentContextValue,
  ConfigurationContextValue,
  ActionMessages,
  PendingActionEvent,
  PendingActionMessage,
  PerceptionEvent,
  SubtleAiCompleteOpts,
  SubtleAiImageOpts,
  MemoryOpts,
  ChatMessage,
  ChatMessages,
  Memory,
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
  UserHandler,
  TtsArgs,
  ChatArgs,
  ActionHistoryQuery,
  TaskObject,
  InstanceChild,
} from '../types';

// import { ConversationContext } from './classes/conversation-context';
import { RenderLoader } from './render-loader';
// import { fetchChatCompletion } from './util/fetch.mjs';
// import * as DefaultComponents from './default-components.jsx';
// import { aiProxyHost } from './util/endpoints.mjs';
// import { lembed } from './util/embedding.mjs';
import { QueueManager } from '../util/queue-manager.mjs';
import { makeAnonymousClient } from '../util/supabase-client.mjs';
// import { UserHandler, AgentConsole } from 'sdk/types';
import { makePromise } from '../util/util.mjs';
// import { AutoVoiceEndpoint, VoiceEndpointVoicer } from './lib/voice-output/voice-endpoint-voicer.mjs';
// import { createOpusReadableStreamSource } from './lib/multiplayer/public/audio/audio-client.mjs';
// import { NetworkRealms } from "./lib/multiplayer/public/network-realms.mjs";
// import { retry } from "../util/util.mjs";
import { AppContextValue } from './app-context-value';
import { getConnectedWalletsFromMnemonic } from '../util/ethereum-utils.mjs';
// import { ActiveAgentObject } from './active-agent-object';
import {
  RenderRegistry,
  Instance,
  TextInstance,
} from './render-registry';

//

type ChildrenProps = {
  children: React.ReactNode[],
};
class ErrorBoundary extends React.Component<
  any,
  {
    hasError: boolean;
  }
> {
  localProps: ChildrenProps;
  state: {
    hasError: boolean,
  } = {
    hasError: false,
  };
  constructor(props: ChildrenProps) {
    super(props);
    this.localProps = props;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // console.log('get derived state from error', error);
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.warn('renderer crashed', error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return React.createElement(React.Fragment);
    }

    return this.localProps.children;
  }
}
const ConfigurationComponent = ({
  children,
}: {
  children: React.ReactNode[],
}) => {
  const [configurationValue, setConfigurationValue] = React.useState(() => {
    const data = {};
    const result = {
      get: (key: string) => data[key],
      set: (key: string, value: any) => {
        data[key] = value;
        setConfigurationValue(result);
      },
    };
    return result;
  });

  return React.createElement(
    ConfigurationContext.Provider,
    {
      value: configurationValue,
    },
    children,
  );
};
const AppComponent = (props: any) => {
  const {
    userRender,
    appContextValue,
    epochValue,
    topLevelRenderPromise,
  } = props;

  React.useEffect(() => {
    topLevelRenderPromise.resolve(null);
  }, [topLevelRenderPromise]);

  const children = [React.createElement(userRender/*, rest*/)];

  // create and use the AppContext.Provider
  const result = React.createElement(
    ErrorBoundary,
    undefined,
    React.createElement(
      AppContext.Provider,
      {
        value: appContextValue,
      },
      React.createElement(
        ConfigurationComponent,
        null,
        React.createElement(
          EpochContext.Provider,
          {
            value: epochValue,
          },
          ...children,
        ),
      ),
    ),
  );
  return result;
};

//

const logRecoverableError =
  typeof reportError === 'function'
    ? // In modern browsers, reportError will dispatch an error event,
      // emulating an uncaught JavaScript error.
      reportError
    : // In older browsers and test environments, fallback to console.error.
      console.error;

//

export class AgentRenderer {
  env: object;
  userRender: UserHandler;

  registry: RenderRegistry;
  appContextValue: AppContextValue;
  epochValue: number;

  reconciler: any;
  container: any;
  root: any;
  renderLoader: RenderLoader;

  renderPromise: Promise<void> | null = null;
  renderQueueManager: QueueManager;

  constructor({
    env,
    userRender,
  }: {
    env: object;
    userRender: UserHandler;
  }) {
    // const self = this;

    // latch arguments
    this.env = env;
    this.userRender = userRender;

    // create the app context
    this.registry = new RenderRegistry();
    const subtleAi = new SubtleAi();
    const useAgentJson = () => {
      const agentJsonString = (env as any).AGENT_JSON as string;
      const agentJson = JSON.parse(agentJsonString);
      return agentJson;
    };
    const useWallets = () => {
      const mnemonic = (env as any).WALLET_MNEMONIC as string;
      const wallets = getConnectedWalletsFromMnemonic(mnemonic);
      return wallets;
    };
    const useAuthToken = () => {
      return (this.env as any).AGENT_TOKEN;
    };
    const useSupabase = () => {
      const jwt = useAuthToken();
      const supabase = makeAnonymousClient(env, jwt);
      return supabase;
    };
    const useRegistry = () => {
      return this.registry;
    };
    this.appContextValue = new AppContextValue({
      subtleAi,
      agentJson: useAgentJson(),
      wallets: useWallets(),
      authToken: useAuthToken(),
      supabase: useSupabase(),
      registry: useRegistry(),
    });

    // run the module to get the result
    const opts = {
      supportsMutation: true,
      isPrimaryRenderer: true,
      getRootHostContext: () => null,
      getChildHostContext: (parentHostContext: any, type: string, rootContainer: any) => {
        return parentHostContext;
      },
      getCurrentEventPriority: () => {
        return DefaultEventPriority;
      },
      prepareForCommit: () => null,
      resetAfterCommit: () => {
        this.registry.load(this.container);
      },
      clearContainer: (container: any) => {
        container.children.length = 0;
      },
      createInstance(type: string, props: object, rootContainer: any, hostContext: any, internalHandle: any) {
        return new Instance(type, props);
      },
      createTextInstance: (text: string, rootContainer: any, hostContext: any, internalHandle: any) => {
        return new TextInstance(text);
      },
      appendInitialChild: (parent: Instance, child: InstanceChild) => {
        parent.children.push(child);
      },
      finalizeInitialChildren: (instance: Instance, type: string, props: object, rootContainer: any, hostContext: any) => {
        return false;
      },
      prepareUpdate: (instance: Instance, type: string, oldProps: object, newProps: object, rootContainer: any, hostContext: any) => {
        return null;
      },
      commitUpdate: (instance: Instance, updatePayload: any, type: string, oldProps: object, newProps: object, internalHandle: any) => {
        instance.type = type;
        instance.props = newProps;
      },
      shouldSetTextContent: (type: string, props: object) => {
        return false;
      },
      hideInstance: (instance: Instance) => {
        instance.visible = false;
      },
      unhideInstance: (instance: Instance) => {
        instance.visible = true;
      },
      hideTextInstance: (textInstance: TextInstance) => {
        textInstance.visible = false;
      },
      unhideTextInstance: (textInstance: TextInstance) => {
        textInstance.visible = true;
      },
      appendChild: (container: Instance, child: InstanceChild) => {
        container.children.push(child);
      },
      appendChildToContainer: (container: Instance, child: InstanceChild) => {
        container.children.push(child);
      },
      insertBefore: (parent: Instance, child: InstanceChild, beforeChild: InstanceChild) => {
        const index = parent.children.indexOf(beforeChild);
        parent.children.splice(index, 0, child);
      },
      insertInContainerBefore: (container: Instance, child: InstanceChild, beforeChild: InstanceChild) => {
        const index = container.children.indexOf(beforeChild);
        container.children.splice(index, 0, child);
      },
      removeChild: (parent: Instance, child: InstanceChild) => {
        const index = parent.children.indexOf(child);
        parent.children.splice(index, 1);
      },
      removeChildFromContainer: (container: Instance, child: InstanceChild) => {
        const index = container.children.indexOf(child);
        container.children.splice(index, 1);
      },
    };
    const reconciler = ReactReconciler(opts);
    this.reconciler = reconciler;
    this.container = new Instance('container');
    const root = reconciler.createContainer(
      this.container, // containerInfo
      ConcurrentRoot, // tag
      null, // hydrationCallbacks
      true, // isStrictMode
      null, // concurrentUpdatesByDefaultOverride
      '', // identifierPrefix
      logRecoverableError, // onRecoverableError
      null, // transitionCallbacks
    );
    this.root = root;
    this.renderLoader = new RenderLoader();

    this.epochValue = 0;

    this.renderQueueManager = new QueueManager();
  }

  // rendering

  async render(props: any) {
    props.topLevelRenderPromise = makePromise();
    this.renderLoader.clear();
    this.renderLoader.useLoad(props.topLevelRenderPromise);

    const element = React.createElement(AppComponent, props);
    await new Promise((accept, reject) => {
      this.reconciler.updateContainer(element, this.root, null, () => {
        accept(null);
      });
    });

    await this.renderLoader.waitForLoad();
  }
  async rerender() {
    const {
      userRender,
      appContextValue,
    } = this;

    this.epochValue++;

    const props = {
      userRender,
      appContextValue,
      epochValue: this.epochValue,
      topLevelRenderPromise: null,
    };
    // console.log('render 1');
    await this.render(props);
    // console.log('render 2');
  }

  /* async renderAsync() {
    // console.log('rerender 1');
    await this.renderQueueManager.waitForTurn(async () => {
      // console.log('rerender 2');
      await this.rerender();
      // console.log('rerender 3');
    });
    // console.log('rerender 4');
  } */

  // note: needs to be async to wait for React to resolves
  // this is used to e.g. fetch the chat history in user code
  async waitForRender() {
    if (!this.renderPromise) {
      this.renderPromise = (async () => {
        await this.rerender();
      })();
    }
    await this.renderPromise;
  }
  async ensureRegistry() {
    await this.waitForRender();
    return this.registry;
  }
}