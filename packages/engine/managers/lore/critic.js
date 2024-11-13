// import {
//   aiProxyHost,
// } from '../../endpoints.js';
// import {
//   aiModelModes,
// } from '../story/story-manager.js';
import {
  fetchChatCompletion,
} from '../../utils/fetch.js';
import {
  underline,
} from '../../util.js';

const defaultCritiqueInterval = 5;

// - summarize the current plot
// - estimate where in the story wheel we are
// - determine what changes to make
// - suggest an improvement or change of direction to make the plot better follow the story circle

export class Critic {
  constructor({
    model,
    loreManager,
    critiqueInterval = defaultCritiqueInterval,
  } = {}) {
    if (!model || !loreManager) {
      console.warn('missing arguments', {
        model,
        loreManager,
      });
      debugger;
      throw new Error('missing arguments');
    }

    this.#model = model;
    this.#critiqueInterval = critiqueInterval;
    this.#loreManager = loreManager;

    this.#messages = [];
    this.#critiqueAbortController = null;
    this.#critique = '';
    this.#lastCritiqueIndex = -1;
  }
  #model;
  #critiqueInterval;
  #loreManager;
  #messages;
  #critiqueAbortController;
  #critique;
  #lastCritiqueIndex;

  getCritique() {
    return this.#critique;
  }
  isCritiquing() {
    return !!this.#critiqueAbortController;
  }

  addMessage(message) {
    this.#messages.push(message);
  }
  tick(opts) {
    if (!this.isCritiquing()) {
      const messagesSinceLastCritique = this.#messages.length - this.#lastCritiqueIndex;
      if (messagesSinceLastCritique >= this.#critiqueInterval) {
        this.critique(opts);
      }
    }
  }
  async critique({
    includeLocalPlayer = true,
  }) {
    if (this.#critiqueAbortController) {
      this.#critiqueAbortController.abort();
      this.#critiqueAbortController = null;
    }

    //

    this.#critiqueAbortController = new AbortController();
    const signal = this.#critiqueAbortController.signal;

    //

    const model = this.#model;
    const lore = this.#loreManager.getLore();
    const {playersManager} = this.#loreManager;
    const playersBlacklist = playersManager.getPlayersBlacklist({
      includeLocalPlayer,
    });

    //

    const messages = [
      {
        role: 'system',
        content: `\
You are a TV script doctor that provides writing advice.
You will be presented with a partial script for a TV show, and a request to improve it.
`,
      },
      {
        role: 'user',
        content: `\
${underline(`World lore`)}

${lore.getContent({
  playersBlacklist,
})}

${underline(`Script (so far)`)}
${this.#messages.map(m => {
  const parsed = m.getParsed();
  const {
    name,
    command,
    args,
    message,
  } = parsed;
  if (message) {
    return message;
  } else {
    return null;
  }
}).filter(m => m !== null).join('\n')}

${underline(`Instructions`)}
Suggest the top three improvements we can make in this script in terms of plot, pacing, story coherence, conflict, and character development.
`,
      },
    ];

    try {
      /* const res = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          // 'OpenAI-Beta': 'assistants=v1',
        },

        body: JSON.stringify({
          model,
          messages,
          // stream: true,
        }),
        signal,
      }); */
      const res = await fetchChatCompletion({
        model,
        messages,
        signal,
      });
      const j = await res.json();

      this.#critique = j.choices[0].message.content;
      console.log('got critique', [this.#critique]);
    } finally {
      this.#critiqueAbortController = null;
    }
  }
}