import {
  // AbstractClientOld,
  AbstractClient,
} from './abstract-client.js';

//

// const scenesSchemaName = 'items';
const scenesType = 'items';
const dataUrlKeys = [
  ['previewUrl', 'image/png'],
];

//

// export class ScenesClientOld extends AbstractClientOld {
//   constructor({
//     fileDatabaseClient,
//   }) {
//     super({
//       fileDatabaseClient,
//       schemaName: scenesSchemaName,
//       type: scenesType,
//       dataUrlKeys,
//     });
//   }
// }
export class ScenesClient extends AbstractClient {
  constructor({
    pgSqlDatabaseClient,
    supabaseFsWorker,
  }) {
    super({
      pgSqlDatabaseClient,
      supabaseFsWorker,
      type: scenesType,
      dataUrlKeys,
    });
  }
}