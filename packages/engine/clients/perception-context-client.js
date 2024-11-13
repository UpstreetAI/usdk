// LLM perception context client
export class PerceptionContextClient extends EventTarget {
  #state = {};
  constructor() {
    super();
  }

  getCurrentState() {
    return {
      ...this.#state,
    };
  }
  setState(state) {
    for (const k in state) {
      this.#state[k] = state[k];
    }

    this.dispatchEvent(new MessageEvent('update'));
  }
}