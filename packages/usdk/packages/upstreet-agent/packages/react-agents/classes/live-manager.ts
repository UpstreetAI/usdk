import type {
  ActiveAgentObject,
  ConversationObject,
} from '../types';

//

type LiveState = {
  lastTimeout: number;
  timeouts: number[];
};
const makeLiveState = () => ({
  lastTimeout: 0,
  timeouts: [],
}) as LiveState;

type LiveTimeout = {
  conversation: ConversationObject;
  timestamp: number;
};

//

/*
the purpose of this class is to support runtime-integrated alarm timeouts
there is no local storage; this is runtime state only
as a matter of policy, only the earliest timeout for each thread is considered
*/
export class LiveManager extends EventTarget {
  agent: ActiveAgentObject;
  #cache: LiveState = makeLiveState();
  #timeouts: LiveTimeout[] = []; // XXX update this type to include the Conversation/thread that triggered the timeout
  #loadPromise: Promise<void>;
  #loaded = false;

  constructor({
    agent,
  }: {
    agent: ActiveAgentObject;
  }) {
    super();

    this.agent = agent;
    this.#loadPromise = (async() => {
      // XXX load the value from the kv

      this.#loaded = true;
    })();
  }

  // note: the below methods assume we have loaded already,
  // so, there is a runtime check for it
  private checkLoaded() {
    if (!this.#loaded) {
      throw new Error('LiveManager not loaded');
    }
  }
  // XXX add args: function and deps array
  setTimeout(timestamp: Date) {
    this.checkLoaded();
    // XXX finish this
    // XXX use min semantics
    // XXX dispatch 'updatealarm' event
  }
  process() {
    this.checkLoaded();
    // XXX if the timeout has passed for anything
    // XXX dispatch 'trigger' event
    // XXX finally, if anything was triggered, dispatch 'updatealarm' event
  }
  getNextTimeout() {
    this.checkLoaded();
    return 0;
  }

  // XXX this isn't needed if we aren't using the KV
  async waitForLoad() {
    await this.#loadPromise;
  }
}
