import {
  // AbstractClientOld,
  AbstractClient,
} from './abstract-client.js';

//

// const skyboxSchemaName = 'skybox';
const skyboxType = 'blockadelabsskybox';
const dataUrlKeys = [
  ['fileUrl', 'image/png'],
  ['depthMapUrl', 'image/png'],
];

//

// export class SkyboxClientOld extends AbstractClientOld {
//   constructor({
//     fileDatabaseClient,
//   }) {
//     super({
//       fileDatabaseClient,
//       schemaName: skyboxSchemaName,
//       type: skyboxType,
//       dataUrlKeys,
//     });
//   }
// }
export class SkyboxClient extends AbstractClient {
  constructor({
    pgSqlDatabaseClient,
    supabaseFsWorker,
  }) {
    super({
      pgSqlDatabaseClient,
      supabaseFsWorker,
      type: skyboxType,
      dataUrlKeys,
    });
  }
}