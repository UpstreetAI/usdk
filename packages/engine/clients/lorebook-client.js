import {
  // AbstractClientOld,
  AbstractClient,
} from './abstract-client.js';

//

// const characterSchemaName = 'character';
const lorebookType = 'lorebook';
const dataUrlKeys = [
  ['lorebookImageUrl', 'image/png'],
];

//

export class LorebookClient extends AbstractClient {
  constructor({
    pgSqlDatabaseClient,
    supabaseFsWorker,
  }) {
    super({
      pgSqlDatabaseClient,
      supabaseFsWorker,
      type: lorebookType,
      dataUrlKeys,
    });
  }
}