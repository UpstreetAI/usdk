import {
  Mutex,
} from '../lock-manager.js';

//

export class PgSqlDatabaseSchema {
  constructor({
    type,
    supabase,
    tableName,
  }) {
    this.type = type;
    this.supabase = supabase;
    this.tableName = tableName;
  }

  #mutexes = new Map();
  async #lock(id, fn) {
    let mutex = this.#mutexes.get(id);
    if (!mutex) {
      mutex = new Mutex();
      mutex.addEventListener('releasedall', () => {
        this.#mutexes.delete(id);
      });
      this.#mutexes.set(id, mutex);
    }
    await mutex.acquire();

    let result;
    try {
      result = await fn();
    } finally {
      mutex.release();
    }
    return result;
  }

  async getUserId() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user.id;
  }

  /* async getSize() {
    return await this.fsWorker.getDirectorySize([this.dataDirectoryName, this.schemaName]);
  } */

  async getItem(id) {
    const {
      error,
      data,
    } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('type', this.type)
      .maybeSingle();
    if (!error) {
      return data;
    } else {
      throw error;
    }
  }

  async setItem(id, spec, {
    complete = true,
  } = {}) {
    const userId = await this.getUserId();

    return await this.#lock(id, async () => {
      const {
        type,
      } = this;
      const {
        content,
      } = spec;

      const o = {
        id,
        user_id: userId,
        type,
        content,
        complete,
      };
      const {
        error,
      } = await this.supabase
        .from(this.tableName)
        .upsert(o);
      if (error) {
        throw error;
      }
    });
  }
  async deleteItem(id) {
    return await this.#lock(id, async () => {
      const userId = await this.getUserId();
      console.log('delete 2', {tableName: this.tableName, id, userId});
      // delete where 'id' === id
      const result = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      console.log('got result', result);
      const {
        error,
      } = result;
      if (error) {
        throw error;
      }
    });
  }

  async readAllItems() {
    const {
      error,
      data,
    } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('type', this.type)
      .order('created_at', {
        ascending: false,
      });
    if (!error) {
      return data;
    } else {
      throw error;
    }
  }

  /* async clear() {
    // remove all contents of the directory
    await this.fsWorker.clearDirectory([this.dataDirectoryName, this.schemaName]);
  } */
}

//

export class PgSqlDatabaseClient extends EventTarget {
  constructor({
    supabase,
    tableName,
  }) {
    super();

    if (!supabase || !tableName) {
      console.warn('missing arguments', {
        supabase,
        tableName,
      });
      throw new Error('missing arguments');
    }

    // members
    this.supabase = supabase;
    this.tableName = tableName;

    // locals
    this.schemas = new Map();
  }

  getSchema(schemaName) {
    return this.schemas.get(schemaName);
  }
  async createSchema(schemaName) {
    const oldSchema = this.schemas.get(schemaName);
    if (!oldSchema) {
      const newSchema = new PgSqlDatabaseSchema({
        type: schemaName,
        supabase: this.supabase,
        tableName: this.tableName,
      });
      this.schemas.set(schemaName, newSchema);

      this.dispatchEvent(new MessageEvent('schemasupdate'));

      return newSchema;
    } else {
      throw new Error('schema already exists: ' + schemaName);
    }
  }
  async ensureSchema(schemaName) {
    let schema = this.schemas.get(schemaName);
    if (!schema) {
      schema = await this.createSchema(schemaName);
    }
    return schema;
  }
}