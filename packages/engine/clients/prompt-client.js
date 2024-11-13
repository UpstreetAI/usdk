// import {
//   embeddingDimensions,
//   // makeIota,
// } from './database-client.js';
// import {
//   QueueManager,
// } from '../managers/queue/queue-manager.js';
import {
  defaultPromptsetSpecs,
} from '../ai-agent/prompts/promptsets.js';
import {
  defaultLlmModel,
  defaultParser,
} from '../constants/companion-constants.js';

//

class Promptset extends EventTarget {
  constructor(spec) {
    super();

    const {
      name = '',
      llmModel = defaultLlmModel,
      parser = defaultParser,
      chunks = [],
    } = (spec ?? {});
    
    this.spec = {
      name,
      llmModel,
      parser,
      chunks,
    };
  }

  setPromptsetAttribute(key, value) {
    this.spec[key] = value;

    // XXX should write to the db here

    this.dispatchEvent(new MessageEvent('promptsetupdate', {
      data: {
        key,
        value,
      },
    }));
  }
}

//

export class PromptClient extends EventTarget{
  constructor() {
    super();

    // split into promptsets + currentPromptset
    
    // this.prompts = [];
    // this.currentPromptset = '';
    
    // const llmModels = {
    //   openai: [
    //     'gpt-4',
    //     'gpt-3.5-turbo',
    //   ],
    // };

    // XXX map this onto actual prompt classes
    this.promptsets = defaultPromptsetSpecs.map(promptsetSpec => {
      const promptset = new Promptset(promptsetSpec);
      return promptset;
    });
    this.currentPromptset = defaultPromptsetSpecs[0].name;
  }
  setCurrentPromptset(promptsetName) {
    this.currentPromptset = promptsetName;

    this.dispatchEvent(new MessageEvent('currentpromptsetupdate'));
  }
  // XXX add methods for adding/removing promptsets here
  // XXX this should dispatch the event

  getPromptsets() {
    return this.promptsets;
  }
  getPromptset(promptsetName) {
    const promptset = this.promptsets.find(promptset => promptset.name === promptsetName);
    return promptset;
  }
  getCurrentPromptset() {
    return this.currentPromptset;
  }
}