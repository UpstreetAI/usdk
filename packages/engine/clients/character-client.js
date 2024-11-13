import {
  // AbstractClientOld,
  AbstractClient,
} from './abstract-client.js';

//

// const characterSchemaName = 'character';
const characterType = 'character360';
const dataUrlKeys = [
  ['character360ImageUrl', 'image/png'],
  ['characterEmotionUrl', 'image/png'],
  ['characterImageUrl', 'image/png'],
];

//

export class CharacterClient extends AbstractClient {
  constructor({
    pgSqlDatabaseClient,
    supabaseFsWorker,
  }) {
    super({
      pgSqlDatabaseClient,
      supabaseFsWorker,
      type: characterType,
      dataUrlKeys,
    });
  }
}