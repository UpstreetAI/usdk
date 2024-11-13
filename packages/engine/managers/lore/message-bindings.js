export class MessageBindings extends EventTarget {
  constructor() {
    super();

    this.#bindings = [];
  }
  #bindings;

  getBindings() {
    return this.#bindings;
  }

  addBinding(binding) {
    this.#bindings.push(binding);
  }
}