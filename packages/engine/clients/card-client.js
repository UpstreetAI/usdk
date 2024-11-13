import {
  AbstractClient,
} from './abstract-client.js';

//

const cardType = 'card';
const dataUrlKeys = [
  ['cardImageUrl', 'image/png'],
];

//

export class CardClient extends AbstractClient {
  constructor({
    pgSqlDatabaseClient,
    supabaseFsWorker,
  }) {
    super({
      pgSqlDatabaseClient,
      supabaseFsWorker,
      type: cardType,
      dataUrlKeys,
    });
  }
}
