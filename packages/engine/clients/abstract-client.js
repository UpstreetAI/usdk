import JSZip from 'jszip';

//

export class ClientItem extends EventTarget {
  constructor({
    id,
    user_id,
    name,
    type,
    content,

    client,
  }) {
    super();

    this.id = id;
    this.user_id = user_id;
    this.name = name;
    this.type = type;
    this.content = content;

    this.client = client;
  }

  get spec() {
    debugger;
  }
  set spec(spec) {
    debugger;
  }

  async setAttribute(key, value) {
    this.content[key] = value;

    this.dispatchEvent(new MessageEvent('update', {
      data: {
        keys: [key],
      },
    }));

    const j = this.toJ();
    await this.client.upsertItem(j);
  }
  async setAttributes(attributes) {
    const keys = [];
    for (const key in attributes) {
      const value = attributes[key];
      this.content[key] = value;

      keys.push(key);
    }

    this.dispatchEvent(new MessageEvent('update', {
      data: {
        keys,
      },
    }));

    const j = this.toJ();
    await this.client.upsert(j);
  }
  toJ() {
    return {
      id: this.id,
      user_id: this.user_id,
      name: this.name,
      type: this.type,
      content: this.content,
    };
  }
}
export class AbstractClient extends EventTarget {
  constructor({
    pgSqlDatabaseClient,
    supabaseFsWorker,
    type,
    dataUrlKeys,
    getItemId,
  }) {
    super();

    if (getItemId) {
      debugger;
    }

    if (!type || !pgSqlDatabaseClient || !pgSqlDatabaseClient || !supabaseFsWorker || !type || !dataUrlKeys) {
      console.warn('missing args', {
        pgSqlDatabaseClient,
        supabaseFsWorker,
        type,
        dataUrlKeys,
      });
      throw new Error('missing args');
    }

    this.pgSqlDatabaseClient = pgSqlDatabaseClient;
    this.supabaseFsWorker = supabaseFsWorker;
    this.type = type;
    this.dataUrlKeys = dataUrlKeys;

    this.items = [];
    this.loadPromise = null;
  }

  get getItemId() {
    debugger;
  }
  set getItemId(getItemId) {
    debugger;
  }

  async waitForLoad() {
    if (!this.loadPromise) {
      this.loadPromise = (async () => {
        const _ensureSchema = async type => {
          const schema = await this.pgSqlDatabaseClient.ensureSchema(type);
        };
        await _ensureSchema(this.type);

        const [
          items,
        ] = await Promise.all([
          this.#getItemsAsync(),
        ]);
        this.items = items;
        this.dispatchEvent(new MessageEvent('itemsupdate', {
          data: {
            items,
          },
        }));
      })();
    }
    return this.loadPromise;
  }
  // async clear() {
  //   const _clearSchema = async schemaName => {
  //     const schema = await this.fileDatabaseClient.ensureSchema(schemaName);
  //   await schema.clear();
  //   };
  //   await _clearSchema(this.schemaName);
  // }

  // database getters
  async #getItemsAsync() {
    const schema = this.pgSqlDatabaseClient.getSchema(this.type);
    let datas = await schema.readAllItems();
    datas = datas.sort((a, b) => a.id - b.id);

    const items = datas.map(data => {
      const {
        id,
        user_id,
        name,
        type,
        content,
      } = data;
      const item = new ClientItem({
        id,
        user_id,
        name,
        type,
        content,

        client: this,
      });
      return item;
    });
    return items;
  }

  // set in database
  async upsertItem(spec) {
    const schema = this.pgSqlDatabaseClient.getSchema(this.type);
    await schema.setItem(
      spec.id,
      spec,
    );
  }
  async #deleteItemId(id) {
    const schema = this.pgSqlDatabaseClient.getSchema(this.type);
    await schema.deleteItem(id);
  }

  async addItem(spec) {
    await this.upsertItem(spec);

    const item = new ClientItem({
      ...spec,

      client: this,
    });
    const {id} = spec;
    const oldItemIndex = this.items.findIndex(item => item.id === id);
    if (oldItemIndex !== -1) {
      this.items.splice(oldItemIndex, 1, item);
    } else {
      this.items.push(item);
    }

    this.dispatchEvent(new MessageEvent('itemsupdate', {
      data: {
        items: this.items,
      },
    }));
  }
  async deleteId(id) {
    const itemIndex = this.items.findIndex(
      item => item.id === id
    );
    if (itemIndex !== -1) {
      this.items = [...this.items];
      this.items.splice(itemIndex, 1);
      this.dispatchEvent(new MessageEvent('itemsupdate', {
        data: {
          items: this.items,
        },
      }));

      await this.#deleteItemId(id);
    }
  }
  async exportId(id) {
    const item = this.items.find(item => item.id === id);
    if (!item) {
      console.warn('no item found for id', {
        id,
        items: this.items,
      });
      throw new Error('no item found for id: ' + id);
    }
    // console.log('export item', item);
    const content = structuredClone(item.content);

    const zip = new JSZip();

    for (const [dataKey, dataType] of this.dataUrlKeys) {
      const url = content[dataKey];

      const res = await fetch(url);
      const blob = await res.blob();
      blob.name = `${dataKey}.bin`;

      zip.file(blob.name, blob);

      content[dataKey] = blob.name;
    }

    // content
    const contentFile = new Blob([
      JSON.stringify(content, null, 2),
    ], {
      type: 'application/' + this.type,
    });
    contentFile.name = this.type + '.' + this.type;
    zip.file(contentFile.name, contentFile);

    // .metaversefile
    const metaverseFile = new Blob([
      JSON.stringify({
        start_url: contentFile.name,
      }, null, 2),
    ], {
      type: 'application/json',
    });
    metaverseFile.name = '.metaversefile';
    zip.file(metaverseFile.name, metaverseFile);

    // export zip file
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
    return zipBlob;
  }
  async importItem(blob) {
    const userId = await this.supabaseFsWorker.getUserId();

    const zip = await JSZip.loadAsync(blob);

    // metaversefile
    const metaverseFile = zip.file('.metaversefile');
    if (!metaverseFile) {
      throw new Error('missing .metaversefile');
    }
    const metaverseFileString = await metaverseFile.async('string');
    const metaverseSpec = JSON.parse(metaverseFileString);
    if (typeof metaverseSpec !== 'object' || !metaverseSpec) {
      throw new Error('invalid .metaversefile shape');
    }
    // const {id} = metaverseSpec;
    // if (typeof id !== 'string' || !id) {
    //   throw new Error('invalid .metaversefile id');
    // }

    const id = crypto.randomUUID();

    // upload start_url to supabase
    let contentBlob = null;
    {
      const {
        start_url,
      } = metaverseSpec;
      if (/^(?:[a-z0-9]:)/i.test(start_url)) {
        const res = await fetch(start_url);
        if (res.ok) {
          contentBlob = await res.blob();
        } else {
          throw new Error('failed to fetch start_url: ' + res.status + ' : ' + start_url);
        }
      } else {
        const contentFile = zip.file(start_url);
        if (!contentFile) {
          throw new Error('missing start_url: ' + start_url);
        }
        const contentArrayBuffer = await contentFile.async('arraybuffer');
        contentBlob = new Blob([contentArrayBuffer], {
          type: 'application/' + this.type,
        });
      }
      contentBlob.name = start_url;

      const url = await this.supabaseFsWorker.writeFile([
        userId,
        id,
        contentBlob.name,
      ], contentBlob);

      metaverseSpec.start_url = url;
    }

    // content file
    const contentBlobString = await contentBlob.text();
    const spec = JSON.parse(contentBlobString);

    // upload data to supabase
    for (const [dataKey, dataType] of this.dataUrlKeys) {
      const p = spec[dataKey];
      if (!p) {
        throw new Error('missing data key: ' + dataKey);
      }
      const dataFile = zip.file(p);
      const dataArrayBuffer = await dataFile.async('arrayBuffer');
      const dataBlob = new Blob([dataArrayBuffer], {
        type: dataType,
      });

      const url = await this.supabaseFsWorker.writeFile([
        userId,
        id,
        `${dataKey}.bin`,
      ], dataBlob);
      // console.log('write url', [
      //   userId,
      //   id,
      //   `${dataKey}.bin`,
      // ], {
      //   dataType,
      // });

      spec[dataKey] = url;
    }

    // console.log('upsert spec 1', id, spec);
    const schema = this.pgSqlDatabaseClient.getSchema(this.type);
    await schema.setItem(id, spec);
    // console.log('upsert spec 2', spec);
  }
}