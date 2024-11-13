import {
  AbstractClient,
} from './abstract-client.js';

//

const vrmType = 'vrm';
const dataUrlKeys = [
  ['vrmUrl', 'application/vrm'],
];

//

export class VrmClient extends AbstractClient {
  constructor({
    pgSqlDatabaseClient,
    supabaseFsWorker,
  }) {
    super({
      pgSqlDatabaseClient,
      supabaseFsWorker,
      type: vrmType,
      dataUrlKeys,
    });
  }
}