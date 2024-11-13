// import {
//   removeBackground,
// } from '../../clients/background-removal-client.js';
// import * as vqa from '../../vqa.js';
// import {
//   generate360Views,
//   drawSlices,
// } from '../../clients/zero123-client.js';
// import {
//   blob2img,
// } from '../../../gen/src/utils/convert-utils.js';
import {
  SupabaseFsWorker,
} from '../../supabase-fs-worker.js';
import {
  generateCharacterAuxFromFile,
  generateCharacterBaseFromPrompt,
} from '../character/character-generator.js';
import {
  // generateImage,
  img2img,
  interrogateDeepBooru,
  interrogatePromptGender,
  setSdModel,
} from '../../generate-image.js';
import {
  getScreenshotBlob,
  // heroImageNpcRenderers,
} from '../../preview-screenshot.js';
// import {
//   squareize,
//   makeMaskCanvas,
// } from '../character/character-generator.js';
import {
  squareize,
  makeMaskCanvas,
  makeGradientCanvas,
  opacify,
  makeNoiseBaseCanvas,
} from '../../utils/canvas-utils.js';
// import {
//   downloadFile,
// } from '../../util.js';
import {
  characterPrompt,
  characterLora,
  characterNegativePrompt,
} from '../../constants/model-constants.js';

import {
  makeId,
  // blob2DataUrl,
} from '../../util.js';
// import {
//   zbencode,
//   zbdecode,
// } from '../../../zjs/encoding.mjs';

//

// const characterMagicBytes = 'CHAR';

//

const preprocessCharacterImageFile = async file => {
  const prompt = await interrogateDeepBooru(file);
  const generatedImageBlob = await squareize(file, 512, 0.1);
  return {
    prompt,
    generatedImageBlob,
  };
};
const generateCharacterFromFile = async (generatedImageBlob, prompt, gender, setGenerationStatus, debug) => {
  // console.log('generate character from file', {
  //   generatedImageBlob,
  //   prompt,
  // });

  const character360Result = await generateCharacterAuxFromFile(generatedImageBlob, prompt, setGenerationStatus, debug);
  return character360Result;

  // const {
  //   characterImageBlob,
  //   character360ImageBlob,
  //   characterEmotionBlob,
  // } = character360Result;

  // const characterImageUrl = await blob2DataUrl(characterImageBlob);
  // const character360ImageUrl = await blob2DataUrl(character360ImageBlob);
  // const characterEmotionUrl = await blob2DataUrl(characterEmotionBlob);

  // // zbencode the result
  // const o = {
  //   description: prompt,
  //   gender,
  //   characterImageUrl,
  //   character360ImageUrl,
  //   characterEmotionUrl,
  // };
  // return o;

  // console.log('got o', o);
  // const uint8Array = zbencode(o);
  // console.log('got zbencode result', {
  //   uint8Array,
  // });

  // const resultBlob = new Blob([
  //   characterMagicBytes,
  //   uint8Array,
  // ], {
  //   type: 'application/octet-stream',
  // });
  // // downloadFile(blob, 'character.itemb');
  // return resultBlob;

  // const id = crypto.randomUUID();
  // const description = prompt;
  // const itemItem = {
  //   id,
  //   name,
  //   content: {
  //     name,
  //     description,
  //     characterImageUrl,
  //     character360ImageUrl,
  //     characterEmotionUrl,
  //   },
  // };
  // await characterClient.addItem(itemItem);
};

//

export const generateCharacter = async ({
  prompt,
  gender,
  file,
  setGenerationStatus,
  debug,
}) => {
  if (file) {
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      throw new Error('unsupported image type: ' + file.type);
    }
    setGenerationStatus && setGenerationStatus('Preprocessing...');
    const {
      generatedImageBlob,
      prompt,
    } = await preprocessCharacterImageFile(file);
    setGenerationStatus && setGenerationStatus('Interrogating...');
    if (!gender) {
      gender = await interrogatePromptGender(prompt);
    }
    setGenerationStatus && setGenerationStatus('Generating...');
    const character360Result = await generateCharacterFromFile(generatedImageBlob, prompt, gender, setGenerationStatus, debug);
    return character360Result;

    // // const foregroundBlob = await removeBackground(blob);
    // const size = 512;
    // const paddingFactor = 0.1;
    // const squareBlob = await squareize(blob, size, paddingFactor);
    // const squareImage = await blob2img(squareBlob);
    // squareImage.style.cssText = `\
    //   position: absolute;
    //   top: 0;
    //   left: 0;
    //   width: 512px;
    //   height: 512px;
    //   z-index: 1;
    // `;
    // document.body.appendChild(squareImage);

    // const slices = await generate360Views(squareBlob, {
    //   debug: true,
    // });
    // const canvas = drawSlices(slices);

    // // export frame canvas
    // const item360Blob = await new Promise((accept, reject) => {
    //   canvas.toBlob(accept, 'image/png');
    // });
    // const item360ImageUrl = await blob2DataUrl(item360Blob);

    // const itemImageUrl = await blob2DataUrl(squareBlob);

    // const id = crypto.randomUUID();
    // const description = boardTags;
    // const itemItem = {
    //   id,
    //   name,
    //   content: {
    //     description,
    //     itemImageUrl,
    //     item360ImageUrl,
    //     scale: 1, // XXX compute the real scale via LLM
    //   },
    // };
    // await characterClient.addItem(itemItem);
  } else {
    if (!gender) {
      gender = await interrogatePromptGender(prompt);
    }
    
    // const fullPrompt = [
    //   gender === 'male' ? '1boy' : '1girl',
    //   clothes,
    //   expression,
    //   'white background',
    // ].filter(s => !!s).join(', ');

    const fullPrompt = (characterLora ? (characterLora + ' ') : '') + [
      prompt,
      // gender === 'male' ? '1boy' : '1girl',
      gender,
      characterPrompt,
    ].join(', ');
    console.log('generate from prompt', {prompt, gender, fullPrompt});

    const generatedImageBlob = await generateCharacterBaseFromPrompt({
      prompt: fullPrompt,
      negativePrompt: characterNegativePrompt,
      gender,
    });
    const character360Result = await generateCharacterFromFile(generatedImageBlob, prompt, gender, setGenerationStatus, debug);
    return character360Result;
  }
};
export const batchGenerateCharacters = async (files) => {
  // console.log('batch generate characters', {files});

  for (const file of files) {
    const {
      generatedImageBlob,
      prompt,
    } = await preprocessCharacterImageFile(file);
    await generateCharacterFromFile(generatedImageBlob, prompt);
  }
};

export const generateCharacterAsset = async ({
  prompt,
  gender,

  file,

  name,
  description = prompt,
  supabaseClient,
  sessionUserId,

  debug,
  setGenerationStatus,
}) => {
  const character360Result = await generateCharacter({
    prompt,
    gender,

    file,

    debug,
    setGenerationStatus,
  });
  console.log('got character360 result', character360Result);
  const {
    characterImageBlob,
    character360ImageBlob,
    characterEmotionBlob,
  } = character360Result;

  const id = crypto.randomUUID();
  setGenerationStatus && setGenerationStatus('Uploading files...');

  const supabaseFsWorker = new SupabaseFsWorker({
    supabase: supabaseClient.supabase,
    bucketName: 'public',
  });

  const [
    characterImageUrl,
    character360ImageUrl,
    characterEmotionUrl,
  ] = await Promise.all([
    (async () => {
      const fileName = 'image.png';
      const keyPath = ['character360', id].concat(fileName);
      const start_url = await supabaseFsWorker.writeFile(keyPath, characterImageBlob);
      return start_url;
    })(),
    (async () => {
      const fileName = 'image360.png';
      const keyPath = ['character360', id].concat(fileName);
      const start_url = await supabaseFsWorker.writeFile(keyPath, character360ImageBlob);
      return start_url;
    })(),
    (async () => {
      const fileName = 'emotions.png';
      const keyPath = ['character360', id].concat(fileName);
      const start_url = await supabaseFsWorker.writeFile(keyPath, characterEmotionBlob);
      return start_url;
    })(),
  ]);

  const character360Json = {
    name,
    description,
    characterImageUrl,
    character360ImageUrl,
    characterEmotionUrl,
  };
  console.log('save json 1', character360Json);
  const character360JsonString = JSON.stringify(character360Json);
  const character360JsonBlob = new Blob([
    character360JsonString,
  ], {
    type: 'application/json',
  });

  const previewBlob = await getScreenshotBlob(character360JsonBlob, 'character360');
  const previewFileName = `preview-${makeId(8)}.png`;
  const previewKeyPath = ['character360', id].concat(previewFileName);
  const preview_url = await supabaseFsWorker.writeFile(previewKeyPath, previewBlob);

  const character360Json2 = {
    ...character360Json,
    preview_url,
  };
  console.log('save json 2', character360Json2);
  const character360JsonString2 = JSON.stringify(character360Json2);
  const character360JsonBlob2 = new Blob([
    character360JsonString2,
  ], {
    type: 'application/json',
  });

  const fileName = 'character.character360';
  const keyPath = ['character360', id].concat(fileName);
  const character360JsonUrl = await supabaseFsWorker.writeFile(keyPath, character360JsonBlob2);

  const character360Asset = {
    id,
    name,
    description,
    type: 'character360',
    preview_url,
    start_url: character360JsonUrl,
    user_id: sessionUserId,
  };
  const result = await supabaseClient.supabase
    .from('assets')
    .upsert(character360Asset);

  return character360Asset;
}