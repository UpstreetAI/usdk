import {
  // AbstractClientOld,
  AbstractClient,
} from './abstract-client.js';

//

// const musicSchemaName = 'music';
const musicType = 'music';
const dataUrlKeys = [
  ['audioUrl', 'audio/mpeg'],
];

//

// export class MusicClientOld extends AbstractClientOld {
//   constructor({
//     fileDatabaseClient,
//   }) {
//     super({
//       fileDatabaseClient,
//       schemaName: musicSchemaName,
//       type: musicType,
//       dataUrlKeys,
//     });
//   }
// }
export class MusicClient extends AbstractClient {
  constructor({
    pgSqlDatabaseClient,
    supabaseFsWorker,
  }) {
    super({
      pgSqlDatabaseClient,
      supabaseFsWorker,
      type: musicType,
      dataUrlKeys,
    });
  }
}