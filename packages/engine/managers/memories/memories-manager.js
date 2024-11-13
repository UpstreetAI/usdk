import {
  embed,
  oembed,
  embeddingZeroVector,
} from '../../embedding.js';
import {
  Message,
} from '../lore/message.js';

//

const defaultMatchThreshold = 75;
const defaultMatchCount = 10;

//

const getMemoryEmbeddingString = memory => {
  // if (!memory.getRaw) {
  //   console.warn('bad memory', {
  //     memory,
  //   });
  //   debugger;
  // }
  const raw = memory.getRaw();
  if (typeof raw?.content === 'string') {
    return raw.content;
  } else if (typeof raw?.content === 'object' && raw?.content !== null) {
    return JSON.stringify(raw.content);
  } else {
    return '';
  }
};
const getMemoryEmbedding = async (memory, overridenJwt = null) => {
  const memoryText = getMemoryEmbeddingString(memory, overridenJwt);
  const embedding = memoryText ? (await oembed(memoryText, { overridenJwt })) : embeddingZeroVector.slice();
  return embedding;
};

//

export class Memory extends Message {
  constructor(opts) {
    super(opts);

    this.name = opts?.name ?? ''; // conversation name identifier
    this.embedding = embeddingZeroVector;
  }
  // fromRaw(opts) {
  //   const raw = opts?.raw;
  //   const name = opts?.name;
  //   // const attachments = opts?.attachments;
  //   return new Memory({
  //     raw,
  //     name,
  //     // attachments,
  //   });
  // }
  toMessage() {
    return Message.fromRaw(this.getRaw());
  }
  toJSON() {
    const raw = this.getRaw();
    const {
      id,
      user_id,
      role,
      content,
      created_at,
    } = raw;
    const {
      name,
      embedding,
    } = this;
    return {
      id,
      user_id,
      role,
      content,
      name,
      embedding,
      created_at,
    };
  }
}

//

export class MemoriesManager {
  constructor({
    supabaseClient,
    schema, // Schema
  }) {
    this.supabaseClient = supabaseClient;
    this.schema = schema;
  }

  static async bakeMemory(memory, overridenJwt = null) {
    memory.embedding = await getMemoryEmbedding(memory, overridenJwt);
    return memory;
  }

  async getMemoriesByRange(name, from, to) {
    const { tableName } = this.schema;

    const result = await this.supabaseClient.supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .eq('name', name)
      .order('created_at', {
        ascending: false,
      })
      .range(from, to);

    const count = result.count;

    if (result.data && result.data.length) {
      result.data.reverse();
    }

    const memories = this.#formatMemories(result.data);
    return { memories: memories, totalCount: count };
  }

  async getMemoriesByName(name) {
    const {
      tableName,
    } = this.schema;

    const result = await this.supabaseClient.supabase
      .from(tableName)
      .select('*')
      .eq('name', name)
      .order('created_at', {
        ascending: true,
      });
    const memories = this.#formatMemories(result.data);
    return memories;
  }
  async getMemoriesById(userId, count = -1) {
    const {
      tableName,
    } = this.schema;

    const result = await this.supabaseClient.supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {
        ascending: true,
      });
    let memories = this.#formatMemories(result.data);
    if (count !== -1) {
      memories = memories.slice(0, count);
    }
    return memories;
  }
  async countMemoriesById(userId) {
    const memories = await this.getMemoriesById(userId);
    return memories.length;
  }
  #formatMemories(dbMemories) {
    if (!dbMemories) {
      return [];
    }
    
    return dbMemories.map(dbMemory => this.#formatMemory(dbMemory));
  }
  #formatMemory(dbMemory) {
    const {
      id,
      user_id,
      role,
      content,
      name,
      embedding,
      created_at,
    } = dbMemory;
    return new Memory({
      raw: {
        id,
        user_id,
        role,
        content,
        created_at,
      },
      name,
      embedding,
    });
  }
  async searchMemories(query, opts = {}) {
    const {
      signal = null,
    } = opts;
    const embedding = await embed(query, {
      signal,
    });

    return await this.searchMemoriesByEmbedding(embedding, opts);
  }
  async searchMemoriesByEmbedding(embedding, opts = {}) {
    const {
      name = null,
      match_threshold = defaultMatchThreshold,
      match_count = defaultMatchCount,
    } = opts;
    const {
      matchNameFn,
      matchRawFn,
    } = this.schema

    if (name !== null) {
      const result = await this.supabaseClient.supabase.rpc(matchNameFn, {
        query_name: name,
        query_embedding: embedding, // Pass the embedding you want to compare
        match_threshold, // Choose an appropriate threshold for your data
        match_count, // Choose the number of matches
      });
      // const {
      //   data: memories,
      // } = result;
      const memories = this.#formatMemories(result.data);
      return memories;
    } else {
      const result = await this.supabaseClient.supabase.rpc(matchRawFn, {
        query_embedding: embedding, // Pass the embedding you want to compare
        match_threshold, // Choose an appropriate threshold for your data
        match_count, // Choose the number of matches
      });
      // const {
      //   data: memories,
      // } = result;
      const memories = this.#formatMemories(result.data);
      return memories;
    }
  }
  async upsertRawMemory(rawMemory) {
    // memory = await MemoriesManager.bakeMemory(memory);
    const {
      tableName,
      // nameKey,
    } = this.schema;

    // const {
    //   id,
    //   role,
    //   content,
    // } = memory.getRaw();
    // const {
    //   name,
    // } = memory;
    // const newMemory = {
    //   id,
    //   role,
    //   content,
    //   name,
    // };
    // console.log('new memory', {
    //   memory,
    //   newMemory,
    // });
    const result = await this.supabaseClient.supabase
      .from(tableName)
      .upsert(rawMemory);
    // console.log('upsert result', result);
    const {
      error,
    } = result;
    if (error) {
      console.error('upsert error', error);
      throw new Error(JSON.stringify(error));
    }
  }
  async removeMemory(memoryId) {
    const {
      tableName,
      // nameKey,
    } = this.schema;

    // remove item
    const result = await this.supabaseClient.supabase
      .from(tableName)
      .delete()
      .eq('id', memoryId);
    // console.log('remove result', result);
    const {
      error,
    } = result;
    if (error) {
      console.error('remove error', error);
      throw new Error(JSON.stringify(error));
    }
  }
}
