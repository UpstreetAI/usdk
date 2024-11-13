// import {
//   embeddingDimensions,
// } from '../constants/companion-constants.js';
import {
  QueueManager,
} from '../managers/queue/queue-manager.js';
import {
  MAX_SHORT_TERM_MEMORIES,
} from '../constants/companion-constants.js';

//

const getMemoryId = memory => memory.id;
const getMemoryPayload = memory => memory.data;
const getMemoryEmbedding = memory => {
  if (typeof memory.data.value === 'object') {
    return JSON.stringify(memory.data.value);
  } else {
    return memory.data.value + '';
  }
};

//

/**
 * This function takes an array of numbers and returns an array of the same length where each value has been scaled to fit within the range of 0 and 1.
 *
 * @param {number[]} data - An array of numbers to be normalized.
 *
 * @returns {number[]} An array of the same length as `data`, where each value has been scaled to fit within the range of 0 and 1.
 *
 * @example
 *
 * const data = [1, 2, 3, 4, 5];
 * const normalizedData = minMaxNormalize(data); // [0, 0.25, 0.5, 0.75, 1]
 */
function minMaxNormalize(data) {
  // find the minimum and maximum values of the input data
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  // if the minimum and maximum values are the same, return an array of the same length filled with 0.5
  if (minValue === maxValue) {
    return Array(data.length).fill(0.5);
  } else {
    // map each value in the input data to a normalized value between 0 and 1
    return data.map(value => (value - minValue) / (maxValue - minValue));
  }
}
/**
 * This function calculates the value of an exponential decay function given an initial value and a time value.
 *
 * @param {number} initialValue - The initial value of the decay function.
 * @param {number} time - The time value at which to evaluate the decay function.
 *
 * @returns {number} The value of the exponential decay function evaluated at the given time.
 *
 */
function exponentialDecay(initialValue, time) {
  const decayFactor = 0.99;
  return initialValue * Math.pow(decayFactor, time);
}

const reverseFilter = (array, fn) => {
  const result = array.slice();
  for (let i = array.length - 1; i >= 0; i--) {
    const item = array[i];
    if (!fn(item, i, array)) {
      result.splice(i, 1);
    }
  }
  return result;
};

//
//
/**
 * A class representing a memory object that can be committed or rolled back.
 *
 * @extends EventTarget
 */
export class Memory extends EventTarget {
  /**
   * The possible states of a Memory object.
   *
   * @type {object}
   * @property {string} UNCOMMITTED - The memory has not yet been committed.
   * @property {string} COMMITTED - The memory has been committed.
   * @property {string} ROLLBACK - The memory has been rolled back.
   */
  static states = {
    UNCOMMITTED: 'uncommitted',
    COMMITTED: 'committed',
    ROLLBACK: 'rollback',
  };
  /**
   * Creates a new Memory object with the given data and state.
   *
   * @param {*} data - The data to store in the memory.
   * @param {string} [state=Memory.states.UNCOMMITTED] - The initial state of the memory.
   */
  constructor(id, data, state = Memory.states.UNCOMMITTED) {
    super();

    this.id = id;
    this.data = data;
    this.state = state;
  }
  /**
   * Commits the changes made to the memory, changing its state to COMMITTED.
   *
   * @throws {Error} If the memory is not in the UNCOMMITTED state.
   */
  commit() {
    if (this.state !== Memory.states.UNCOMMITTED) {
      throw new Error('invalid state: ' + this.state);
    }
    this.state = Memory.states.COMMITTED;
    this.dispatchEvent(new CustomEvent('commit'));
  }
  /**
   * Rolls back the changes made to the memory, changing its state to ROLLBACK.
   *
   * @throws {Error} If the memory is not in the UNCOMMITTED state.
   */
  rollback() {
    if (this.state !== Memory.states.UNCOMMITTED) {
      throw new Error('invalid state: ' + this.state);
    }
    this.state = Memory.states.ROLLBACK;
    this.dispatchEvent(new CustomEvent('rollback'));
  }
  /**
   * Registers event listeners for commit and rollback events.
   *
   * @param {Function} onCommit - A function to be called when the memory is committed.
   * @param {Function} onRollback - A function to be called when the memory is rolled back.
   */
  onCommit(onCommit, onRollback) {
    const commit = () => {
      cleanup();
      onCommit();
    };
    this.addEventListener('commit', commit);
    const rollback = () => {
      cleanup();
      onRollback();
    };
    this.addEventListener('rollback', rollback);

    const cleanup = () => {
      this.removeEventListener('commit', commit);
      this.removeEventListener('rollback', rollback);
    };
  }
}

//
/**
 * Represents a conversation with memory storage.
 */
class MemoryConversation extends EventTarget {
  constructor({
    schemaName,
    vectorDatabaseClient,
  }) {
    super();

    // members
    this.schemaName = schemaName;
    this.vectorDatabaseClient = vectorDatabaseClient;
    this.schema = null;

    // locals
    this.memoryCache = []; // the last few messages of the conversation, used for short term memory
    /**
     * The queue manager for saving the memory to the database.
     * @type {QueueManager}
     */
    // this.saveQueueManager = new QueueManager();

    this.loadPromise = null;
  }

  waitForLoad() {
    if (!this.loadPromise) {
      this.loadPromise = this.init();
    }
    return this.loadPromise;
  }

  /**
   * Initializes the conversation.
   */
  async init() {
    this.schema = await this.vectorDatabaseClient.ensureSchema(this.schemaName);

    // load the memory cache
    const memoryCache = await (async () => {
      const memoryItems = await this.schema.listItems();
      const memories = memoryItems
        .sort((a, b) => a.data.timestamp - b.data.timestamp)
        .slice(-MAX_SHORT_TERM_MEMORIES)
        .map(memoryItem => new Memory(memoryItem.id, memoryItem.data, Memory.states.COMMITTED));
      return memories;
    })();
    this.#loadInitialMemoryState({
      memoryCache,
    });
  }
  /**
   * Loads the initial memory state.
   * @param {object} options - The options object.
   * @param {Array<Memory>} options.memoryCache - The memory cache to load.
   * @private
   */
  #loadInitialMemoryState({
    memoryCache,
  }) {
    // if (this.memoryCache.length > 0) {
    //   throw new Error('already had memory');
    // }

    this.memoryCache = memoryCache;

    this.dispatchEvent(new MessageEvent('cacheupdate'));
  }
  /**
   * Gets the current memory cache.
   * @returns {Array<Memory>} The current memory cache.
   */
  getMemoryCache() {
    return this.memoryCache;
  }
  /**
   * Finds memories matching a given query string and options.
   * @param {string} queryString - The query string to match.
   * @param {Object} [opts] - Optional parameters.
   * @param {number} [opts.limit] - The maximum number of memories to return.
   * @returns {Array<Memory>} The list of memories matching the query.
   */
  async findMemories(queryString, opts) {
    const vector = await this.schema.aiClient.embed(queryString);
    const  memories = await this.schema.findItemsWithVector(vector, {
      limit: opts?.limit,
      // vectors: true,
      // payload: true,
      signal: opts?.signal,
    });
    return memories;
  }
  /**
   * Lists all memories in the database.
   * @returns {Array<Memory>} The list of all memories in the database.
   */
  async listMemories(opts) {
    const memories = await this.schema.listItems(opts);
    // memories = memories.sort((a, b) => a.memoryBlockId - b.memoryBlockId);
    return memories;
  }
  /**
   * Gets the ID to use for the next memory item.
   * @returns {number} The next memory ID.
   */
  /**
   * Adds a new memory item to the conversation.
   * @param {Object} memoryData - The data to store in the memory item.
   * @returns {Memory} The new memory item.
   */
  pushMemory(memoryData) {
    const id = this.schema.getNextId();
    const memory = new Memory(id, memoryData);

    this.memoryCache.push(memory);
    this.dispatchEvent(new MessageEvent('cacheupdate'));

    memory.onCommit(async () => { // on commit
      this.#trimMemoryCache();

      this.dispatchEvent(new MessageEvent('cacheupdate'));

      const item = await this.schema.setItem(
        id,
        getMemoryPayload(memory),
        getMemoryEmbedding(memory),
      );
    }, () => { // on rollback
      this.schema.unshiftNextId(id);

      const index = this.memoryCache.indexOf(memory);
      if (index !== -1) {
        this.memoryCache.splice(index, 1);

        this.dispatchEvent(new MessageEvent('cacheupdate'));
      } else {
        throw new Error('could not find memory in cache');
      }
    });

    this.dispatchEvent(new MessageEvent('cacheupdate'));

    return memory;
  }

  /**
   * Updates a memory item in the database.
   * @param memory - The memory item to update.
   * @returns {Promise<void>} A promise that resolves when the memory item has been updated.
   */
  async updateMemory(memory) {
    // await this.saveQueueManager.waitForTurn( async() => {
      await this.schema.setItem(
        getMemoryId(memory),
        getMemoryPayload(memory),
        getMemoryEmbedding(memory),
      );
    // });
  }


  /**
   * Trims the memory cache to the maximum allowed length.
   * This is done by removing the oldest uncommitted memories from the cache.
   * @private
   */
  #trimMemoryCache() {
    let numCommitted = 0;
    let changed = false;
    this.memoryCache = reverseFilter(this.memoryCache, (memory) => {
      if (memory.state === Memory.states.COMMITTED) {
        if (++numCommitted < MAX_SHORT_TERM_MEMORIES) {
          return true;
        } else {
          changed = true;
          return false;
        }
      } else {
        changed = true;
        return true;
      }
    });

    if (changed) {
      this.dispatchEvent(new MessageEvent('cacheupdate'));
    }
  }
  async clear() {
    const schema = this.vectorDatabaseClient.getSchema(this.schemaName);
    await schema.clear();
    this.memoryCache = [];
    this.dispatchEvent(new MessageEvent('cacheupdate'));
    // const {
    //   qdrant,
    // } = this.databaseClient;
    // await this.saveQueueManager.waitForTurn(async() => {
    //   // let memorySchema = `${memorySchemaPrefix}${characterName}`;
    //   let result = await qdrant.delete_all_points(this.schemaName);
    //   console.log("result", result);
    //   this.memoryCache = [];

    //   if (result.err) {
    //     console.error(`ERROR:  Couldn't clear collection "${this.schemaName}"!`);
    //     // console.error(result.err);
    //   } else {
    //     console.log('cleared memory collection: ', this.schemaName);
    //   }
    // });
    // this.dispatchEvent(new MessageEvent('cacheupdate'));
    // console.log('Cache atm: ', this.getMemoryCache());
  }
  async delete() {
    await this.vectorDatabaseClient.deleteSchema(this.schemaName);
    /* const {
      schemaName,
    } = this;
    const {
      qdrant,
    } = this.databaseClient;
    console.log("SchemaName", schemaName);
    await this.saveQueueManager.waitForTurn(async () => {
      let result = await qdrant.delete_collection(schemaName);
      if (result.err) {
        console.error(`ERROR:  Couldn't delete collection "${schemaName}"!`);
        // console.error(result.err);
      } else {
        console.log('deleted memory collection: ', schemaName);
      }
    }); */
  }
}

//

const memorySchemaPrefix = 'memory_';
/**
 * Creates an instance of MemoryClient.
 * @param {object} params - Object containing AI and database clients.
 * @param {object} params.aiClient - The AI client.
 * @param {object} params.vectorDatabaseClient - The vector database client.
 */
export class MemoryClient {
  constructor({
    aiClient,
    vectorDatabaseClient,
  }) {
    this.aiClient = aiClient;
    this.vectorDatabaseClient = vectorDatabaseClient;
  }
  /**
   * Get a conversation object.
   * @param {string} conversationName - The name of the conversation.
   * @returns {MemoryConversation} A MemoryConversation object.
   */
  getConversation(conversationName) {
    const schemaName = `${memorySchemaPrefix}${conversationName}`;
    const conversation = new MemoryConversation({
      schemaName,
      vectorDatabaseClient: this.vectorDatabaseClient,
    });
    return conversation;
  }
  /**
   * Delete a conversation object.
   * @param {string} conversationName - The name of the conversation to delete.
   * @returns {void}
   */
  async deleteConversation(conversationName) {
    await this.vectorDatabaseClient.deleteSchema(`${memorySchemaPrefix}${conversationName}`);

    // const {
		// 	qdrant,
		// } = this.databaseClient;

    // const schemaName = `${memorySchemaPrefix}${conversationName}`;

		// const _deleteSchema = async schemaName => {
    //   let result = await qdrant.delete_collection(schemaName);
    //   if (result.err) {
    //     console.error(`ERROR:  Couldn't delete collection "${schemaName}"!`);
    //   } else {
    //     console.log('deleted character collection: ', schemaName);
    //   }
		// };
		// await _deleteSchema(schemaName);
  }
  /**
   * Delete a memory with the specified ID from the collection associated with the given character name.
   * @async
   * @function deleteMemory
   * @param {string} characterID - The ID of the character associated with the collection to delete the memory from.
   * @param {string} id - The ID of the memory to delete.
   * @returns {Promise<void>} - A Promise that resolves when the memory is deleted.
   */
  async deleteMemory(characterID, id) {
    // const {
    //   qdrant
    // } = this.databaseClient;
    const schemaName = `${memorySchemaPrefix}${characterID}`;
    const schema = this.vectorDatabaseClient.getSchema(schemaName);
    await schema.deleteItem(id);

    // const _deletepoint = async schemaName => {
    //   let result = await qdrant.delete_points(schemaName, [id]);
    //   if (result.err) {
    //     console.error(`ERROR: Couldn't delete memory from collection "${schemaName}"!`);
    //   } else {
    //     console.log('deleted memory from collection: ', schemaName);
    //   }
    // };
    // await _deletepoint(schemaName);
  }

  async findMemoriesInSchemas(queryString, schemaNames, opts) {
    const vector = await this.vectorDatabaseClient.aiClient.embed(queryString);

    const memoriesArray = await Promise.all(schemaNames.map(async (schemaName) => {
      const schema = this.vectorDatabaseClient.getSchema(schemaName);
      // if (!schema) {
      //   throw new Error(`Schema "${schemaName}" does not exist!`);
      // }
      const memories = await schema.findItemsWithVector(vector, {
        limit: opts?.limit,
        // vectors: true,
        // payload: true,
        signal: opts?.signal,
      });
      return memories;
    }));
    return memoriesArray.flat();
  }

  /**
   * Asks LLM to rate the importance of a given memory description on a scale from 1 to 10,
   * then returns the user's response as an integer.
   *
   * @async
   * @param {string} memoryDescription - The short-term memory to ask the user to rate.
   * @returns {Promise<number>} The user's rating as an integer between 0 and 10, inclusive.
   */
  async generateImportanceScore(memoryData) {
    let importance;
    const memoryDescription = memoryData.value;
    const user = memoryData.user;
    let systemMessage = `You are a virtual assistant and I am a user.
    On the scale of 1 to 10, where 1 is a sentence from a casual conversation that is not relevant for future conversations, a question the user asked,
    and 10 is something that is important to be remembered such as user preferences, interests, basically things a best friend would know,
    questions asking about the users preferences and interests should have a low score in comparison with the actual statement about the preferences and interests,
    Rate the importance of storing this information in long term memory of following short term memory. Respond with a single integer. No extra text or information
    Memory: ${memoryDescription} said by ${user}
    Rating: <fill in>
    `;
    const message = {
      role: 'system',
      content: systemMessage,
    };
    const messages = [
      message,
    ];
    let response = await this.aiClient.createResponse(messages);
    response = response['choices'][0]['message'].content;
    importance = response.match(/\d+/g);

    let importanceNumber = parseInt(importance, 10);
    if (isNaN(importanceNumber)) {
      console.log('Not an integer:', importanceNumber);
      debugger;
      importanceNumber = 5;
    }
    if (importanceNumber > 10) {
      importanceNumber = 5;
    }
    return importanceNumber;
  }
  calculateRecency(memory) {
    return exponentialDecay(memory.data.timestamp,  Date.now() - memory.data.timestamp);
  }
  /**
   * Calculates retrieval scores for each memory in the given array of memories
   * and returns the top 10 memories sorted by their retrieval score in descending order.
   * @param {Array} memories - Array of memories to calculate retrieval scores for.
   * Each memory should be an array of length 2, with the first element being an object representing the memory,
   * and the second element being a embedding(relevance) score for that memory (number between 0 and 1).
   * The memory object should have an 'importance' property that contains a number between 1 and 10
   * representing the importance of that memory.
   * @returns {Array} - An array of the top 10 memories sorted by their retrieval score in descending order.
   * Each element in the array is an array of length 2, with the first element being the memory object
   * and the second element being the retrieval score for that memory (number between 0 and 1).
   */
  calculateRelevantMemories(memories) {
    let recency_scores = [];
    let relevance_scores = [];
    // let importance_scores = [];

    // Add recency, relevance, and importance scores for each memory into respective arrays
    /* memories.forEach(currentMemory => {
      recency_scores.push(this.calculateRecency(currentMemory[0]));
      relevance_scores.push(currentMemory[1]);
      const importance = parseInt(currentMemory[0].data['importance']);
      if (isNaN(importance)) {
        console.log('Not an integer:', importance);
        debugger;
        importance_scores.push(5);
      } else {
        importance_scores.push(importance);
      }
    }); */
    // Normalize recency, relevance, and importance scores
    const normalizedRecency = minMaxNormalize(recency_scores);
    const normalizedRelevance = minMaxNormalize(relevance_scores);
    // const normalizedImportance = minMaxNormalize(importance_scores);

    // Weights of recency, relevance and importance scores, adjust these values if you would want a parameter to be less important for the final retrieval score
    const alpha_recency = 0.5;
    const alpha_relevance = 0.5;

    let retrieval_scores = [];
    // Calculate retrieval score for each memory and push it to the retrieval_scores array
    for (let i = 0; i < memories.length; i++) {
      const retrieval_score = alpha_recency * normalizedRecency[i] + alpha_relevance * normalizedRelevance[i] /* * normalizedImportance[i] */;
      retrieval_scores.push([memories[i][0], retrieval_score]);
    }
    return retrieval_scores.sort((a, b) => b[1] - a[1]).slice(0, 10);
  }
}
