import path from 'path';
import fs from 'fs';
import readline from 'node:readline/promises'
import child_process from 'child_process';
import util from 'util';

import { mkdirp } from 'mkdirp';
import { rimraf } from 'rimraf';
import recursiveCopy from 'recursive-copy';
import pc from 'picocolors';
import Jimp from 'jimp';
import ansi from 'ansi-escapes';
import toml from '@iarna/toml';
import {
  input,
  // select,
  // checkbox,
  // confirm,
  // search,
  // password,
  // expand,
  // editor,
  // number,
  // rawlist,
} from '@inquirer/prompts';

import { createAgentGuid } from '../sdk/src/util/guid-util.mjs';
import {
  getAgentToken,
} from '../sdk/src/util/jwt-utils.mjs';
import {
  generateMnemonic,
} from '../util/ethereum-utils.mjs';
import { isYes } from '../lib/isYes.js'
import {
  getLoginJwt,
} from './login.mjs';
import {
  makeTempDir,
} from './file.mjs';
import {
  BASE_DIRNAME,
  templatesDirectory,
} from './locations.mjs';
import {
  ImageRenderer,
} from '../sdk/src/devices/video-input.mjs';
import {
  makeAnonymousClient,
  getUserIdForJwt,
  getUserForJwt,
} from '../sdk/src/util/supabase-client.mjs';
import {
  providers,
  getWalletFromMnemonic,
  getConnectedWalletsFromMnemonic,
} from '../sdk/src/util/ethereum-utils.mjs';
import { AgentInterview, applyFeaturesToAgentJSX } from '../sdk/src/util/agent-interview.mjs';
import {
  getAgentName,
  ensureAgentJsonDefaults,
} from '../sdk/src/agent-defaults.mjs';

//

const agentJsonSrcFilename = 'agent.json';
// const agentJsonDstFilename = 'agent.npc';
const consoleImageWidth = 80;

const execFile = util.promisify(child_process.execFile);

//

const mergeJson = async (
  dstPath,
  srcPaths,
  mergeFn = (a, b) => {
    return {
      ...a,
      ...b,
    };
  },
  // finalizerFn = (a) => {
  //   return a;
  // },
) => {
  // read the jsons
  let jsons = await Promise.all(
    srcPaths.map(async (p) => {
      try {
        const s = await fs.promises.readFile(p, 'utf8');
        const j = JSON.parse(s);
        return j;
      } catch (err) {
        if (err.code === 'ENOENT') {
          return null;
        } else {
          throw err;
        }
      }
    }),
  );
  jsons = jsons.filter((j) => j !== null);

  // merge the jsons
  let j = {};
  for (let i = 0; i < jsons.length; i++) {
    j = mergeFn(j, jsons[i]);
  }

  // finalize the json
  // j = finalizerFn(j);

  // write the result
  const s = JSON.stringify(j, null, 2);
  await fs.promises.writeFile(dstPath, s);
};
const copyWithStringTransform = async (src, dst, transformFn) => {
  let s = await fs.promises.readFile(src, 'utf8');
  s = transformFn(s);
  await mkdirp(path.dirname(dst));
  await fs.promises.writeFile(dst, s);
};
const generateTemplateFromAgentJson = async (agentJson, {
  // template = 'empty',
  template = 'basic',
  features = [],
} = {}) => {
  // create a temporary directory
  const templateDirectory = await makeTempDir();

  // copy over the basic template
  const basicTemplateDirectory = path.join(templatesDirectory, template);
  await recursiveCopy(basicTemplateDirectory, templateDirectory);

  // update agent jsx as needed
  // console.log(pc.italic('Generating code...'));
  if (features.length > 0) {
    const agentJSXPath = path.join( templateDirectory, 'agent.tsx' );
    let agentJSX = await fs.promises.readFile(agentJSXPath, 'utf8');
    agentJSX = applyFeaturesToAgentJSX(agentJSX, features);
    await fs.promises.writeFile(agentJSXPath, agentJSX);
  }

  // write back the generated the agent json
  await fs.promises.writeFile(
    path.join(templateDirectory, agentJsonSrcFilename),
    JSON.stringify(agentJson, null, 2),
  );

  return templateDirectory;
};
const buildWranglerToml = (
  t,
  { name, agentJson, mnemonic, agentToken },
) => {
  t.name = name;
  t.vars.AGENT_JSON = JSON.stringify(agentJson);
  t.vars.WALLET_MNEMONIC = mnemonic;
  t.vars.AGENT_TOKEN = agentToken;
  return t;
};

//

export const create = async (args, opts) => {
  const dstDir = args._[0] ?? cwd;
  const prompt = args.prompt ?? '';
  const agentJsonString = args.json;
  const template = args.template ?? 'basic';
  const source = args.source;
  const yes = args.yes;
  const force = !!args.force;
  const forceNoConfirm = !!args.forceNoConfirm;

  const jwt = opts?.jwt || await getLoginJwt();
  let guid = null;
  let agentToken = null;
  let userPrivate = null;
  if (jwt !== null) {
    guid = await createAgentGuid({
      jwt,
    });
    console.log('created guid', guid);
    [agentToken, userPrivate] = await Promise.all([
      getAgentToken(jwt, guid),
      getUserForJwt(jwt, {
        private: true,
      }),
    ]);
    if (!agentToken) {
      throw new Error('Authorization error. Please try logging in again.')
    }
  } else {
    throw new Error('You must be logged in to create an agent.');
  }

  if ((+!!args.prompt + +!!args.template + +!!args.source) > 1) {
    throw new Error('multiple mutually exclusive options --prompt, --template and --source');
  }

  const mnemonic = generateMnemonic();
  const wallet = getWalletFromMnemonic(mnemonic);
  const walletAddress = wallet.address.toLowerCase();
  const stripeConnectAccountId = userPrivate?.stripe_connect_account_id;

  // load source file
  let sourceFile = null;
  if (source) {
    sourceFile = await fs.promises.readFile(source);
  }

  // remove old files
  const files = await (async () => {
    try {
      return await fs.promises.readdir(dstDir);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return [];
      } else {
        throw err;
      }
    }
  })();
  // console.log('files', cwd, files.filter(f => /route/.test(f)));
  if (files.length > 0) {
    if (force || forceNoConfirm) {
      if (!forceNoConfirm) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const answer = await rl.question(`\nDelete the contents of "${path.resolve(dstDir)}"? ${pc.cyan('y/N')}: `)
        rl.close();
        console.log();

        if (!isYes(answer)) {
          throw new Error('aborted');
        }
      }

      // Remove all files.
      console.log(pc.italic('\nRemoving old files...'));
      await Promise.all(
        files.map((filePath) => rimraf(path.join(dstDir, filePath))),
      );
    } else {
      // throw error
      // console.warn('directory is not empty (-f to override)');
      // console.log('files (' + dstDir + '):\n' + files.slice(0, 8).join('\n'));
      throw new Error('directory is not empty (-f to override)');
    }
  }

  // bootstrap destination directory
  await mkdirp(dstDir);

  // generate the agent if necessary
  let srcTemplateDir;
  let agentJson;
  if (jwt) {
    console.log(pc.italic('Generating agent...'));

    // run the interview
    const interview = async (agentJson) => {
      const agentInterview = new AgentInterview({
        agentJson,
        prompt,
        mode: prompt ? 'auto' : 'interactive',
        jwt,
      });
      agentInterview.addEventListener('input', async e => {
        const {
          question,
        } = e.data;
        const answer = await input({
          message: question,
        });
        agentInterview.write(answer);
      });
      agentInterview.addEventListener('output', async e => {
        const {
          text,
        } = e.data;
        console.log(text);
      });
      agentInterview.addEventListener('change', e => {
        const {
          updateObject,
          agentJson,
        } = e.data;
        // console.log('change', updateObject);
      });
      agentInterview.addEventListener('preview', async e => {
        const {
          result: blob,
          signal,
        } = e.data;

        const ab = await blob.arrayBuffer();
        if (signal.aborted) return;

        const b = Buffer.from(ab);
        const jimp = await Jimp.read(b);
        if (signal.aborted) return;

        const imageRenderer = new ImageRenderer();
        const {
          text: imageText,
        } = imageRenderer.render(jimp.bitmap, consoleImageWidth, undefined);
        console.log('Avatar updated:');
        console.log(imageText);
      });
      // console.log('wait for finish 1');
      return await agentInterview.waitForFinish();
      // console.log('wait for finish 2');
    };
    const processAgentJson = async () => {
      const agentJson = agentJsonString ? JSON.parse(agentJsonString) : {};
      const {
        id,
        name,
        bio,
        visualDescription,
        previewUrl,
        features,
      } = agentJson;
      // if the agent json is complete
      if (agentJsonString || source || yes) {
        return agentJson;
      } else {
        return await interview({
          id,
          name,
          bio,
          visualDescription,
          previewUrl,
          features,
        });
      }
    };

    // note: this is an assignment
    agentJson = await processAgentJson();
    console.log(pc.italic('Agent generated.'));
    console.log(pc.green('Name:'), agentJson.name);
    console.log(pc.green('Bio:'), agentJson.bio);
    console.log(pc.green('Visual Description:'), agentJson.visualDescription);
    console.log(pc.green('Preview URL:'), agentJson.previewUrl);
    console.log(pc.green('Features:'), agentJson.features?.length > 0
      ? agentJson.features.join(', ')
      : '*none*'
    );

    console.log(pc.italic('Building agent...'));
    srcTemplateDir = await generateTemplateFromAgentJson(agentJson, {
      template,
      features: agentJson.features,
    });
    console.log(pc.italic('Agent built.'));
  } else {
    throw new Error('not logged in: cannot generate agent from prompt');
  }
  const srcTemplateFilter = (p) => !/^(?:package\.json|agent\.json)$/.test(p);

  // copy over files
  const srcPackageJsonPaths = [
    path.join(BASE_DIRNAME, 'sdk', 'package.json'), // sdk base package.json
    path.join(srcTemplateDir, 'package.json'), // template package.json
  ];
  const dstPackageJsonPath = path.join(dstDir, 'package.json');

  const srcWranglerToml = path.join(BASE_DIRNAME, 'sdk', 'wrangler.toml');
  const dstWranglerToml = path.join(dstDir, 'wrangler.toml');

  const srcSdkDir = path.join(BASE_DIRNAME, 'sdk');
  const srcDstDir = path.join(dstDir, 'sdk');

  const srcTsconfigPath = path.join(BASE_DIRNAME, 'tsconfig.json');
  const dstTsconfigPath = path.join(dstDir, 'tsconfig.json');

  const srcJestConfigPath = path.join(BASE_DIRNAME, 'jest.config.js');
  const dstJestConfigPath = path.join(dstDir, 'jest.config.js');

  // compile the agent json
  ensureAgentJsonDefaults(agentJson);
  if (stripeConnectAccountId) {
    agentJson.stripeConnectAccountId = stripeConnectAccountId;
  }
  if (walletAddress) {
    agentJson.address = walletAddress;
  }

  // copy over the template files
  console.log(pc.italic('Copying files...'));
  const agentName = getAgentName(guid);
  const copyOpts = {
    // overwrite: force,
  };
  await Promise.all([
    // template -> root
    (async () => {
      await recursiveCopy(srcTemplateDir, dstDir, {
        ...copyOpts,
        filter: srcTemplateFilter,
      });
      if (sourceFile !== null) {
        const dstAgentTsxPath = path.join(dstDir, 'agent.tsx');
        await fs.promises.writeFile(dstAgentTsxPath, sourceFile);
      }
    })(),
    // root package.json
    mergeJson(dstPackageJsonPath, srcPackageJsonPaths, (a, b) => {
      return {
        ...a,
        ...b,
        name: agentName,
        dependencies: {
          ...a.dependencies,
          ...b.dependencies,
          'react-agents': 'file:./sdk/src',
        },
      };
    }),
    // root tsconfig
    recursiveCopy(srcTsconfigPath, dstTsconfigPath, copyOpts),
    // root jest config
    recursiveCopy(srcJestConfigPath, dstJestConfigPath, copyOpts),
    // root wrangler.toml
    copyWithStringTransform(srcWranglerToml, dstWranglerToml, (s) => {
      let t = toml.parse(s);
      t = buildWranglerToml(t, { name: agentName, agentJson, mnemonic, agentToken });
      return toml.stringify(t);
    }),
    // sdk directory
    recursiveCopy(srcSdkDir, srcDstDir, copyOpts),
  ]);

  // npm install
  console.log(pc.italic('Installing dependencies...'));
  try {
    await execFile('npm', ['install'], {
      cwd: dstDir,
      stdio: 'inherit',
    });
  } catch (err) {
    console.warn(err.stack);
  }

  console.log('\nCreated agent directory at', ansi.link(path.resolve(dstDir)), '\n');
  console.log(pc.green('Name:'), agentJson.name);
  // console.log(pc.green('ID:'), agentJson.id, '\n');
  console.log(pc.green('Description:'), agentJson.description);
  console.log(pc.green('Bio:'), agentJson.bio, '\n');
};