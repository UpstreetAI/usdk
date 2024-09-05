import type {
  AppContextValue,
  ChatMessages,
  SubtleAiCompleteOpts,
  SubtleAiImageOpts,
} from '../types';

export class SubtleAi {
  context: AppContextValue;
  constructor({
    context,
  }: {
    context?: AppContextValue;
  } = {}) {
    this.context = context as AppContextValue;
  }
  async complete(messages: ChatMessages, opts?: SubtleAiCompleteOpts) {
    return await this.context.complete(messages, opts);
  }
  async completeJson(messages: ChatMessages, format: any, opts?: SubtleAiCompleteOpts) {
    return await this.context.completeJson(messages, format, opts);
  }
  async generateImage(prompt: string, opts?: SubtleAiImageOpts) {
    return await this.context.generateImage(prompt, opts);
  }
}