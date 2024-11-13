import {
  characterSpecs,
} from './character-specs.js';
import {
  defaultSkillSpecs,
} from '../ai-agent/skills/skills.js';

//

const characterSchemaName = 'character';
const characterMetadataSchemaName = 'character-metadata';
const characterMetadataId = 0;
const schemas = [
  characterMetadataSchemaName,
  characterSchemaName,
];
const characterDefaults = {
  skills: defaultSkillSpecs.map(skill => skill.name),
};
const schemaInitializerFns = {
  async 'character'(characterClient) {
    const promises = [];
    for (let i = 0; i < characterSpecs.length; i++) {
      const characterSpec = characterSpecs[i];
      const promise = characterClient.upsertCharacter({
        ...characterDefaults,
        ...characterSpec,
      });
      promises.push(promise);
    }
    await Promise.all(promises);
  },
  async 'character-metadata'(characterClient) {
    const currentCharacterIds = [
      characterSpecs[0].id,
      // characterSpecs[4].id,
    ];
    await characterClient.setCurrentCharacterIds(currentCharacterIds);
  },
};

//

class CharacterIdentity extends EventTarget {
  constructor({
    spec,
    characterClient,
  }) {
    super();

    this.spec = spec;
    this.characterClient = characterClient;
  }
  async setCharacterAttribute(key, value) {
    this.spec[key] = value;

    this.dispatchEvent(new MessageEvent('characterupdate', {
      data: {
        key,
        value,
      },
    }));

    await this.characterClient.upsertCharacter(this.spec);
  }
}

//

export class CharacterClient extends EventTarget {
  constructor({
    fileDatabaseClient,
  }) {
    super();

    this.fileDatabaseClient = fileDatabaseClient;

    this.characterIdentities = [];
    this.loadPromise = null;
  }

  async waitForLoad() {
    if (!this.loadPromise) {
      this.loadPromise = (async () => {
        const _ensureSchema = async schemaName => {
          const schema = await this.fileDatabaseClient.ensureSchema(schemaName);
          const size = await schema.getSize();
          if (size === 0) {
            const schemaInitializerFn = schemaInitializerFns[schemaName];
            await schemaInitializerFn(this);
          }
        };
        await Promise.all(schemas.map(_ensureSchema));

        const [
          characterIdentities,
          currentCharacterIds,
        ] = await Promise.all([
          this.#getCharacterIdentities(),
          this.#getCurrentCharacterIds(),
        ]);
        this.characterIdentities = characterIdentities;
        this.dispatchEvent(new MessageEvent('characteridentitiesupdate', {
          data: {
            characterIdentities,
          },
        }));

        this.currentCharacterIds = currentCharacterIds;
        this.dispatchEvent(new MessageEvent('currentcharacteridsupdate', {
          data: {
            currentCharacterIds,
          },
        }));
      })();
    }
    return await this.loadPromise;
  }
  async clearCharacters() {
    const _clearSchema = async schemaName => {
      const schema = this.fileDatabaseClient.getSchema(schemaName);
      if (schema) {
        await schema.clear();
      }
    };
    await Promise.all(schemas.map(_clearSchema));
  }

  // database getters
  async #getCharacterIdentities() {
    const schema = this.fileDatabaseClient.getSchema(characterSchemaName);
    let characterDatas;
    characterDatas = await schema.readAll();
    characterDatas = characterDatas.sort((a, b) => {
      return a.id - b.id;
    });

    const characterIdentities = characterDatas.map(spec => new CharacterIdentity({
      spec,
      characterClient: this,
    }));
    return characterIdentities;
  }
  async #getCurrentCharacterIds() {
    const schema = this.fileDatabaseClient.getSchema(characterMetadataSchemaName);
    let characterIdsSpec;
    characterIdsSpec = await schema.getFile(characterMetadataId);
    if (characterIdsSpec) {
      return characterIdsSpec.characterIds;
    } else {
      return [];
    }
  }

  // set in database
  async upsertCharacter(character) {
    const schema = this.fileDatabaseClient.getSchema(characterSchemaName);
    await schema.setFile(
      character.id,
      character,
    );
  }
  async #deleteCharacterId(characterId) {
    const schema = this.fileDatabaseClient.getSchema(characterSchemaName);
    await schema.deleteFile(characterId);
  }

  // new character addition
  async addCharacter(spec) {
    await this.upsertCharacter(spec);

    const characterIdentity = new CharacterIdentity({
      spec,
      characterClient: this,
    });
    this.characterIdentities.push(characterIdentity);

    this.dispatchEvent(new MessageEvent('characteridentitiesupdate', {
      data: {
        characterIdentities: this.characterIdentities,
      },
    }));
  }
  async setCurrentCharacterIds(characterIds) {
    this.currentCharacterIds = [
      ...characterIds,
    ];

    this.dispatchEvent(new MessageEvent('currentcharacteridsupdate', {
      data: {
        characterIds,
      },
    }));

    const value = {
      characterIds,
    };
    const schema = this.fileDatabaseClient.getSchema(characterMetadataSchemaName);
    await schema.setFile(
      characterMetadataId,
      value,
    );
  }
  async deleteCharacterId(characterId) {
    const characterIdentityIndex = this.characterIdentities.findIndex(
      characterIdentity => characterIdentity.spec.id === characterId
    );
    if (characterIdentityIndex !== -1) {
      const isActive = this.currentCharacterIds.includes(characterId);
      if (isActive) {
        console.warn('cannot remove active character; turn off this character first');
      } else {
        this.characterIdentities = [...this.characterIdentities];
        this.characterIdentities.splice(characterIdentityIndex, 1);
        this.dispatchEvent(new MessageEvent('characteridentitiesupdate', {
          data: {
            characterIdentities: this.characterIdentities,
          },
        }));

        await this.#deleteCharacterId(characterId);
      }
    } else {
      console.warn('character not found', characterId);
      debugger;
    }
  }
}
