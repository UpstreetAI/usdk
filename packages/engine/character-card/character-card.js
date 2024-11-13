import * as characterCardParser from './character-card-parser.js';
import * as Cards from 'character-card-utils';

//

export class CharacterCardParser {
  async parse(file) {
    const metadataString = await characterCardParser.parse(file);
    const metadata = JSON.parse(metadataString);
    const {
      success,
      error,
      data,
    } = Cards.safeParseToV2(metadata);
    if (success) {
      return data;
    } else {
      console.warn('data fail', {
        success,
        error,
        data,
      });
      throw new Error(error);
    }
  }
}
export class LorebookParser {
  async parse(file) {
    const metadataString = await characterCardParser.parse(file);
    const metadata = JSON.parse(metadataString);
    return metadata;
  }
}