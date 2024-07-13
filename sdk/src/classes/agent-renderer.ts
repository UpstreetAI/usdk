import React from 'react';
// import dedent from 'dedent';
import 'localstorage-polyfill';
// import { z } from 'zod';
// import type { ZodTypeAny } from 'zod';
// import { zodToTs, printNode } from 'zod-to-ts';
import ReactReconciler from 'react-reconciler';
import { ConcurrentRoot } from 'react-reconciler/constants'
// import { parseCodeBlock } from './util/util.mjs';
import {
  // Agent,
  // Action,
  // Formatter,
  // Prompt,
  // Parser,
  // Perception,
  // Server,
  // ActiveAgentObject,
  // ExtendableMessageEvent,
  // TaskObject,
  // TaskResult,
} from '../components';
// import {
//   SceneObject,
// } from './scene-object';
// import {
//   AgentObject,
// } from './agent-object';
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
import { ActiveAgentObject } from './active-agent-object';

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
    // AppContext,
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

export class AgentRenderer {
  env: object;
  userRender: UserHandler;

  renderLoader: RenderLoader;
  appContextValue: AppContextValue;
  epochValue: number;

  reconciler: any;
  root: any;

  renderQueueManager: QueueManager;

  rendered: boolean = false;
  taskMap: Map<ActiveAgentObject, Map<any, TaskObject>> = new Map();

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

    // latch members
    // const {
    //   agentRegistry,
    //   // actionRegistry,
    //   // promptRegistry,
    //   // formatterRegistry,
    //   // parserRegistry,
    //   // perceptionRegistry,
    //   // taskRegistry,
    //   // nameRegistry,
    //   // personalityRegistry,
    //   // serverRegistry,
    // } = this;

    // create the app context
    this.renderLoader = new RenderLoader();
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
    // XXX fix these params
    this.appContextValue = new AppContextValue({
      subtleAi,
      agentJson: useAgentJson(),
      wallets: useWallets(),
      authToken: useAuthToken(),
      supabase: useSupabase(),
    });

    // run the module to get the result
    const opts = {
      supportsMutation: true,
      isPrimaryRenderer: true,
      createInstance(...args: any[]) {
        // console.log('create instance', { args });
        return null;
      },
      createTextInstance: (...args: any[]) => {
        // console.log('create text instance', { args });
        return null;
      },
      getRootHostContext: () => null,
      prepareForCommit: () => null,
      resetAfterCommit: () => null,
      clearContainer: () => null,
      appendChildToContainer: () => null,
      removeChildFromContainer: () => null,
    } as any;
    const reconciler = ReactReconciler(opts);
    this.reconciler = reconciler;
    const container = {};
    const logRecoverableError =
      typeof reportError === 'function'
        ? // In modern browsers, reportError will dispatch an error event,
          // emulating an uncaught JavaScript error.
          reportError
        : // In older browsers and test environments, fallback to console.error.
          console.error;
    const root = reconciler.createContainer(
      container, // containerInfo
      ConcurrentRoot, // tag
      null, // hydrationCallbacks
      true, // isStrictMode
      null, // concurrentUpdatesByDefaultOverride
      '', // identifierPrefix
      logRecoverableError, // onRecoverableError
      null, // transitionCallbacks
    );
    this.root = root;
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

    this.rendered = true;
  }

  async rerenderAsync() {
    // console.log('rerender 1');
    await this.renderQueueManager.waitForTurn(async () => {
      // console.log('rerender 2');
      await this.rerender();
      // console.log('rerender 3');
    });
    // console.log('rerender 4');
  }

  // note: needs to be async to wait for React to resolves
  // this is used to e.g. fetch the chat history in user code
  async ensureOutput() {
    if (!this.rendered) {
      await this.rerenderAsync();
    }

    const {
      agentRegistry,
      // actionRegistry,
      // promptRegistry, 
      // parserRegistry,
      // perceptionRegistry,
      // taskRegistry,
      // nameRegistry,
      // personalityRegistry,
      // serverRegistry,
    } = this.appContextValue;

    return {
      agentRegistry,
      // actionRegistry,
      // promptRegistry,
      // parserRegistry,
      // perceptionRegistry,
      // taskRegistry,
      // nameRegistry,
      // personalityRegistry,
      // serverRegistry,
    };
  }
}