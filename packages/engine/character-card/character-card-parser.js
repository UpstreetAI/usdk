// const fs = require('fs');
// const json5 = require('json5');
// const ExifReader = require('exifreader');
// const extract = require('png-chunks-extract');
// const PNGtext = require('png-chunk-text');

import json5 from 'json5';
import ExifReader from 'exifreader';
import extract from 'png-chunks-extract';
import PNGtext from 'png-chunk-text';

import {base64decode} from '../utils/base64.js';

const utf8Decode = new TextDecoder('utf-8', { ignoreBOM: true });

export async function parse(file, format) {
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