import json5 from 'json5';
import ExifReader from 'exifreader';
import extract from 'png-chunks-extract';
import PNGtext from 'png-chunk-text';
import * as Cards from 'character-card-utils';
import { base64decode } from './base64.js';

const utf8Decode = new TextDecoder('utf-8', { ignoreBOM: true });

async function parse(file, format) {
  let fileFormat;
  if (format === undefined) {
    if (file.name.indexOf('.webp') !== -1)
      fileFormat = 'webp';
    else
      fileFormat = 'png';
  }
  else
    fileFormat = format;

  switch (fileFormat) {
    case 'webp':
      try {
        const arrayBuffer = await file.arrayBuffer();
        const exif_data = await ExifReader.load(arrayBuffer);
        let char_data;

        if (exif_data['UserComment']['description']) {
          let description = exif_data['UserComment']['description'];
          if (description === 'Undefined' && exif_data['UserComment'].value && exif_data['UserComment'].value.length === 1) {
            description = exif_data['UserComment'].value[0];
          }

          try {
            json5.parse(description);
            char_data = description;
          } catch {
            const byteArr = description.split(",").map(Number);
            const uint8Array = new Uint8Array(byteArr);
            const char_data_string = utf8Decode.decode(uint8Array);
            char_data = char_data_string;
          }
        }
        else {
          console.log('No description found in EXIF data.');
          return false;
        }

        return char_data;
      }
      catch (err) {
        console.log(err);
        return false;
      }
    case 'png':
      // const buffer = fs.readFileSync(cardUrl);
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const chunks = extract(uint8Array);

      const textChunks = chunks.filter(function (chunk) {
        return chunk.name === 'tEXt';
      }).map(function (chunk) {
        return PNGtext.decode(chunk.data);
      });

      // return Buffer.from(textChunks[0].text, 'base64').toString('utf8');
      // convert to string using pure web
      return textChunks[0] ? base64decode(textChunks[0].text) : null;
    default:
      break;
  }
};

//

export class CharacterCardParser {
  async parse(file) {
    const metadataString = await parse(file);
    const metadata = JSON.parse(metadataString);
    const {
      success,
      error,
      data,
    } = Cards.safeParseToV2(metadata);
    if (success) {
      return data;
    } else {
      // console.warn('data fail', {
      //   success,
      //   error,
      //   data,
      // });
      throw new Error(error);
    }
  }
}
export class LorebookParser {
  async parse(file) {
    const metadataString = await parse(file);
    const metadata = JSON.parse(metadataString);
    return metadata;
  }
}