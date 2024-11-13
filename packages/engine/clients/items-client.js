import {
  // AbstractClientOld,
  AbstractClient,
} from './abstract-client.js';

//

// const itemsSchemaName = 'items';
const itemsType = 'item360';
const dataUrlKeys = [
  ['itemImageUrl', 'image/png'],
  ['item360ImageUrl', 'image/png'],
];

//

// export class ItemsClientOld extends AbstractClientOld {
//   constructor({
//     fileDatabaseClient,
//   }) {
//     super({
//       fileDatabaseClient,
//       schemaName: itemsSchemaName,
//       type: itemsType,
//       dataUrlKeys,
//     });
//   }
// }
export class ItemsClient extends AbstractClient {
  constructor({
    pgSqlDatabaseClient,
    supabaseFsWorker,
  }) {
    super({
      pgSqlDatabaseClient,
      supabaseFsWorker,
      type: itemsType,
      dataUrlKeys,
    });
  }
}