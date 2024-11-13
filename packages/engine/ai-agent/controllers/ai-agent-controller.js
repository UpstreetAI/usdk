import {
  downloadFile,
  getCleanJwt,
  makePromise,
} from '../../util.js';
import {
  AvatarMLStreamParser,
} from '../utils/avatarml-stream-parser.js';
import {
  abortError,
} from '../../lock-manager.js';
import {
  templateString,
  generateChunks,
  uploadFile,
} from '../../utils/companion-utils.js';
import {
  WindowedTickQueueManager,
} from '../../managers/queue/windowed-tick-queue-manager.js';
import {
  MAX_SHORT_TERM_MEMORIES,
} from '../../constants/companion-constants.js';
// import {
//   makeId,
// } from '../../util.js';
import {
  EventStreamParseStream,
} from '../utils/event-stream-parser.js';
import {
  defaultPromptsetSpecs,
} from '../prompts/promptsets.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  aiProxyHost,
} from '../../endpoints.js';

//

dayjs.extend(relativeTime);

//

// const textDecoder = new TextDecoder();

const unique = (array, pred = v => v) => {
  const result = [];
  const seenSet = new Set();
  for (let i = 0; i < array.length; i++) {
    const v = array[i];
    const key = pred(v);
    if (!seenSet.has(key)) {
      seenSet.add(key);
      result.push(v);
    }
  }
  return result;
}
const formatMemoryDataApiMessageContent = (memoryData) => {
  // const userString = memoryData.user === '@user' ? 'User' : memoryData.user;
  const content = memoryData.user !== '@user' ? `:${memoryData.user}::${memoryData.type}:::${memoryData.value}` : memoryData.value;
  return content;
};
const formatMemoryDataApiMessage = (memoryData) => {
  const role = memoryData.user === '@user' ? 'user' : 'assistant';
  const content = formatMemoryDataApiMessageContent(memoryData);
  return {
    role,
    content,
  };
};
// function makeObject(keys, o) {
//   const result = {};
//   for (const key of keys) {
//     result[key] = o[key];
//   }
//   return result;
// }

//

/* export const makeSkillRequestMessage = ({
  user,
  skillSpec,
}) => {
  return {
    role: 'system',
    content: `\
# Special instructions

Respond only with a single ${skillSpec.name} command, like:
\`\`\`:${user}::${skillSpec.name}:::${skillSpec.value}\`\`\`
Do not output any other commands or any other text.
`,
  };
}; */

//

export class AgentMessage extends EventTarget {
  constructor({
    type,
    user,
    value,
  }, {
    signal,
  }) {
    super();

    this.type = type;
    this.user = user;
    this.value = value;

    this.signal = signal;
    this.lockFns = [];
    this.unlockFns = [];
  }

  addLock(lockFn) {
    this.lockFns.push(lockFn);
  }
  addUnLock(unlockFn) {
    this.unlockFns.push(unlockFn);
  }
  addLockUnlock(asyncLockFn) {
    const lockedPromise = makePromise();
    const unlockedPromise = makePromise();

    this.addLock(async () => {
      (async () => {
        await asyncLockFn(async () => {
          lockedPromise.resolve();
          await unlockedPromise;
        });
      })();
      await lockedPromise;
    });
    this.addUnLock(() => {
      unlockedPromise.resolve();
    });
  }

  async run() {
    const lockPromises = this.lockFns.map(lockFn => lockFn());
    await Promise.all(lockPromises);

    if (!this.signal.aborted) {
      const playPromises = [];

      const e = new MessageEvent('play');
      e.waitUntil = fn => {
        const p = fn();
        playPromises.push(p);
      };
      this.dispatchEvent(e);

      await Promise.all(playPromises);
    }

    for (const unlockFn of this.unlockFns) {
      unlockFn();
    }
  }
}

//

/* const formatSkillString = (user, skill) => {
  const {
    name,
    description,
    value,
  } = skill;
  return `\
${name}
:${user}::${name}:::${value}
${description}`;
} */

//

class AiAgent extends EventTarget {
  constructor({
    characterIdentity,
    memoryClient,
  }) {
    super();

    // members
    this.characterIdentity = characterIdentity;

    // locals
    this.conversation = memoryClient.getConversation(this.characterIdentity.spec.id);
    this.skills = new Set();
    this.skillContext = null;

    // load
    // this.loadPromise = this.conversation.init();
  }

  waitForLoad() {
    return this.conversation.waitForLoad();
 }

  getSkills() {
    return this.skills;
  }
  getSkillContext() {
    return this.skillContext;
  }
  setSkillContext(skillContext) {
    this.skillContext = skillContext;
  }

  /* waitForLoad() {
    return this.loadPromise;
  } */

  // get the skill format specification for the LLM
  // getSkillsString() {
  //   const lines = [];
  //   for (const skill of this.skills.values()) {
  //     const line = formatSkillString(this.name, skill);
  //     lines.push(line);
  //   }
  //   return lines.join('\n\n');
  // }

  /*
    const skillSpec = {
      name: 'skillName',
      description: `Description of how/when to use the skill.`,
      value: 'example JSON value',
      formatFn: (m, target : 'display' | 'prompt') => `Display value: ${m.value}`,
      handleFn: async agentMessage => {
        console.log('got agent message', agentMessage);
      },
    };
  */
  addSkill(skillName) {
    // const {
    //   name,
    // } = skillSpec;
    // if (!this.skills.has(name)) {
    //   this.skills.set(name, skillSpec);
    // }
    this.skills.add(skillName);

    this.dispatchEvent(new MessageEvent('skillsupdate'));
  }

  async exportMemories(){
    const items = await this.conversation.listMemories();
    const data = JSON.stringify(items, null, 2);

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Note: January is 0
    const day = today.getDate();

    const name = this.characterIdentity.spec.name;
    const dateStr = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    const blob = new Blob([data], { type: 'application/json' });
    downloadFile(blob, name+dateStr+'.json');
  }
}

//

const _postProcessMemories = (recentMemories) => {
  recentMemories = recentMemories.sort((a, b) => {
    return a.timestamp - b.timestamp;
  });
  recentMemories = recentMemories.slice(-MAX_SHORT_TERM_MEMORIES);
  recentMemories = recentMemories.map(memory => memory.data);

  // memory message post-processing
  // flatten recent text memories next to each other if they are by the same user and the same type (TEXT)
  for (let i = 0; i < recentMemories.length - 1; i++) {
    const memory = recentMemories[i];
    const nextMemory = recentMemories[i + 1];
    if (memory.type === 'TEXT' && nextMemory.type === 'TEXT' && memory.user === nextMemory.user) {
      // memory.value = `${memory.value}\n${nextMemory.value}`;
      recentMemories.splice(i, 2, {
        ...memory,
        value: `${memory.value}\n${nextMemory.value}`,
      });
      i--;
    }
  }
  // flatten multiple memories of the same user + type (not text) to only include the last one
  for (let i = 0; i < recentMemories.length - 1; i++) {
    const memory = recentMemories[i];
    const nextMemory = recentMemories[i + 1];
    if (memory.type !== 'TEXT' && memory.type === nextMemory.type && memory.user === nextMemory.user) {
      recentMemories.splice(i, 1);
      i--;
    }
  }

  // merge non-text memories following a TEXT memory, into the TEXT memory
  for (let i = 0; i < recentMemories.length - 1; i++) {
    const memory = recentMemories[i];
    const nextMemory = recentMemories[i + 1];
    if (memory.type === 'TEXT' && nextMemory.type !== 'TEXT' && memory.user === nextMemory.user) {
      // memory.value = `${memory.value}\n${formatMemoryDataApiMessageContent(nextMemory)}`;
      recentMemories.splice(i, 2, {
        ...memory,
        value: `${memory.value}\n${formatMemoryDataApiMessageContent(nextMemory)}`,
      });
      i--;
    }
  }

  return recentMemories;
};

//

export class AiAgentController extends EventTarget {
  constructor({
    aiClient,
    perceptionContextClient,
    memoryClient,
    promptClient,
    skillsClient,
  }) {
    super();

    // members
    this.aiClient = aiClient;
    this.perceptionContextClient = perceptionContextClient;
    this.memoryClient = memoryClient;
    this.promptClient = promptClient;
    this.skillsClient = skillsClient;
    if (!aiClient || !perceptionContextClient || !memoryClient || !promptClient || !skillsClient) {
      console.warn('missing clients', {
        aiClient,
        perceptionContextClient,
        memoryClient,
        promptClient,
        skillsClient,
      });
      throw new Error('missing clients');
    }

    // locals
    this.tickQueue = new WindowedTickQueueManager({
      capacity: 5, // 5 items
      windowWidth: 10 * 1000, // 10 seconds
      exponentialBackoff: 2, // 2x
    });
    this.aiAgents = [];

    this.preMessages = [];
    this.postMessages = [];
  }

  getAiAgentByCharacterId(characterId) {
    return this.aiAgents.find(aiAgent => aiAgent.characterIdentity.spec.id === characterId);
  }
  getAiAgentByName(name) {
    return this.aiAgents.find(aiAgent => aiAgent.characterIdentity.spec.name === name);
  }
  // could be useful
  // getAiAgentByNameSoft(name) {
  //   name = name.toLowerCase();
  //   return this.aiAgents.find(aiAgent => aiAgent.characterIdentity.spec.name.toLowerCase() === name);
  // }

  // getAiAgentSkill(name, skillName) {
  //   const aiAgent = this.getAiAgentByName(name);
  //   if (aiAgent) {
  //     return aiAgent.getSkill(skillName);
  //   } else {
  //     return void 0;
  //   }
  // }

  async createAiAgent({
    characterIdentity,
  }) {
    const aiAgent = new AiAgent({
      characterIdentity,
      memoryClient: this.memoryClient,
    });
    await aiAgent.waitForLoad();
    return aiAgent;
  }
  addAiAgent(aiAgent) {
    this.aiAgents.push(aiAgent);

    this.dispatchEvent(new MessageEvent('aiagentsupdate', {
      data: {
        aiAgents: this.aiAgents,
      },
    }));

    return aiAgent;
  }
  removeAiAgent(aiAgent) {
    const index = this.aiAgents.indexOf(aiAgent);
    if (index !== -1) {
      this.aiAgents.splice(index, 1);

      this.dispatchEvent(new MessageEvent('aiagentsupdate', {
        data: {
          aiAgents: this.aiAgents,
        },
      }));
    } else {
      throw new Error('ai agent not found: ' + aiAgent);
    }
  }

  // clear all memories for all ai agents
  async clearMemories() {
    for (const aiAgent of this.aiAgents) {
      await aiAgent.conversation.clear();
    }
  }

  getCompletionStream(promptSpec, {
    signal,
  }) {
    const {
      llmModel,
      messages,
    } = promptSpec;

    const r = /^(.+?):(.+)$/;
    let match = (llmModel ?? '').match(r) ?? defaultPromptsetSpecs[0].llmModel.match(r);
    const [_, modelType, modelName] = match;

    if (modelType === 'openai') {
      const eventStreamParseStream = new EventStreamParseStream();

      (async () => {
        // stream the response via server sent events (EventSource)
        const jwt = getCleanJwt();
        const response = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },

          body: JSON.stringify({
            model: modelName,
            messages,
            // stop: ['\n'],
            // temperature: 1.25,
            stream: true,
          }),

          signal,
        });
        if (signal.aborted) return;

        response.body.pipeThrough(eventStreamParseStream);
      })().catch(err => {
        console.warn(err);
      });

      return eventStreamParseStream.readable;
    } else {
      throw new Error('unsupported ai client model type: ' + modelType);
    }
  }

  // push memory to all ai agents
  pushMemory(memoryData) {
    const memorySpecs = this.aiAgents.map(aiAgent => {
      const memory = aiAgent.conversation.pushMemory(memoryData);
      return {
        aiAgent,
        memory,
      };
    });

    return {
      commit() {
        for (const memorySpec of memorySpecs) {
          memorySpec.memory.commit();
        }
      },
      rollback() {
        for (const memorySpec of memorySpecs) {
          memorySpec.memory.rollback();
        }
      },
      // updateImportance(importance) {
      //   for (const memorySpec of memorySpecs) {
      //     memorySpec.memory.data.importance = importance;
      //     memorySpec.aiAgent.conversation.updateMemory(memorySpec.memory);
      //   }
      // },
    };
  }
  playAgentMessage(agentMessage) {
    // find the agent for the message
    const aiAgent = this.getAiAgentByName(agentMessage.user);
    // find the ai agent to run the message
    if (aiAgent) {
      // note: here we could check whether the ai agent has the skill, but we don't

      // precache memory
      const timestamp = Date.now();
      const memoryData = {
        user: agentMessage.user,
        type: agentMessage.type,
        value: agentMessage.value,
        timestamp,
        // importance: 5,
      };
      const memoryBundle = this.pushMemory(memoryData);
      // const importancePromise = this.memoryClient.generateImportanceScore(memoryData);

      // handle memory commit/rollback
      const abort = () => {
        memoryBundle.rollback();
      };
      agentMessage.signal.addEventListener('abort', abort);
      agentMessage.addEventListener('play', e => {
        agentMessage.signal.removeEventListener('abort', abort);

        (async () => {
          memoryBundle.commit();

          // const importance = await importancePromise;
          // memoryBundle.updateImportance(importance);
        })();
      });

      const skillContext = aiAgent.getSkillContext();
      const skillHandler = this.skillsClient.getSkillHandler(agentMessage.type, skillContext);
      if (skillHandler) {
        skillHandler.handleFn(agentMessage);
      } else {
        console.warn('no such skill: ' + agentMessage.type);
      }

      // dispatch event
      this.dispatchEvent(new MessageEvent('agentmessage', {
        data: {
          agentMessage,
        },
      }))

      // run agent message
      const p = agentMessage.run();
      return p;
    } else {
      // return Promise.reject(new Error('no such ai agent: ' + agentMessage.user));
      console.warn('no such ai agent: ' + agentMessage.user);
    }
  }

  makeAgentMessage(parserMessage, {
    signal,
  }) {
    const {
      character,
      command,
      value,
    } = parserMessage;

    const aiAgent = this.getAiAgentByName(character);
    if (aiAgent) {
      const agentMessage = new AgentMessage({
        type: command,
        user: character,
        value,
      }, {
        signal,
      });
      return agentMessage;
    } else {
      console.warn('no such ai agent during llm parse processing: ' + character);
      // debugger;
      return null;
    }
  }
  async uploadMemories(file) {
    // Upload the memories
    let results = [];
    if (file.name.endsWith('.txt')) {
      try {
        results = await generateChunks(file);
      } catch (error) {
        console.error(error);
      }
      for (let i = 0; i <results.length; i++) {
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate()-1);
        const updatedTimestamp = timestamp.getTime();
        const memoryData = {
          user: 'Every agent',
          type: 'TEXT',
          value: results[i],
          timestamp: updatedTimestamp,
          // importance: 5,
        };
        const memoryBundle = this.pushMemory(memoryData);
        memoryBundle.commit();
      }
    } else if (file.name.endsWith('.json')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const string = new TextDecoder().decode(uint8Array);
        const a = JSON.parse(string);
        // console.log('got a', a);
        // results = makeObject([
        //   'type',
        //   'user',
        //   'value',
        //   'timestamp',
        //   'importance',
        // ], o);
        results = a.map(e => e.data);
        console.log('results', {
          results,
        });
      } catch (error) {
        console.error(error);
      }
      for (let i = 0; i <results.length; i++) {
        const memoryData = {
          user: results[i].user,
          type: results[i].type,
          value: results[i].value,
          timestamp: results[i].timestamp,
          // importance: results[i].importance,
        }
        const memoryBundle = this.pushMemory(memoryData);
        memoryBundle.commit();
      }
    }
  }

  isRunning() {
    return !!this.abortController;
  }

  next({
    signal,
    tickQueue,
  }) {
    const queuePromise = makePromise();
    const commitPromise = makePromise();

    (async () => {
      await tickQueue.waitForTurn();

      const promptSpec = await this.getPromptSpec();
      if (signal.aborted) return;

      try {
        const agentMessageRunPromises = [];
        const skills = this.skillsClient.getSkills();
        const avatarMlParser = new AvatarMLStreamParser({ // XXX parser should be chosen by the promptset
          skills,
          onMessage: (message) => {
            const agentMessage = this.makeAgentMessage(message, {
              signal,
            });
            if (agentMessage) {
              const playPromise = this.playAgentMessage(agentMessage);
              agentMessageRunPromises.push(playPromise);
            } else {
              // handleParserMessageError(message);
            }
          },
        });

        const readable = this.getCompletionStream(promptSpec, {
          signal,
        }).pipeThrough(avatarMlParser);
        // flush the stream
        await (async () => {
          const reader = readable.getReader();
          for (;;) {
            const {
              done,
              // value,
            } = await reader.read();
            if (signal.aborted) return;
            if (done) {
              break;
            }
          }
        })();

        (async () => {
          await Promise.all(agentMessageRunPromises);
          if (signal.aborted) return;

          commitPromise.resolve();
        })();
      } catch (err) {
        if (!err.isAbortError) {
          console.warn(err);
        }
      }

      queuePromise.resolve();
    })();

    return {
      queuePromise,
      commitPromise,
    };
  }
  start() {
    if (this.abortController) {
      throw new Error('already started');
    }

    this.abortController = new AbortController();
    this.run(this.abortController.signal);

    this.dispatchEvent(new MessageEvent('runningchange', {
      data: {
        running: true,
      },
    }));
  }
  stop() {
    if (this.abortController) {
      this.abortController.abort(abortError);
      this.abortController = null;

      this.dispatchEvent(new MessageEvent('runningchange', {
        data: {
          running: false,
        },
      }));
    }
  }

  #formatMemoryEmbedding(memoryData) {
    return `${memoryData.type}: ${memoryData.value}`;
  }
  /**
   * Asynchronously retrieves the top relevant memories that match a given search string.
   *
   * @function retrieveTopMemories
   * @async
   * @param {string} memoriesSearchString - The search string to use when looking up relevant memories.
   * @param signal
   * @returns {Promise<Array>} - A Promise that resolves to an array of the most relevant memories for the given search string.
   */
  async #retrieveTopMemories(memoriesSearchString, signal = null) {
    // let relevantMemories = await this.conversation.findMemories(memoriesSearchString);
    const schemaNames = Array.from(this.aiAgents.values()).map((aiAgent) => {
      return aiAgent.conversation.schemaName;
    });
    let relevantMemories = await this.memoryClient.findMemoriesInSchemas(memoriesSearchString, schemaNames, {signal});
    // console.log("relevant memories 1", relevantMemories);
    relevantMemories = relevantMemories.filter((m) => m[0].data.type === 'TEXT');
    relevantMemories = unique(relevantMemories, m => m[0].data.value);
    // console.log("relevant memories 2", relevantMemories);
    const top_relevantMemories = this.memoryClient.calculateRelevantMemories(relevantMemories);
    // console.log("relevant memories 3", top_relevantMemories);
    return top_relevantMemories;
  }
  getAllAgentMemoriesCache() {
    return unique(
      this.aiAgents.flatMap(aiAgent => aiAgent.conversation.getMemoryCache()),
      memory => memory.id
    )
      .sort((a, b) => {
        return a.data.timestamp - b.data.timestamp;
      });
  }
  async getContextObject() {
    const state = this.perceptionContextClient.getCurrentState();
    state.ocrString = state.ocrString || 'Screen stream offline.';
    state.currentTime = new Date().toLocaleTimeString();

    const memoryCache = this.getAllAgentMemoriesCache();
    const lastMessagesCache = memoryCache.slice(-2);
    const memoriesSearchString = [
      ...lastMessagesCache.map(memory => this.#formatMemoryEmbedding(memory.data)),
    ].join('\n');

    let top_relevantMemories = await this.#retrieveTopMemories(memoriesSearchString);
    top_relevantMemories = top_relevantMemories.map(m => m[0]);

    // sort by time
    top_relevantMemories = top_relevantMemories.sort((a, b) => b.data.timestamp - a.data.timestamp);
    // each memory has a time stamp
    // get the time delta string for each and then collect them into a Map<Array> with the key being the time delta string
    const timedMemories = new Map();
    for (const memory of top_relevantMemories) {
      const {
        timestamp,
      } = memory.data;
      const memoryDay = dayjs(timestamp);
      const deltaString = memoryDay.fromNow();

      let array = timedMemories.get(deltaString);
      if (!array) {
        array = [];
        timedMemories.set(deltaString, array);
      }
      array.push(memory);
    }

    const memories = Array.from(timedMemories.entries()).map(([deltaString, memoriesArray]) => {
      return {
        deltaString,
        memoriesArray,
      };
    });

    const memoriesString = Array.from(timedMemories.entries()).map(([deltaString, memories]) => {
      return [
        // textHeader(deltaString),
        `---${deltaString}---`,
        memories.map(m => `[Memory of message] <<${m.value}>> by <<${m.user}>>`).join('\n'),
      ].join('\n');
    }).join('\n');

    const agents = this.aiAgents.map(aiAgent => aiAgent.characterIdentity.spec);

    const skills = Array.from(this.skillsClient.getSkills().values()).map(skill => skill.spec);

    const exampleUser = this.aiAgents[0]?.characterIdentity?.spec?.name || '$EXAMPLE_USERNAME';

    return {
      ...state,
      memories,
      agents,
      skills,
      exampleUser,
      memoriesString,
      // skillsString,
    };
  }
  // get the full current conversation log for NLP query
  async getPromptSpec() {
    const contextObject = await this.getContextObject();
    const promptSpec = this.getPromptSpecFromContextObject(contextObject);
    return promptSpec;
  }
  getPromptSpecFromContextObject(contextObject) {
    const currentPromptset = this.promptClient.getCurrentPromptset();
    const promptsets = this.promptClient.getPromptsets();
    const promptset = promptsets.find(promptset => promptset.spec.name === currentPromptset);
    const {
      spec: {
        llmModel,
        chunks,
      },
    } = promptset;

    const messagesLabelString = '${messages}';
    const messageContents = chunks.map(chunkString => {
      if (chunkString === messagesLabelString) {
        return messagesLabelString;
      } else {
        return templateString(chunkString, contextObject);
      }
    });

    let recentMemories = this.aiAgents.flatMap(agent => agent.conversation.getMemoryCache());
    recentMemories = _postProcessMemories(recentMemories);
    let recentMemoriesMessages = recentMemories.map(memoryData => formatMemoryDataApiMessage(memoryData));

    const systemMessages = messageContents.map(content => {
      return {
        role: 'system',
        content,
      };
    });

    const messages = systemMessages.flatMap(message => {
      const s = message.content.trim();
      if (s) {
        if (s === messagesLabelString) {
          return [
            ...this.preMessages,
            ...recentMemoriesMessages,
            ...this.postMessages,
          ];
        } else {
          return [message];
        }
      } else {
        return [];
      }
    });
    // console.log('got messages', {systemMessages, messages, recentMemoriesMessages});

    return {
      llmModel,
      messages,
    };
  }
  addUserMessage(text) {
    const timestamp = Date.now();
    const memoryData = {
      user: '@user',
      type: 'TEXT',
      value: text,
      timestamp,
      // importance: 5,
    };
    const memoryBundle = this.pushMemory(memoryData);
    memoryBundle.commit();
    // const importancePromise = this.memoryClient.generateImportanceScore(memoryData);

    this.interrupt();

    // (async () => {
    //   const importance = await importancePromise;
    //   memoryBundle.updateImportance(importance);
    // })();
  }
  addUserFile(blob) {
    const timestamp = Date.now();
    let valueData;
    let fileType;
    let imageUrl;
    (async () => {
      // Send the image to the server to get the caption
      if(!blob.type.startsWith('image/')) {
        fileType = 'FILE';
        valueData = "[User sends a file called: '" + blob.name + "'. Unable to see file contents.]"
      }else{
        imageUrl = await uploadFile(blob);
        const res = await fetch('/api/caption', {
          method: 'POST',
          body: blob
        });
        // Ensure the request was successful
        if (!res.ok) {
          throw new Error('Failed to get image caption');
        }
        // Parse the response to get the caption text
        const imageText = await res.text();
        fileType = 'IMAGE';
        valueData = `[SENT_BY:: @user], [IMAGE_DESCRIPTION:: ${imageText}], [URL:: ${imageUrl}], [GENERATE_IMAGE:: FALSE]`;
        console.log('got image text', imageText);
      }

      const memoryData = {
        user: '@user',
        type: fileType,
        value: valueData,
        timestamp,
        // importance: 5,
      };
      const memoryBundle = this.pushMemory(memoryData);
      memoryBundle.commit();
      // const importancePromise = this.memoryClient.generateImportanceScore(memoryData);

      this.interrupt();

      // const importance = await importancePromise;
      // memoryBundle.updateImportance(importance);
    })();
  }
  /**
   * We want to delete a memory from all characters, we loop through every agent and delete the memory (if they have it, it will be deleted)
   * @param memoryID The ID of the memory we want to delete from all characters
   * @returns {Promise<void>}
   */
  async deleteMemory(memoryID){
    for(let i = 0; i < this.aiAgents.length; i++){
      await this.memoryClient.deleteMemory(this.aiAgents[i].characterIdentity.spec.id, memoryID);
    }
  }
  async searchMemories(memoriesSearchString, signal) {
    let top_relevantMemories = []
    try {
      top_relevantMemories = await this.#retrieveTopMemories(memoriesSearchString, signal);
      if (signal.aborted) return;

      top_relevantMemories = top_relevantMemories.map(m => m[0]);
      // sort by time
      top_relevantMemories = top_relevantMemories.sort((a, b) => b.data.timestamp - a.data.timestamp);
    } catch(error) {
      if (error.name ==='AbortError') {
        console.log('search aborted');
      } else {
        console.error("Error fetching data", error);
      }
    }
    return top_relevantMemories;
  }
  adjustTickQueueCapacity(capacity) {
    this.tickQueue.setCapacity(capacity);
    console.log("Adjusted capacity too: " + capacity);
  }
  interrupt() {
    this.stop();
    this.start();
  }
  async run(signal) {
    /*const tickQueue = new WindowedTickQueueManager({
      capacity: 5, // 5 items
      windowWidth: 10 * 1000, // 10 seconds
      exponentialBackoff: 2, // 2x
    });*/
    //this.queue = tickQueue;
    signal.addEventListener('abort', () => {
      // console.log('tick queue abort', tickQueue);
      this.tickQueue.flush();
    });

    for (;;) {
      const {
        queuePromise,
        commitPromise,
      } = this.next({
        signal,
        tickQueue: this.tickQueue,
      });
      await queuePromise;
      if (signal.aborted) return;

      await commitPromise;
      if (signal.aborted) return;
    }
  }
}
