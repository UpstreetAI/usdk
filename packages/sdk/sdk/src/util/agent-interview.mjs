import dedent from 'dedent';
import { z } from 'zod';
import {
  Interactor,
} from '../../../lib/interactor.js';
import {
  ValueUpdater,
} from '../../../lib/value-updater.js';
import {
  generateCharacterImage,
} from './generate-image.mjs';
import { makeId, makePromise } from './util.mjs';

import {
  // aiHost,
  // metamaskHost,
  // deployEndpointUrl,
  // multiplayerEndpointUrl,
  r2EndpointUrl,
  // chatEndpointUrl,
  // workersHost,
  // aiProxyHost,
} from './endpoints.mjs';

//

export const featureSpecs = [
  {
    name: 'voice',
    description: 'The agent can speak.',
    imports: [
      'TTS',
    ],
    tsx: dedent`
      <TTS />
    `,
  },
];
const featureNames = featureSpecs.map(feature => feature.name);

//

export const applyFeaturesToAgentJSX = (agentJSX, features) => {
  const includedFeatureSpecs = features.map(featureName => featureSpecs.find(featureSpec => featureSpec.name === featureName));

  const importsHookRegex = /\/\* IMPORTS REGEX HOOK \*\//g;
  const impotsString = includedFeatureSpecs.flatMap(featureSpec => featureSpec.imports).map(importName => `${importName},`).join(',');
  agentJSX = agentJSX.replace(importsHookRegex, impotsString);

  const jsxHookRegex = /\{\/\* JSX REGEX HOOK \*\/}/g;
  const jsxString = includedFeatureSpecs.map(featureSpec => featureSpec.tsx).join('\n');
  agentJSX = agentJSX.replace(jsxHookRegex, jsxString);

  return agentJSX;
};

export class AgentInterview extends EventTarget {
  constructor(opts) {
    super();

    let {
      agentJson, // object
      prompt, // string
      mode, // 'auto' | 'interactive' | 'manual'
      jwt,
    } = opts;

    // character image generator
    const visualDescriptionValueUpdater = new ValueUpdater(async (visualDescription, {
      signal,
    }) => {
      const {
        blob,
      } = await generateCharacterImage(visualDescription, undefined, {
        jwt,
      });
      return blob;
    });
    visualDescriptionValueUpdater.addEventListener('change', async (e) => {
      this.dispatchEvent(new MessageEvent('preview', {
        data: e.data,
      }));
    });
    const pumpIo = (response = '') => {
      this.dispatchEvent(new MessageEvent('input', {
        data: {
          question: response,
        },
      }));
    };
    const sendOutput = (text) => {
      this.dispatchEvent(new MessageEvent('output', {
        data: {
          text,
        },
      }));
    };
    this.loadPromise = makePromise();

    // initialize
    if (agentJson.previewUrl) {
      visualDescriptionValueUpdater.setResult(agentJson.previewUrl);
    }

    // interaction loop
    this.interactor = new Interactor({
      prompt: dedent`\
          Generate and configure an AI agent character.
          Use \`visualDescription\` to visually describe the character without referring to their pose or emotion. This field is an image prompt to use for an image generator. Update it whenever the character's visual description changes.
          e.g. 'teen girl with medium blond hair and blue eyes, purple dress, green hoodie, jean shorts, sneakers'
        ` + '\n' +
        dedent`\
            The available features are:
          ` + '\n' +
        featureSpecs.map(({ name, description }) => {
          return `'${name}': ${description}`;
        }).join('\n') + '\n' +
        (prompt ? ('The user has provided the following prompt:\n' + prompt) : ''),
      object: agentJson,
      objectFormat: z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        visualDescription: z.string().optional(),
        features: z.array(z.enum(featureNames)),
      }),
      jwt,
    });
    this.interactor.addEventListener('message', async (e) => {
      const o = e.data;
      const {
        response,
        updateObject,
        done,
        object,
      } = o;

      // external handling
      agentJson = object;
      if (updateObject) {
        this.dispatchEvent(new MessageEvent('change', {
          data: {
            updateObject,
            agentJson,
          },
        }));
      }

      // internal handling
      if (updateObject?.visualDescription) {
        visualDescriptionValueUpdater.set(updateObject.visualDescription);
      }

      // console.log('agent interview done', {
      //   done,
      //   response,
      // });
      if (!done) {
        // pump i/o
        pumpIo(response);
      } else {
        sendOutput(response);

        // return result
        agentJson.previewUrl = await (async () => {
          const result = await visualDescriptionValueUpdater.waitForLoad();

          if (typeof result === 'string') {
            return result;
          } else if (result instanceof Blob) {
            // upload to r2
            const blob = result;
            const guid = crypto.randomUUID();
            const keyPath = ['avatars', guid, `avatar.jpg`].join('/');
            const r2Url = `${r2EndpointUrl}/${keyPath}`;
            let previewUrl = '';
            try {
              const res = await fetch(r2Url, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${jwt}`,
                },
                body: blob,
              });
              if (res.ok) {
                previewUrl = await res.json();
              } else {
                const text = await res.text();
                throw new Error(`could not upload preview url: ${r2Url}: ${res.status} ${blob.name}: ${text}`);
              }
            } catch (err) {
              throw new Error('failed to put preview url: ' + previewUrl + ': ' + err.stack);
            }
            return previewUrl;
          } else if (result === null) {
            return null;
          } else {
            console.warn('invalid result type', result);
            throw new Error('invalid result type: ' + typeof result);
          }
        })();
        this.loadPromise.resolve(agentJson);
      }
    });
    if (mode === 'auto') {
      // automatically run the interview to completion
      this.interactor.end();
    } else if (mode === 'interactive') {
      /* // XXX debugging hack: listen for the user pressing the tab key
      {
        process.stdin.setRawMode(true);
        process.stdin.setEncoding('utf8');
        process.stdin.resume();
        process.stdin.on('data', (key) => {
          if (key === '\u0009') { // tab
            console.log('got tab');
          }
          if (key === '\u0003') { // ctrl-c
            console.log('got ctrl-c');
            process.exit();
          }
        });
      } */

      // initiate the interview
      this.interactor.write();
    } else if (mode === 'manual') {
      // pump the interview loop
      pumpIo();
    } else {
      throw new Error(`invalid mode: ${mode}`)
    }
  }
  write(response) {
    this.interactor.write(response);
  }
  async waitForFinish() {
    return await this.loadPromise;
  }
}