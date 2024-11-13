import {
  AbstractClient,
} from './abstract-client.js';

//

const worldsSchemaName = 'worlds';
const schemas = [
  worldsSchemaName,
];

//

export class WorldIdentity extends EventTarget {
  constructor({
    spec,
    worldsClient,
  }) {
    super();

    this.spec = spec;
    this.worldsClient = worldsClient;
  }
  async setWorldAttribute(key, value) {
    this.spec[key] = value;

    this.dispatchEvent(new MessageEvent('worldupdate', {
      data: {
        keys: [key],
      },
    }));

    await this.worldsClient.upsertWorld(this.spec);
  }
  async setWorldAttributes(attributes) {
    const keys = [];
    for (const key in attributes) {
      const value = attributes[key];
      this.spec[key] = value;

      keys.push(key);
    }

    this.dispatchEvent(new MessageEvent('worldupdate', {
      data: {
        keys,
      },
    }));

    await this.worldsClient.upsertWorld(this.spec);
  }
}

//

export class WorldsClient extends AbstractClient {
  constructor({
    fileDatabaseClient,
  }) {
    super({
      schemaName: worldsSchemaName,
      fileDatabaseClient,
      getItemId: spec => spec.source.id,
    });

    this.loadPromise = null;
  }
}
