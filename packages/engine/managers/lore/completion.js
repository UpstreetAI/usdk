export class Completion extends EventTarget {
  constructor({
    promptMessages = [],
    messages = [],
  } = {}) {
    super();

    this.promptMessages = promptMessages;
    this.messages = messages;
  }
  getMessages() {
    return this.messages;
  }
  addMessage(message) {
    this.messages.push(message);

    this.dispatchEvent(new MessageEvent('message', {
      data: {
        message,
      },
    }));
  }
  end() {
    this.dispatchEvent(new MessageEvent('end', {
      data: {},
    }));
  }
}