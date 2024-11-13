import * as THREE from 'three';
import {
  RawFile,
  StegImage,
  // utils,
} from 'steg';
import {
  makeId,
  makeIntId,
  // downloadFile,
} from '../util.js';
import {
  NpcPlayer,
} from '../character-controller.js';
import {
  CompanionRenderSpec,
} from '../renderers/companion-renderer.js';
import {
  canvasDimensions,
  megaCanvasDimensions,
  cardDimensions,
  llmModels,
  imageModels,
  CHUNK_SIZE,
  defaultCameraUvw,
} from '../constants/companion-constants.js';
import {
  characterSpecs,
} from '../clients/character-specs.js';
import {
  fileServerUrl,
} from '../endpoints.js';
// import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {minFov} from '../constants.js';
// import {
//   zbencode,
//   zbdecode,
// } from '../packages/zjs/encoding.mjs';

//

export const loadNpcPlayer = async (playerSpec, {
  voices = null,
  sounds = null,
  audioManager = null,
  environmentManager = null,
  importManager = null,
  appContextFactory = null,
  physicsTracker = null,
} = {}) => {
  playerSpec = {
    ...playerSpec,
  };

  const playerId = makeId(5);
  const npcPlayer = new NpcPlayer({
    playerId,
    voices,
    sounds,
    audioManager,
    environmentManager,
    importManager,
    appContextFactory,
    physicsTracker,
  });

  await npcPlayer.setPlayerSpec(playerSpec);

  const {
    avatar,
  } = npcPlayer;

  npcPlayer.position.y = avatar.height;
  npcPlayer.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
  npcPlayer.updateMatrixWorld();

  npcPlayer.characterPhysics.update = () => {};

  return npcPlayer;
};
const blob2DataUrl = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

export const encryptionKey = new Uint8Array(32).fill(0);

export const exportNpcPlayer = async (playerSpec, npcLoader, companionRenderer) => {
  // if (Math.random() < 0.5) {
  //   const newAction = {
  //     type: 'facepose',
  //     emotion: 'joy',
  //     value: 1,
  //     // duration: 10,
  //     // fadeIn: null,
  //     // fadeIn: 0.0001,
  //     // fadeOut: 0.0001,
  //   };
  //   const action = npcPlayer2.actionManager.addAction(newAction);
  // }

  const cardNames = [
    'wiki_card_template.svg',
    'card_concept.svg',
  ];
  const imageIds = [
    'mainImage',
    'mainImage',
  ];
/*
Top Mana (both must be same value ):
- #manaValue
- #manaValue2 ( stroke )
Top Health (both must be same value ):
- healthValue
- healthValue2 ( stroke )
Stats:
- Atk: #statsAtk
- Def: #statsDef
- Vit: #statsVit
- Dex: #statsDex
- Spir: #statsSpir
- Luck: #statsLuck
Format (both must be same value ):
- #fileFormat
- #fileFormat2 (stroke)
Main Image ( base64 string )
- #mainImage
*/
  const cardIndex = 0;
  const cardName = cardNames[cardIndex];
  const imageId = imageIds[cardIndex];

  const cardUrl = `/images/cards/${cardName}`;
  const res = await fetch(cardUrl);
  const svgText = await res.text();

  // Create a new DOMParser instance
  const parser = new DOMParser();

  // Parse the SVG string into a DOM object
  const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

  // Extract the SVG element from the DOM object
  const svgElement = svgDoc.documentElement;
  // document.body.appendChild(svgElement);

  const imageElement = svgElement.querySelector('#' + imageId);
  const imageDimensions = [
    parseFloat(imageElement.getAttribute('width')),
    parseFloat(imageElement.getAttribute('height')),
  ];

  const width = megaCanvasDimensions[0];
  const height = megaCanvasDimensions[0] * (imageDimensions[1] / imageDimensions[0]);

  // render avatar image
  const avatarImageUrl = await (async () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const npcPlayer = await npcLoader.loadNpcPlayer(playerSpec, 'util');
    const avatarScene = npcPlayer.avatar.avatarQuality.scene;
    const oldParent = avatarScene.parent;

    const newCompanionRenderSpec = new CompanionRenderSpec({
      npcPlayer,
      companionRenderer,
      canvasContext: canvas.getContext('2d'),
      cameraUvw: defaultCameraUvw,
      cameraFov: minFov,
    });
    newCompanionRenderSpec.emoteManager.backgroundManager.setBackground('grass');

    companionRenderer.addCompanionRenderSpec(newCompanionRenderSpec);

    {
      companionRenderer.render();
    }

    oldParent && oldParent.add(avatarScene);
    // const blob = await offscreenCanvas.convertToBlob();
    const blob = await new Promise((accept, reject) => {
      canvas.toBlob(blob => {
        accept(blob);
      });
    });
    const u = await blob2DataUrl(blob);

    companionRenderer.removeCompanionRenderSpec(newCompanionRenderSpec);
    npcPlayer.destroy();

    return u;
  })();
  imageElement.setAttribute('xlink:href', avatarImageUrl);

  // XXX debug output
//   {
//     const renderWidth = 500;
//     const cardPreviewSize = [
//       renderWidth,
//       renderWidth * (cardDimensions[1] / cardDimensions[0]),
//     ];

//     svgElement.style.cssText = `\
// position: fixed;
// top: 0;
// left: 0;
// width: ${cardPreviewSize[0]}px;
// height: ${cardPreviewSize[1]}px;
// `;
//     document.body.appendChild(svgElement);
//   }

  // render svg to image
  const renderCardImage = await (async () => {
    const canvas = document.createElement('canvas');
    canvas.width = cardDimensions[0];
    canvas.height = cardDimensions[1];
    // const canvas = new OffscreenCanvas(cardDimensions[0], cardDimensions[1]);
    const ctx = canvas.getContext('2d');

    // serialize the svg element to string
    const svgText = new XMLSerializer().serializeToString(svgElement);
    // const svg = new Blob([svgText], {type: 'image/svg+xml;charset=utf-8'});
    // const imageBitmap = await createImageBitmap(svg);
    const svgImage = await new Promise((accept, reject) => {
      const image = new Image();
      image.onload = () => {
        accept(image);
      };
      image.onerror = reject;
      image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
    });
    ctx.drawImage(svgImage, 0, 0, cardDimensions[0], cardDimensions[1]);

    return canvas;

    // const blob = await canvas.convertToBlob();
    // const arrayBuffer = await blob.arrayBuffer();
    // const data = new Uint8Array(arrayBuffer);
    // return data;
  })();

  // stegonographically encode the card details
  const stegoCardBlob = await (async () => {
    // const fileContents = new Uint8Array(1024 * 1024 * 1);
    // for (let i = 0; i < fileContents.length; i++) {
    //   fileContents[i] = i % 256;
    // }

    const newPlayerSpec = {
      ...playerSpec,
    };
    // random integer within javascript whole number range
    newPlayerSpec.id = makeIntId();
    const playerSpecJsonData = new TextEncoder().encode(JSON.stringify(newPlayerSpec));
    const bitsTaken = 1;

    const file = new RawFile(playerSpecJsonData, 'playerSpec.json');
    // const encryptionKey = crypto.getRandomValues(new Uint8Array(32));
    // const encryptionKey = crypto.getRandomValues(new Uint8Array(32).fill(0));

    const png = new StegImage(renderCardImage);
    const hiddenPngUrl = await png.hide(file, encryptionKey, bitsTaken);
    const resultBlob = await (async () => {
      const res = await fetch(hiddenPngUrl);
      return res.blob();
    })();
    return resultBlob;
  })();

  // download resulting image file
  const cardFile = new Blob([
    stegoCardBlob,
  ], {
    type: 'image/png',
  });
  return cardFile;

  // export
  // const avatarData = await (async () => {
  //   const {avatarUrl} = npcPlayer2.playerSpec;
  //   const res = await fetch(avatarUrl);
  //   const arrayBuffer = await res.arrayBuffer();
  //   const data = new Uint8Array(arrayBuffer);
  //   return data;
  // })();
  // const fileData = zbencode({
  //   playerSpec: npcPlayer2.playerSpec,
  //   avatarData,
  // });
  //
  // compress with web streams
  // const compressedFileData = await (async () => {
  //   const compressionStream = new CompressionStream('gzip');
  //   const compressedFileData = await new Promise((accept, reject) => {
  //     const reader = compressionStream.readable.getReader();
  //     const chunks = [];
  //     let size = 0;
  //     reader.read().then(function processResult({done, value}) {
  //       if (done) {
  //         const data = new Uint8Array(size);
  //         let offset = 0;
  //         for (const chunk of chunks) {
  //           data.set(chunk, offset);
  //           offset += chunk.length;
  //         }
  //         accept(data);
  //         return;
  //       }
  //       chunks.push(value);
  //       size += value.length;
  //       return reader.read().then(processResult);
  //     });
  //     const writer = compressionStream.writable.getWriter();
  //     writer.write(fileData);
  //     writer.close();
  //   });
  //   return compressedFileData;
  // })();
  // console.log('encode card', {
  //   // renderCardData,
  //   compressedFileData,
  // });
};

//

export const importCardBlob = async (blob, characterClient) => {
  const image2 = await new Promise((accept, reject) => {
    const img = new Image();
    img.onload = () => {
      accept(img);
      cleanup();
    };
    img.onerror = err => {
      console.warn(err);
      reject(err);
      cleanup();
    };
    img.crossOrigin = 'anonymous';
    const u = URL.createObjectURL(blob);
    img.src = u;
    const cleanup = () => {
      URL.revokeObjectURL(u);
    };
  });
  // console.log('got image', image2);
  const png2 = new StegImage(image2);
  // console.log('got png', png2);
  // try {
    const revealRawFile = await png2.reveal(encryptionKey);
  // } catch (err) {
  //   console.warn('error revealing', err.stack, err.message);
  //   throw err;
  // }
  // console.log('reveal 0', revealRawFile);
  const revealRawData = revealRawFile.data;
  // console.log('reveal 1', revealRawData);
  const playerSpecString = new TextDecoder().decode(revealRawData);
  // console.log('reveal 2', playerSpecString);
  const playerSpecJson = (() => {
    try {
      return JSON.parse(playerSpecString);
    } catch (err) {
      console.warn(err);
      return null;
    }
  })();
  // console.log('reveal 3', playerSpecJson);
  if (playerSpecJson) {
    console.log('add character', playerSpecJson);
    await characterClient.addCharacter(playerSpecJson);
    await characterClient.setCurrentCharacterIds([playerSpecJson.id]);
  }
};
export const importVrmUrl = async (avatarUrl, characterClient) => {
  const playerSpec = {};
  const firstCharacterSpec = characterSpecs[0];
  for (const k in firstCharacterSpec) {
    const v = firstCharacterSpec[k];
    if (typeof v === 'string') {
      playerSpec[k] = '';
    } else if (typeof v === 'number') {
      playerSpec[k] = 0;
    } else if (typeof v === 'boolean') {
      playerSpec[k] = false;
    } else {
      console.warn('unknown character spec key type', k, v);
      debugger;
    }
  }
  playerSpec.id = makeIntId();
  playerSpec.name = 'New Character';
  playerSpec.bio = 'A mysterious person. You should ask about them.';
  playerSpec.avatarUrl = avatarUrl;
  // playerSpec.llmModel = llmModels[Object.keys(llmModels)[0]][0];
  // playerSpec.imageModel = imageModels[Object.keys(imageModels)[0]][0];

  await characterClient.addCharacter(playerSpec);
  await characterClient.setCurrentCharacterIds([playerSpec.id]);
};
export const importVrmBlob = async (blob, characterClient) => {
  const fileId = makeId(8);
  const fileName = `avatar-${fileId}.vrm`;
  const fileUrl = `${fileServerUrl}${fileName}`;
  const res = await fetch(fileUrl, {
    method: 'PUT',
    body: blob,
  });
  await res.text();

  await importVrmUrl(fileUrl, characterClient);
};
export const importItems = async (items, characterClient) => {
  items = Array.from(items);

  const uriListItem = items.find(item => item.type === 'text/uri-list');
  if (uriListItem) {
    const text = await new Promise((accept, reject) => {
      uriListItem.getAsString(accept);
    });
    const urls = text.split(/[\r\n]+/);
    const url = urls[0];

    if (url && /\.png$/i.test(url)) {
      const res = await fetch(url);
      const blob = await res.blob();
      await importCardBlob(blob, characterClient);
    }
    return;
  }

  const pngItem = items.find(item => item.kind === 'file' && /\.png$/i.test(item.name));
  if (pngItem) {
    const pngFile = await pngItem.getAsFile();
    // const pngFile = files.find(file => /\.png$/i.test(file.name));
    // console.log('got png file', pngItem, pngFile);
    await importCardBlob(pngFile, characterClient);
    return;
  }

  const vrmItem = items.find(item => item.kind === 'file' && /\.vrm$/i.test(item.name));
  if (vrmItem) {
    const vrmFile = await vrmItem.getAsFile();
    await importVrmBlob(vrmFile, characterClient);
    return;
  }
};
export const importFiles = async (files, characterClient) => {
  files = Array.from(files);

  const pngFile = files.find(file => /\.png$/i.test(file.name));
  if (pngFile) {
    await importCardBlob(pngFile, characterClient);
    return;
  }

  const vrmFile = files.find(file => /\.vrm$/i.test(file.name));
  if (vrmFile) {
    await importVrmBlob(vrmFile, characterClient);
    return;
  }
}

//

export function templateString(s, data) {
  let result = s;

  // array
  result = result.replace(
    /\$\{\.\.\.(\w+|\.)\}([\s\S]*?)\/\{\.\.\.(\1)\}/g,
    function (m, key, content, keyEnd) {
      if (data.hasOwnProperty(key) && Array.isArray(data[key])) {
        const replacementLines = data[key]
          .map(item => {
            const ctx = {
              ...data,
              ...item,
              '.': item + '',
            };
            return templateString(content, ctx);
          });
        return replacementLines.join('');
      }
      return '';
    }
  );

  // conditional
  result = result.replace(
    /\$\{\?(\w+|\.)\}([\s\S]*?)(?:\:{\?(\1)\}([\s\S]*?))?\/\{\?(\1)\}/g,
    function (m, keyTrue, contentTrue, keyFalse, contentFalse, keyEnd) {
      const cond = data.hasOwnProperty(keyTrue) ? data[keyTrue] : false;
      if (cond) {
        return contentTrue ? templateString(contentTrue, data) : '';
      } else {
        return contentFalse ? templateString(contentFalse, data) : '';
      }
    }
  );

  // main
  result = result.replace(
    /\$\{(\w+|\.)\}/g,
    function (m, key) {
      return data.hasOwnProperty(key) ? data[key] : '';
    }
  );

  return result;
}
export function extractURL(inputString) {
  const urlPattern = /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;
  const url = inputString.match(urlPattern);
  return url ? url[0] : null; // if a URL is found, return it. Otherwise, return null.
}
export function extractFieldValue(inputString, fieldName) {
  let regex = new RegExp('\\[' + fieldName + '::\\s*(.*?)\\]');
  let match = inputString.match(regex);
  if (match) {
      return match[1];
  } else {
      return null;
  }
}
export async function uploadFile(blob){
  const fileId = makeId(8);
  const fileName = `file-${fileId}.${blob.type.split('/')[1]}`;
  const fileUrl = `${fileServerUrl}${fileName}`;
  const res = await fetch(fileUrl, {
    method: 'PUT',
    body: blob,
  });
  await res.text();
  return fileUrl;
}
/* globalThis.testTemplateString = () => {
  const templateStringTests = [
    // simple replace
    () => {
      const s = "Hello ${name}!";
      const data = {
        name: "world",
      };
      const result = templateString(s, data);
      console.assert(result === "Hello world!");
    },
    // array iteration
    () => {
      // no new lines
      {
        const s = '${...items}<li>${.}</li>/{...items}';
        const data = {
          items: ['a', 'b', 'c'],
        };
        const result = templateString(s, data);
        console.log('result 1', {result});
        console.assert(result === '<li>a</li><li>b</li><li>c</li>');
      }
      // new lines
      {
        const s = `\
\${...items}\
<li>\${.}</li>
\/{...items}\
`;
        const data = {
          items: ['a', 'b', 'c'],
        };
        const result = templateString(s, data);
        console.log('result 2', {result});
        console.assert(result === `\
<li>a</li>
<li>b</li>
<li>c</li>
`);
      }
      // element properties
      {
        const s = `\
\${...items}\
<li>\${name} = \${value}</li>
\/{...items}\
`;
        const data = {
          items: [
            {
              name: 'a',
              value: 1,
            },
            {
              name: 'b',
              value: 2,
            },
          ],
        };
        const result = templateString(s, data);
        console.assert(result === `\
<li>a = 1</li>
<li>b = 2</li>
`);
      }
      // nested array
      {
        const s = `\
\${...items}\
<li1>
\${...subitems}\
<li2>
\${name}
</li2>
/{...subitems}\
</li1>
\/{...items}\
`;
        const data = {
          items: [
            {
              subitems: [
                {
                  name: 'a',
                },
                {
                  name: 'b',
                },
              ],
            },
            {
              subitems: [
                {
                  name: 'c',
                },
              ],
            },
          ],
        };
        const result = templateString(s, data);
// console.log('got result', result, {result});
        console.assert(result === `\
<li1>
<li2>
a
</li2>
<li2>
b
</li2>
</li1>
<li1>
<li2>
c
</li2>
</li1>
`);
      }
    },
    // conditional
    () => {
      {
        const s = `\
\${?cond}\
trueText
:{?cond}\
falseText
/{?cond}\
`;
        const data1 = {
          cond: true,
        };
        const result1 = templateString(s, data1);
        console.assert(result1 === `\
trueText
`);

        const data2 = {
          cond: false,
        };
        const result2 = templateString(s, data2);
        console.assert(result2 === `\
falseText
`);
      }
    },
  ];
  for (const testFn of templateStringTests) {
    testFn();
  }
  // console.log('done');
}; */

//

export function normalizeText(text) {
  return text.replace(/[^a-zA-ZÀ-ÿ0-9.,?!:;'"`@#$\*%& \n]/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
    .normalize('NFKD'); // combine diacritics
}

//

export const textHeader = (label, n = 80) => {
  let s = Array(n + 1).join('-');
  const centerIndex = Math.floor((n - label.length) / 2);
  s = s.slice(0, centerIndex) + label + s.slice(centerIndex + label.length);
  return s;
};
export const formatMessagesDebug = (messages, n = 40) => {
  return messages.map((message, index) => {
    const roleString = `MESSAGE #${index} ${message.role}`;
    const resultString = textHeader(roleString, n) + '\n' + message.content;
    return resultString;
  }).join('\n');
};
export function generateChunks(file) {
  let currentPosition = 0;
  const readChunk = async (file, currentPosition) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(event) {
        resolve(event.target.result);
      };
      reader.onerror = reject;
      const blob = file.slice(currentPosition, currentPosition + CHUNK_SIZE);
      reader.readAsText(blob);
    });
  };
  return new Promise(async (resolve, reject) => {
    // const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 200 , chunkOverlap:50});
    let chunks = [];
    let endOfFile = false;
    while (!endOfFile) {
      try {
        const chunk = await readChunk(file, currentPosition);
        if (chunk.length < CHUNK_SIZE) {
          endOfFile = true;
        }
        chunks.push(chunk);
        currentPosition += chunk.length;
      } catch (error) {
        reject(error);
      }
    }
    // const docs = await textSplitter.createDocuments(chunks);
    // split in order
    const docs = chunks.split(/\n+/);
    resolve(docs);
  });
}
