import faceposes from '../managers/emote/faceposes.json';
import emotes from '../managers/companion-emote/emotes.json';
import {
  defaultParserSpecs,
} from '../ai-agent/parsers/parsers.js';

//

export const MAX_SHORT_TERM_MEMORIES = 50;

export const canvasDimensions = [300, 400];

const miniCanvasWidth = 120;
export const miniCanvasDimensions = [
  miniCanvasWidth,
  miniCanvasWidth * (canvasDimensions[1] / canvasDimensions[0]),
];

const megaCanvasWidth = 600;
export const megaCanvasDimensions = [
  megaCanvasWidth,
  megaCanvasWidth * (canvasDimensions[1] / canvasDimensions[0]),
];

const pokemonCardDimensions = [
  2.5,
  3.5,
];
const cardWidth = 1024;
export const cardDimensions = [
  cardWidth,
  cardWidth * (pokemonCardDimensions[1] / pokemonCardDimensions[0]),
];

//

export const llmModels = {
  openai: [
    'gpt-4',
    'gpt-3.5-turbo',
  ],
};
const defaultLlmType = Object.keys(llmModels)[0];
const defaultLlmName = llmModels[defaultLlmType][0];
export const defaultLlmModel = `${defaultLlmType}:${defaultLlmName}`;

//

export const embeddingDimensions = 1536;
export const maxVectorDatabaseElements = 10000;

export const CHUNK_SIZE = 10 * 1024 *1024; // 10 MB chunk size (adjust as needed)

//

export const defaultParser = defaultParserSpecs[0].name;

export const imageModels = {
  stablediffusion: [
    'anything-v3',
  ],
};
const defaultImageType = Object.keys(imageModels)[0];
const defaultImageName = imageModels[defaultImageType][0];
export const defaultImageModel = `${defaultImageType}:${defaultImageName}`;

export const defaultCameraUvw = [0, 0, 0.9];

export const validMoods = faceposes.map(f => f.name);

export const validEmotions = emotes.map(e => e.name);

//

export const defaultSkyboxPrompt = 'night scene, japanese sakura tree school path, neon lights glyphs';