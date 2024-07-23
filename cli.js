import readline from 'node:readline/promises'
import path from 'path';
import fs from 'fs';
import https from 'https';
import os from 'os';
import child_process from 'child_process';
import stream from 'stream';
import repl from 'repl';
import util from 'util';

import ansi from 'ansi-escapes';
import { program } from 'commander';
import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import EventSource from 'eventsource';
import toml from '@iarna/toml';
import open from 'open';
import { rimraf } from 'rimraf';
import { mkdirp } from 'mkdirp';
import pc from 'picocolors';
import recursiveReaddir from 'recursive-readdir';
import recursiveCopy from 'recursive-copy';
import dedent from 'dedent';
import jsAgo from 'js-ago';
import 'localstorage-polyfill';
import JSZip from 'jszip';
import { doc } from 'tsdoc-extractor';

import prettyBytes from 'pretty-bytes';
import Table from 'cli-table3';
import * as ethers from 'ethers';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

import { generationModel } from './const.js';
import { modifyAgentJSXWithGeneratedCode } from './lib/index.js';
import packageJson from './package.json' with { type: 'json' };
import { isGuid, makeDevGuid, makeZeroGuid } from './sdk/src/util/guid-util.mjs';
import { QueueManager } from './sdk/src/util/queue-manager.mjs';
import { lembed } from './sdk/src/util/embedding.mjs';
import {
  // makeClient,
  makeAnonymousClient,
  getUserIdForJwt,
  getUserForJwt,
} from './sdk/src/util/supabase-client.mjs';

import {
  providers,
  getWalletFromMnemonic,
  getConnectedWalletsFromMnemonic,
} from './sdk/src/util/ethereum-utils.mjs';
import {
  aiHost,
  metamaskHost,
  deployEndpointUrl,
  multiplayerEndpointUrl,
  r2EndpointUrl,
  chatEndpointUrl,
  workersHost,
} from './sdk/src/util/endpoints.mjs';
import { NetworkRealms } from './sdk/src/lib/multiplayer/public/network-realms.mjs'; // XXX should be a deduplicated import, in a separate npm module
import { makeId, shuffle, parseCodeBlock } from './sdk/src/util/util.mjs';
import { fetchChatCompletion } from './sdk/src/util/fetch.mjs';
import { isYes } from './lib/isYes.js'
import { VoiceTrainer } from './sdk/src/lib/voice-output/voice-trainer.mjs';

// XXX imports for capture support
// import webp from 'webp-wasm';
// import {
//   InputDevices,
// } from './sdk/src/devices/input-devices.mjs';
// import {
//   AudioInput,
//   encodeMp3,
//   transcribe,
// } from './sdk/src/devices/audio-input.mjs';
// import {
//   VideoInput,
//   encodeWebp,
//   describe,
// } from './sdk/src/devices/video-input.mjs';
// import vad from '@ricky0123/vad-node';

const execFile = util.promisify(child_process.execFile);
globalThis.WebSocket = WebSocket; // polyfill for multiplayer library

const BASE_DIRNAME = (() => {
  let metaUrl = decodeURI(import.meta.url).replace('file://', '');
  if (os.platform() === 'win32') {
    metaUrl = metaUrl.replace(/^[/\\]+/, '');
  }

  // if we're not in dist, use the regular cli.js path
  if (path.basename(path.dirname(metaUrl)) !== 'dist') {
    return path.normalize(
      path.join(metaUrl, '..'),
    );
  } else {
    return path.normalize(
      path.join(metaUrl, '..', '..'),
    );
  }
})();
const wranglerBin = path.join(BASE_DIRNAME, 'node_modules', '.bin', 'wrangler');
const multiplayerDirectory = path.join(BASE_DIRNAME, 'multiplayer');
const jestBin = path.join(BASE_DIRNAME, 'node_modules', '.bin', 'jest');

const multiplayerPort = 2222;

const wranglerTomlPath = path.join(BASE_DIRNAME, 'sdk', 'wrangler.toml');
const wranglerTomlString = fs.readFileSync(wranglerTomlPath, 'utf8');
const wranglerToml = toml.parse(wranglerTomlString);
const env = wranglerToml.vars;
const makeSupabase = (jwt) => makeAnonymousClient(env, jwt);
const timeAgo = (timestamp) =>
  jsAgo.default(timestamp, { format: 'short' });
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const shortName = () => uniqueNamesGenerator({
  dictionaries: [adjectives, adjectives, colors, animals],
  separator: ' ',
});
const makeName = () => capitalize(shortName());

//

const agentJsonSrcFilename = 'agent.json';
const agentJsonDstFilename = 'agent.npc';

const eraseLine = '\x1b[2K\r';

//

let logFn = (...args) => {
  console.log(...args);
};
const setLogFn = (_logFn) => {
  logFn = _logFn;
};
const log = (...args) => {
  logFn(...args);
};

//

function tryReadFile(filePath, encoding) {
  try {
    return fs.readFileSync(filePath, encoding);
  } catch (err) {
    return null;
  }
}
async function tryReadFileAsync(filePath, encoding) {
  try {
    return await fs.promises.readFile(filePath, encoding);
  } catch (err) {
    return null;
  }
}
function jsonParse(s) {
  try {
    return JSON.parse(s);
  } catch (err) {
    return null;
  }
}
const makeTempDir = async () => {
  let tempDir = os.tmpdir();
  const dirname = makeId(8);
  tempDir = path.join(tempDir, dirname);
  await mkdirp(tempDir);
  return tempDir;
};
const copyWithStringTransform = async (src, dst, transformFn) => {
  let s = await fs.promises.readFile(src, 'utf8');
  s = transformFn(s);
  await mkdirp(path.dirname(dst));
  await fs.promises.writeFile(dst, s);
};
const getAgentName = (guid) => `user-agent-${guid}`;
const getAgentPublicUrl = (guid) => `https://chat.upstreet.ai/agents/${guid}`;
const getAgentHost = (guidOrPortIndex, { dev }) => {
  const agentHost = dev
    ? `http://local.upstreet.ai:${devServerPort + guidOrPortIndex}`
    // : `https://${getAgentName(guidOrPortIndex)}.upstreet.ai`;
    : `https://${getAgentName(guidOrPortIndex)}.${workersHost}`;
  return agentHost;
};
/* const pause = () =>
  new Promise((accept, reject) => {
    // nothing
  }); */
class TypingMap extends EventTarget {
  #internalMap = new Map(); // playerId: string -> { userId: string, name: string, typing: boolean }
  getMap() {
    return this.#internalMap;
  }
  set(playerId, spec) {
    this.#internalMap.set(playerId, spec);
    this.dispatchEvent(new MessageEvent('typingchange', {
      data: spec,
    }));
  }
  clear() {
    for (const [playerId, spec] of this.#internalMap) {
      this.dispatchEvent(new MessageEvent('typingchange', {
        data: spec,
      }));
    }
    this.#internalMap.clear();
  }
}

const certsLocalPath = path.join(BASE_DIRNAME, 'certs-local');
const templatesDirectory = path.join(BASE_DIRNAME, 'examples');

const defaultCorsHeaders = [
  // {
  //   "key": "Access-Control-Allow-Origin",
  //   "value": "*"
  // },
  {
    key: 'Access-Control-Allow-Methods',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Headers',
    value: ['content-type'].join(', '),
  },
  {
    key: 'Access-Control-Expose-Headers',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Private-Network',
    value: 'true',
  },
  {
    key: 'Access-Control-Allow-Credentials',
    value: 'true',
  },
];
const makeCorsHeaders = (req) => {
  const headers = [...defaultCorsHeaders];
  // set Access-Control-Allow-Origin to the origin of the request
  const origin = req.headers['origin'];
  if (origin) {
    headers.push({
      key: 'Access-Control-Allow-Origin',
      value: origin,
    });
  }
  return headers;
};

const callbackPort = 10617;
const devServerPort = 10618;
// const webcamPort = 10619;
const cwd = process.cwd();
const homedir = os.homedir();
const usdkProfileLocation = path.join(homedir, '.usdk');
const loginLocation = path.join(usdkProfileLocation, 'login.json');
const walletLocation = path.join(usdkProfileLocation, 'wallet.json');

const getServerOpts = () => {
  return {
    key: tryReadFile(path.join(certsLocalPath, 'privkey.pem')) || '',
    cert: tryReadFile(path.join(certsLocalPath, 'fullchain.pem')) || '',
  };
};
const putFile = async (pathname, file) => {
  const u = `https://r2.upstreet.ai/${pathname}`;
  const headers = {};
  if (file.type) {
    headers['Content-Type'] = file.type;
  }
  if (file.size) {
    headers['Content-Length'] = file.size;
  }
  const res = await fetch(u, {
    method: 'PUT',
    headers,
    body: file,
    duplex: 'half',
  });
  const j = await res.json();
  return j;
};
/* const getFiles = async (agentDirectory) => {
  let files = await recursiveReaddir(agentDirectory);
  // filter out directories
  const filterDirectories = ['node_modules', '.git'];
  files = files.filter((filePath) => {
    const parts = filePath.split(path.sep);
    for (const filterDirectory of filterDirectories) {
      if (parts.includes(filterDirectory)) {
        return false;
      }
    }
    return true;
  });
  files = files.map((f) => f.slice(agentDirectory.length + 1));
  return files;
}; */
const getLoginJwt = async () => {
  const loginFile = await tryReadFileAsync(loginLocation);
  if (loginFile) {
    const o = jsonParse(loginFile);
    if (
      typeof o === 'object' &&
      typeof o?.id === 'string' &&
      typeof o?.jwt === 'string'
    ) {
      const { jwt } = o;
      return jwt;
    }
  }

  return null;
};
const ensureLocalGuid = async () => {
  throw new Error(`move this to use the agent's guid`);
  /* const guidFile = await tryReadFileAsync(guidLocation);
  if (guidFile) {
    const o = jsonParse(guidFile);
    if (typeof o === 'object' && typeof o?.guid === 'string') {
      const { guid } = o;
      return guid;
    } else {
      throw new Error(
        'could not parse guid file: ' +
          guidLocation +
          ': ' +
          JSON.stringify(o, null, 2),
      );
    }
  } else {
    const guid = makeDevGuid();
    const o = {
      guid,
    };
    const s = JSON.stringify(o);
    await mkdirp(path.dirname(guidLocation));
    await fs.promises.writeFile(guidLocation, s);
    return guid;
  } */
};
const generateMnemonic = () => bip39.generateMnemonic(wordlist);
const ensureLocalMnemonic = async () => {
  const walletFile = await tryReadFileAsync(walletLocation);
  if (walletFile) {
    const o = jsonParse(walletFile);
    if (typeof o === 'object' && typeof o?.mnemonic === 'string') {
      const { mnemonic } = o;
      return mnemonic;
    } else {
      throw new Error(
        'could not parse wallet file: ' + JSON.stringify(o, null, 2),
      );
    }
  } else {
    const mnemonic = generateMnemonic();
    const o = {
      mnemonic,
    };
    const s = JSON.stringify(o);
    await fs.promises.writeFile(walletLocation, s);
    return mnemonic;
  }
};
/* const getLocalMnemonic = async () => {
  const walletFile = await tryReadFileAsync(walletLocation);
  if (walletFile) {
    const o = jsonParse(walletFile);
    if (typeof o === 'object' && typeof o?.mnemonic === 'string') {
      const { mnemonic } = o;
      return mnemonic;
    } else {
      throw new Error(
        'could not parse wallet file: ' + JSON.stringify(o, null, 2),
      );
    }
  } else {
    return null;
  }
}; */
const getAgentMnemonic = async (supabase, agentId) => {
  const accountResult = await supabase
    .from('wallets')
    .select('*')
    .eq('agent_id', agentId)
    .maybeSingle();
  const { error, data } = accountResult;
  if (!error) {
    const { mnemonic } = data;
    return mnemonic;
  } else {
    throw new Error(error);
  }
};
const defaultDescription = 'Created by the AI Agent SDK';
const ensureAgentJsonDefaults = (spec) => {
  if (typeof spec.name !== 'string') {
    spec.name = makeName();
  }
  if (typeof spec.description !== 'string') {
    spec.description = defaultDescription;
  }
  if (typeof spec.bio !== 'string') {
    spec.bio = 'A cool person';
  }
  if (typeof spec.model !== 'string') {
    spec.model = generationModel;
  }
  if (typeof spec.previewUrl !== 'string') {
    spec.previewUrl = '/images/characters/upstreet/small/scillia.png';
  }
  if (typeof spec.avatarUrl !== 'string') {
    spec.avatarUrl = '/avatars/default_1934.vrm';
  }
  if (typeof spec.voiceEndpoint !== 'string') {
    spec.voiceEndpoint = 'elevenlabs:scillia:kNBPK9DILaezWWUSHpF9';
  }
  if (typeof spec.voicePack !== 'string') {
    spec.voicePack = 'ShiShi voice pack';
  }
  if (!Array.isArray(spec.capabilities)) {
    spec.capabilities = [];
  }
};
const compileAgentJson = (agentJson, { guid, stripeConnectAccountId, walletAddress, dev }) => {
  agentJson.id = guid;
  agentJson.startUrl = getAgentHost(guid, { dev });
  agentJson.stripeConnectAccountId = stripeConnectAccountId;
  agentJson.address = walletAddress;
  ensureAgentJsonDefaults(agentJson);
  return agentJson;
};
const bindProcess = (cp) => {
  process.on('exit', () => {
    // console.log('got exit', cp.pid);
    try {
      process.kill(cp.pid, 'SIGINT');
    } catch (err) {
      // console.warn(err.stack);
    }
  });
};
const waitForProcessIo = async (cp, matcher, timeout = 60 * 1000) => {
  const matcherFn = (() => {
    if (typeof matcher === 'string') {
      const s = matcher;
      return (s2) => s2.includes(s);
    } else if (matcher instanceof RegExp) {
      const re = matcher;
      return (s) => re.test(s);
    } else {
      throw new Error('invalid matcher');
    }
  })();
  await new Promise((accept, reject) => {
    const bs = [];
    const onData = (d) => {
      bs.push(d);
      const s = Buffer.concat(bs).toString('utf8');
      if (matcherFn(s)) {
        cp.stdout.removeListener('data', onData);
        cp.stdout.removeListener('end', onEnd);
        clearTimeout(timeoutId);
        accept();
      }
    };
    cp.stdout.on('data', onData);

    const bs2 = [];
    const onData2 = (d) => {
      bs2.push(d);
    };
    cp.stderr.on('data', onData2);

    const getDebugOutput = () =>
      Buffer.concat(bs).toString('utf8') +
      '\n' +
      Buffer.concat(bs2).toString('utf8')

    const onEnd = () => {
      reject(
        new Error('process ended without matching output: ' + getDebugOutput()),
      );
    };
    cp.stdout.on('end', onEnd);

    cp.on('exit', (code) => {
      reject(new Error(`failed to get start process: ${cp.pid}: ${code}`));
    });

    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          'timeout waiting for process output: ' +
            JSON.stringify(cp.spawnfile) +
            ' ' +
            JSON.stringify(cp.spawnargs) +
            ' ' +
            getDebugOutput(),
        ),
      );
    }, timeout);
  });
};
const startDevServer = async ({ agentDirectory = cwd, portIndex = 0 } = {}, {
  debug = false,
} = {}) => {
  // spawn the wrangler child process
  const cp = child_process.spawn(
    wranglerBin,
    ['dev', '--ip', '0.0.0.0', '--port', devServerPort + portIndex],
    {
      stdio: 'pipe',
      // stdio: 'inherit',
      cwd: agentDirectory,
    },
  );
  bindProcess(cp);
  await waitForProcessIo(cp, /ready/i);
  if (debug) {
    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stderr);
  }
  return cp;
};
const startWebcamServer = async () => {
  const app = express();
  // app.use(express.static(cwd));
  const server = https.createServer(getServerOpts(), app);
  server.on('error', (err) => {
    console.warn('dev server error', err);
  });
  // server.on('close', () => {
  //   console.log('dev server closed');
  // });
  await new Promise((accept, reject) => {
    server.listen(devServerPort, '0.0.0.0', (err) => {
      if (err) {
        reject(err);
      } else {
        accept();
      }
    });
  });
};
const startMultiplayerServer = async () => {
  // spawn the wrangler child process
  const cp = child_process.spawn(
    wranglerBin,
    ['dev', '--ip', '0.0.0.0', '--port', multiplayerPort],
    {
      stdio: 'pipe',
      // stdio: 'inherit',
      cwd: multiplayerDirectory,
    },
  );
  bindProcess(cp);
  await waitForProcessIo(cp, /ready/i);
  return cp;
};
const getAssetJson = async (supabase, guid) => {
  const assetResult = await supabase
    .from('assets')
    .select('*')
    .eq('id', guid)
    .eq('type', 'npc')
    .maybeSingle();
  if (!assetResult.error) {
    if (assetResult.data) {
      const { start_url } = assetResult.data;

      const proxyRes = await fetch(start_url);
      const agentJson = await proxyRes.json();
      return agentJson;
    } else {
      throw new Error(
        JSON.stringify({
          error: `Agent not found: ${guid}`,
        }),
      );
    }
  } else {
    throw new Error(
      JSON.stringify({
        error: assetResult.error,
      }),
    );
  }
};

class Player {
  playerId;
  playerSpec;
  constructor(playerId = '', playerSpec = null) {
    this.playerId = playerId;
    this.playerSpec = playerSpec;
  }
  setPlayerSpec(playerSpec) {
    this.playerSpec = playerSpec;
  }
}

//

const status = async (args) => {
  const jwt = await getLoginJwt();
  if (jwt !== null) {
    const userId = await getUserIdForJwt(jwt);

    const supabase = makeSupabase(jwt);
    const result = await supabase
      .from('accounts')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    const { error, data } = result;
    if (!error) {
      console.log('user', data);

      const { active_asset } = data;
      if (active_asset) {
        // print the currently worn character
        const assetResult = await supabase
          .from('assets')
          .select('*')
          .eq('id', active_asset)
          .eq('type', 'npc')
          .maybeSingle();
        const { error, data } = assetResult;
        if (!error) {
          if (data) {
            console.log('wearing', data);
          } else {
            console.warn('failed to fetch worn avatar', active_asset);
          }
        } else {
          console.log(`could not get asset ${userId}: ${error}`);
        }
      } else {
        console.log('not wearing an avatar');
      }
    } else {
      console.log(`could not get account ${userId}: ${error}`);
    }
  } else {
    console.log('not logged in');
  }

  // const localGuid = await ensureLocalGuid();
  // console.log(`local guid is ${localGuid}`);
};
const login = async (args) => {
  const local = !!args.local;

  const handleLogin = async (j) => {
    const {
      id,
      jwt,
    } = j;
    await mkdirp(path.dirname(loginLocation));
    await fs.promises.writeFile(loginLocation, JSON.stringify({
      id,
      jwt,
    }));
    console.log('Successfully logged in.');
  };

  // if (!anonymous) {
    await new Promise((accept, reject) => {
      const serverOpts = getServerOpts();
      const server = https.createServer(serverOpts, (req, res) => {
        // console.log('got login response 1', {
        //   method: req.method,
        //   url: req.url,
        // });

        // set cors
        const corsHeaders = makeCorsHeaders(req);
        for (const { key, value } of corsHeaders) {
          res.setHeader(key, value);
        }

        // console.log('got login response 2', {
        //   method: req.method,
        //   url: req.url,
        // });

        // handle methods
        if (req.method === 'OPTIONS') {
          res.end();
        } else if (req.method === 'POST') {
          const bs = [];
          req.on('data', (d) => {
            bs.push(d);
          });
          req.on('end', async () => {
            // respond to the page
            res.end();

            // close the server
            server.close();

            const b = Buffer.concat(bs);
            const s = b.toString('utf8');
            const j = JSON.parse(s);
            await handleLogin(j);

            accept();
          });
        } else {
          res.statusCode = 405;
          res.end();
        }
      });
      // console.log('starting callback server on port', {
      //   callbackPort,
      // });
      server.on('error', (err) => {
        console.warn('callback server error', err);
      });
      // server.on('close', () => {
      //   console.log('callback server closed');
      // });
      server.listen(callbackPort, '0.0.0.0', (err) => {
        // console.log('callback server listening on port', {
        //   callbackPort,
        // });
        if (err) {
          console.warn(err);
        } else {
          const host = local ? `https://local.upstreet.ai:4443` : `https://login.upstreet.ai`;
          const u = new URL(`${host}/logintool`);
          u.searchParams.set('callback_url', `https://local.upstreet.ai:${callbackPort}`);
          const p = u + '';
          console.log(`Waiting for login from ${p}`);
          open(p);
        }
      });
    });
  // } else {
  //   const j = await getAnonUser();
  //   await handleLogin(j);
  // }
};
const logout = async (args) => {
  await rimraf(loginLocation);
  console.log('Successfully logged out.')
};
const authorize = async (args) => {
  const appDirectory = args._[0] ?? cwd;

  const wranglerTomlPath = path.join(appDirectory, 'wrangler.toml');
  let s = await fs.promises.readFile(wranglerTomlPath, 'utf8');

  const jwt = await getLoginJwt();
  if (jwt) {
    let t = toml.parse(s);

    const guid = t.vars.GUID;
    const agentToken = await getAgentToken(jwt, guid);
    if (agentToken) {
      t = setWranglerTomlAgentToken(t, { agentToken });
      s = toml.stringify(t);

      await fs.promises.writeFile(wranglerTomlPath, s);

      console.log('agent authorized');
    } else {
      console.warn('could not get agent token');
      process.exit(1);
    }
  } else {
    console.warn('you are not logged in!');
    process.exit(1);
  }
};
const wear = async (args) => {
  const guid = args._[0] ?? '';

  if (guid) {
    const jwt = await getLoginJwt();
    if (jwt !== null) {
      const userId = await getUserIdForJwt(jwt);
      const supabase = makeSupabase(jwt);

      // get the asset to wear
      const getAssetResult = await supabase
        .from('assets')
        .select('*')
        .eq('id', guid)
        .eq('type', 'npc')
        .maybeSingle();
      if (getAssetResult.data) {
        const { type, start_url } = getAssetResult.data;

        if (type === 'npc') {
          const updateResult = await supabase
            .from('accounts')
            .update({
              active_asset: guid,
            })
            .eq('id', userId)
            .maybeSingle();
          const { error, data } = updateResult;
          if (!error || !data) {
            console.log(`wearing ${guid}`);
          } else {
            console.log(`${userId} could not wear character ${guid}: ${JSON.stringify(error)} ${JSON.stringify(data)}`);
            process.exit(1);
          }
        } else {
          console.log(`asset ${guid} is not an npc`);
          process.exit(1);
        }
      } else {
        console.log(`could not find asset ${guid}`);
        process.exit(1);
      }
    } else {
      console.log('not logged in');
      process.exit(1);
    }
  } else {
    console.log('no guid provided');
    process.exit(1);
  }
};
const unwear = async (args) => {
  const jwt = await getLoginJwt();
  if (jwt !== null) {
    const userId = await getUserIdForJwt(jwt);
    const supabase = makeSupabase(jwt);

    const updateResult = await supabase
      .from('accounts')
      .update({
        active_asset: null,
      })
      .eq('id', userId)
      .maybeSingle();
    const { error, data } = updateResult;
    if (!error && data) {
      console.log(`cleared worn character`);
    } else {
      console.log(`${userId} could not wear character ${guid}: ${JSON.stringify(error)} ${JSON.stringify(data)}`);
      process.exit(1);
    }
  } else {
    console.log('not logged in');
    process.exit(1);
  }
};
const getUserWornAssetFromJwt = async (supabase, jwt) => {
  const userData = await getUserForJwt(jwt);
  if (userData) {
    const { active_asset } = userData;
    if (active_asset) {
      const assetResult = await supabase
        .from('assets')
        .select('*')
        .eq('id', active_asset)
        .eq('type', 'npc')
        .maybeSingle();
      const { error, data } = assetResult;
      if (!error) {
        if (data) {
          // console.log('wearing', data);
          return data;
        } else {
          // console.warn('failed to fetch worn avatar', active_asset);
          // throw new Error('failed to fetch worn avatar');
          return null;
        }
      } else {
        // console.log(`could not get asset ${userId}: ${error}`);
        // throw new Error('could not get asset');
        return null;
      }
    } else {
      // console.log('not wearing an avatar');
      // throw new Error('not wearing an avatar');
      return null;
    }
  } else {
    // throw new Error('could not get user');
    return null;
  }
};
const connectMultiplayer = async ({ room, anonymous, debug }) => {
  const getUserAsset = async () => {
    if (!anonymous) {
      let user = null;

      // try getting the user asset from the login
      const jwt = await getLoginJwt();
      if (jwt !== null) {
        const supabase = makeSupabase(jwt);
        // userAsset = await getUserWornAssetFromJwt(supabase, jwt);
        user = await getUserForJwt(jwt);
      }

      // use a default asset spec
      if (!user) {
        const userId = makeDevGuid();
        user = {
          id: userId,
          name: makeName(),
          description: '',
        };
        // ensureAgentJsonDefaults(userAsset);
      }

      return user;
    } else {
      return null;
    }
  };
  const userAsset = await getUserAsset();
  const userId = userAsset?.id;
  const name = userAsset?.name;

  // join the room
  const realms = new NetworkRealms({
    endpointUrl: multiplayerEndpointUrl,
    playerId: !anonymous ? userId : null,
    audioManager: null,
  });
  const playersMap = new Map();
  const typingMap = new TypingMap();

  const virtualWorld = realms.getVirtualWorld();
  const virtualPlayers = realms.getVirtualPlayers();
  // console.log('got initial players', virtualPlayers.getKeys());

  // log('waiting for initial connection...');

  let connected = false;
  const onConnect = async (e) => {
    // log('on connect...');
    e.waitUntil(
      (async () => {
        const realmKey = e.data.rootRealmKey;

        const existingAgentIds = Array.from(playersMap.keys());
        if (existingAgentIds.includes(userId)) {
          log('your character is already in the room! disconnecting.');
          process.exit(1);
        }

        if (!anonymous) {
          // Initialize network realms player.
          const localPlayer = new Player(userId, {
            id: userId,
            name,
            capabilities: [
              'human',
            ],
          });
          const _pushInitialPlayer = () => {
            realms.localPlayer.initializePlayer(
              {
                realmKey,
              },
              {},
            );
            realms.localPlayer.setKeyValue(
              'playerSpec',
              localPlayer.playerSpec,
            );
          };
          _pushInitialPlayer();
        }

        connected = true;

        // log the initial room state
        // agentIds.push(userId);
        /* const agentJsons = await Promise.all(
          agentIds.map(async (agentId) => {
            // current player
            if (agentId === userId) {
              return {
                id: userId,
                name,
              };
            // development agent
            } else if (agentId === devAgentId) {
              return {
                id: devAgentId,
                name,
              };
            } else {
              const assetJson = await getAssetJson(supabase, agentId);
              return {
                id: agentId,
                name: assetJson.name,
              };
            }
          }),
        ); */

        const agentJsons = Array.from(playersMap.values()).map(
          (player) => player.playerSpec,
        );
        log(dedent`
          ${userAsset ? `You are ${JSON.stringify(name)} [${userId}]), chatting in ${room}.` : ''}
          In the room (${room}):
          ${agentJsons
            .map((agent) => {
              return `* ${agent.name} [${agent.id}] ${agent.id === userId ? '(you)' : ''}`;
            })
            .join('\n')
          }
          http://local.upstreet.ai:${devServerPort}
        `,
        );
      })(),
    );
  };
  realms.addEventListener('connect', onConnect);

  const _trackRemotePlayers = () => {
    virtualPlayers.addEventListener('join', (e) => {
      const { playerId, player } = e.data;
      if (connected) {
        log('remote player joined:', playerId);
      }

      const remotePlayer = new Player(playerId);
      playersMap.set(playerId, remotePlayer);

      // apply initial remote player state
      {
        const playerSpec = player.getKeyValue('playerSpec');
        if (playerSpec) {
          remotePlayer.setPlayerSpec(playerSpec);
        }
      }

      // Handle remote player state updates
      player.addEventListener('update', e => {
        const { key, val } = e.data;

        if (key === 'playerSpec') {
          remotePlayer.setPlayerSpec(val);
        }
      });
    });
    virtualPlayers.addEventListener('leave', e => {
      const { playerId } = e.data;
      if (connected) {
        log('remote player left:', playerId);
      }
      const remotePlayer = playersMap.get(playerId);
      if (remotePlayer) {
        playersMap.delete(playerId);
      } else {
        log('remote player not found', playerId);
        debugger;
      }
    });
  };
  _trackRemotePlayers();

  const _bindMultiplayerChat = () => {
    const onchat = (e) => {
      const { message } = e.data;
      const { userId: messageUserId, name, method, args } = message;

      switch (method) {
        case 'say': {
          const { text } = args;
          if (messageUserId !== userId) {
            log(`${name}: ${text}`);
          }
          break;
        }
        case 'log': {
          if (debug) {
            // console.log('got log message', JSON.stringify(args, null, 2));
            // const { userId, name, text } = args;
            // console.log(`\r${name}: ${text}`);
            // replServer.displayPrompt(true);
            const { text } = args;
            log(text);
            // console.log(eraseLine + JSON.stringify(args2, null, 2));
          }
          break;
        }
        case 'typing': {
          const { typing } = args;
          typingMap.set(messageUserId, { userId: messageUserId, name, typing });
          break;
        }
        case 'paymentRequest': {
          const { amount, currency, url, productName, productDescription, productQuantity } = args;
          log(`[${name} requests ${amount} ${currency} for ${productQuantity} x ${productName}]: ${url}`);
          break;
        }
        case 'nudge':
        case 'join':
        case 'leave': {
          // nothing
          break;
        }
        default: {
          // if (debug) {
            // console.log('got log message', JSON.stringify(args, null, 2));
            // const { userId, name, text } = args;
            // console.log(`\r${name}: ${text}`);
            // replServer.displayPrompt(true);
            log(`${name}: ${JSON.stringify(message)}`);
            // console.log(eraseLine + JSON.stringify(args2, null, 2));
          // }
          break;
        }
      }
    };
    realms.addEventListener('chat', onchat);
    const cleanup = () => {
      realms.removeEventListener('chat', onchat);
      typingMap.clear();
    };
    realms.addEventListener('disconnect', () => {
      cleanup();
    });
  };
  _bindMultiplayerChat();

  // console.log('update realms keys 1');
  await realms.updateRealmsKeys({
    realmsKeys: [room],
    rootRealmKey: room,
  });
  // console.log('update realms keys 2');

  return {
    userAsset,
    realms,
    playersMap,
    typingMap,
  };
};
/* const nudge = async (realms, targetPlayerId) => {
  const o = {
    method: 'nudge',
    args: {
      targetPlayerId,
    },
  };
  await realms.sendChatMessage(o);
}; */
const startMultiplayerListener = ({
  userAsset,
  realms,
  playersMap,
  typingMap,
  // local,
  startRepl,
}) => {
  const getPrompt = () => {
    const name = userAsset.name;

    let s = `${name} (you): `;
    const tm = typingMap.getMap();
    const specs = Array.from(tm.values()).filter((spec) => spec.typing);
    if (specs.length > 0) {
      const names = specs.map((spec) => spec.name);
      const typingLine = `[${names.join(', ')} ${specs.length > 1 ? 'are' : 'is'} typing...] `;
      s = typingLine + s;
    }
    return s;
  };
  typingMap.addEventListener('typingchange', (e) => {
    if (replServer) {
      const s = getPrompt();
      replServer.setPrompt(s);
      replServer.displayPrompt(true);
    }
  });

  let replServer = null;
  if (startRepl) {
    const getDoc = () => {
      const headRealm = realms.getClosestRealm(realms.lastRootRealmKey);
      const { networkedCrdtClient } = headRealm;
      const doc = networkedCrdtClient.getDoc();
      return doc;
    };

    replServer = repl.start({
      prompt: getPrompt(),
      eval: async (cmd, context, filename, callback) => {
        cmd = cmd.replace(/;?\s*$/, '');

        if (cmd) {
          const cmdSplit = cmd.split(/\s+/);
          const commandMatch = (cmdSplit[0] ?? '').match(/^\/(\S+)/);
          if (commandMatch) {
            const command = commandMatch ? commandMatch[1] : null;
            switch (command) {
              /* case 'nudge': {
                let guid = cmdSplit[1];
                if (!guid) {
                  const agentIds = Array.from(playersMap.keys());
                  shuffle(agentIds);
                  guid = agentIds[0];
                }

                await nudge(realms, guid);

                break;
              } */
              case 'get': {
                const key = cmdSplit[1];

                const doc = getDoc();
                if (key) {
                  const text = doc.getText(key);
                  const s = text.toString();
                  console.log(s);
                } else {
                  const j = doc.toJSON();
                  console.log(j);
                }
                break;
              }
              case 'set': {
                const key = cmdSplit[1];
                const value = cmdSplit[2];

                if (key && value) {
                  const doc = getDoc();
                  doc.transact(() => {
                    const text = doc.getText(key);
                    text.delete(0, text.length);
                    text.insert(0, value);
                  });
                } else {
                  throw new Error('expected 2 arguments');
                }
                break;
              }
              default: {
                console.log('unknown command', command);
                break;
              }
            }
          } else {
            const userId = userAsset.id;
            const name = userAsset.name;
            await realms.sendChatMessage({
              method: 'say',
              userId,
              name,
              args: {
                text: cmd,
              },
              timestamp: Date.now(),
            });
          }
        }

        callback();
      },
      ignoreUndefined: true,
    });
  }
  const exit = (e) => {
    process.exit(0);
  };
  if (replServer) {
    replServer.on('exit', exit);
  }

  const _bindRealmsLogging = () => {
    setLogFn((...args) => {
      process.stdout.write(eraseLine);
      console.log(...args);
      if (replServer) {
        replServer.displayPrompt(true);
      }
    });
  };
  _bindRealmsLogging();
};
/* const createWebcamSource = ({ local }) => {
  const webcamSource = new EventTarget();

  const wss = new WebSocketServer({ noServer: true });
  wss.binaryType = 'arraybuffer';

  const serverOpts = getServerOpts();
  const server = https.createServer(serverOpts, (req, res) => {
    // set cors
    const corsHeaders = makeCorsHeaders(req);
    for (const { key, value } of corsHeaders) {
      res.setHeader(key, value);
    }

    // handle methods
    if (req.method === 'OPTIONS') {
      res.end();
    } else {
      res.statusCode = 404;
      res.end();
    }
  });
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  });
  wss.on('connection', (ws, request) => {
    ws.addEventListener('message', e => {
      // if it's an array buffer, send it to the room
      if (e.data instanceof Buffer) {
        webcamSource.dispatchEvent(new MessageEvent('frame', {
          data: {
            imageData: e.data,
          },
        }));
      } else {
        console.warn('got non-arraybuffer webcam message', e.data);
      }
    });
  });
  server.on('error', (err) => {
    console.warn('callback server error', err);
  });
  // server.on('close', () => {
  //   console.log('callback server closed');
  // });
  server.listen(webcamPort, '0.0.0.0', (err) => {
    // console.log('callback server listening on port', {
    //   callbackPort,
    // });
    if (err) {
      console.warn(err);
    } else {
      const _webcamHost = local
        ? `https://local.upstreet.ai:4443`
        : `https://login.upstreet.ai`;
      const p = `${_webcamHost}/webcamtool`;
      // console.log(`Waiting for webcam connection at ${p}`);
      open(p);
    }
  });
  return webcamSource;
}; */
const connect = async (args) => {
  const room = args._[0] ?? '';
  const local = !!args.local;
  const debug = !!args.debug;
  // const vision = !!args.vision;
  const browser = !!args.browser;
  const startRepl = typeof args.repl === 'boolean' ? args.repl : !browser;

  if (room) {
    // set up the chat
    const { userAsset, realms, playersMap, typingMap } =
      await connectMultiplayer({
        room,
        debug,
      });
    if (browser) {
      const _chatEndpointUrl = local
        ? `http://localhost:3000`
        : chatEndpointUrl;
      open(`${_chatEndpointUrl}/rooms/${room}`)
        .catch( console.error );
    }
    if (startRepl) {
      startMultiplayerListener({
        userAsset,
        realms,
        playersMap,
        typingMap,
        startRepl: true,
      });
    }

    /* // set up the webcam, if needed
    if (vision) {
      const webcamSource = createWebcamSource({
        local,
      });
      webcamSource.addEventListener('frame', (e) => {
        const uint8Array = new Uint8Array(e.data.imageData.buffer, e.data.imageData.byteOffset, e.data.imageData.byteLength);
        console.log('got webcam frame', uint8Array);
        // XXX use a video client for this
        // realms.sendChatMessage({
        //   method: 'videoFrame',
        //   userId,
        //   args: {
        //     imageData: e.data,
        //   },
        // });
      });
    } */

    return {
      userAsset,
      realms,
      playersMap,
      typingMap,
    };
  } else {
    console.log('no room name provided');
    process.exit(1);
  }
};
const connectAgentWs = (guidOrDevPathIndex, { dev }) =>
  new Promise((accept, reject) => {
    const agentHost = getAgentHost(
      !dev ? guidOrDevPathIndex : guidOrDevPathIndex.portIndex,
      {
        dev,
      },
    );
    // console.log('got agent host', guidOrDevPathIndex, agentHost);
    const u = `${agentHost.replace(/^http/, 'ws')}/ws`;
    // console.log('handle websocket', u);
    // await pause();
    const ws = new WebSocket(u);
    ws.addEventListener('open', () => {
      accept(ws);
    });
    ws.addEventListener('message', (e) => {
      // const message = e.data;
      // console.log('got ws message', guid, message);
    });
    ws.addEventListener('error', (err) => {
      console.warn('unhandled ws rejection', err);
      reject(err);
    });
    // ws.addEventListener('message', (e) => {
    //   console.log('got ws message', e);
    // });
  });
const getGuidFromPath = async (p) => {
  const wranglerTomlPath = path.join(p, 'wrangler.toml');
  const wranglerTomString = await fs.promises.readFile(wranglerTomlPath, 'utf8');
  const wranglerToml = toml.parse(wranglerTomString);
  return wranglerToml.vars.GUID;
};
const normalizeGuidInputs = async (guidsOrDevPathIndexes, { dev }) => {
  if (guidsOrDevPathIndexes.length === 0) {
    if (!dev) {
      const guid = await getGuidFromPath(cwd);
      guidsOrDevPathIndexes = [guid];
    } else {
      guidsOrDevPathIndexes = [{
        agentDirectory: cwd,
        portIndex: 0,
      }];
    }
  } else {
    if (!dev) {
      guidsOrDevPathIndexes = await Promise.all(guidsOrDevPathIndexes.map(async (guidOrDevPathIndex) => {
        if (isGuid(guidOrDevPathIndex)) {
          return guidOrDevPathIndex;
        } else {
          const guid = await getGuidFromPath(guidOrDevPathIndex);
          return guid;
        }
      }));
    }
  }
  return guidsOrDevPathIndexes;
};
const chat = async (args) => {
  // console.log('got chat args', JSON.stringify(args));
  let guidsOrDevPathIndexes = args._[0] ?? [];
  const dev = !!args.dev;
  const room = args.room ?? makeRoomName();
  const debug = !!args.debug;

  // ensure guids
  guidsOrDevPathIndexes = await normalizeGuidInputs(guidsOrDevPathIndexes, { dev });

  const jwt = await getLoginJwt();
  if (jwt !== null) {
    // start the dev agents, if applicable
    if (dev) {
      const devServerPromises = guidsOrDevPathIndexes.map(async (guidOrDevPathIndex) => {
        const cp = await startDevServer(guidOrDevPathIndex, {
          debug,
        });
        return cp;
      });
      await Promise.all(devServerPromises);
    }

    // wait for agents to join the multiplayer room
    const wsPromises = Promise.all(
      guidsOrDevPathIndexes.map(async (guidOrDevPathIndex) => {
        return await join({
          _: [guidOrDevPathIndex, room],
          dev,
          // debug,
        });
      }),
    );
    const webSockets = await wsPromises;

    // connect to the chat
    await connect({
      _: [room],
      browser: args.browser,
      debug: args.debug,
      local: args.local,
      // vision: args.vision,
    });

    return {
      // ws: webSockets[0],
      close: () => {
        for (const ws of webSockets) {
          ws.close();
        }
      },
    };
  } else {
    console.log('not logged in');
    process.exit(1);
  }
};
/* const simulate = async (args) => {
  let guidsOrDevPathIndexes = args._[0] ?? [];
  const dev = !!args.dev;
  const room = args.room ?? makeRoomName();
  const debug = !!args.debug;

  // ensure guids
  if (guidsOrDevPathIndexes.length === 0) {
    if (!dev) {
      const guid = await getGuidFromPath(cwd);
      guidsOrDevPathIndexes = [guid];
    } else {
      guidsOrDevPathIndexes = [{
        agentDirectory: cwd,
        portIndex: 0,
      }];
    }
  } else {
    if (!dev) {
      guidsOrDevPathIndexes = await Promise.all(guidsOrDevPathIndexes.map(async (guidOrDevPathIndex) => {
        if (isGuid(guidOrDevPathIndex)) {
          return guidOrDevPathIndex;
        } else {
          const guid = await getGuidFromPath(guidOrDevPathIndex);
          return guid;
        }
      }));
    }
  }

  // wait for agents to join the multiplayer room
  const wsPromises = Promise.all(
    guidsOrDevPathIndexes.map(async (guidOrDevPathIndex) => {
      return await join({
        _: [guidOrDevPathIndex, room],
        local: args.local,
        dev,
        debug,
      })
    }),
  );
  const webSockets = await wsPromises;

  const { userAsset, realms, playersMap, typingMap } =
    await connectMultiplayer({
      room,
      anonymous: true,
      debug,
    });
  startMultiplayerListener({
    userAsset,
    realms,
    playersMap,
    typingMap,
    // startRepl: false,
  });

  // collect the guids
  const guids = await Promise.all(
    guidsOrDevPathIndexes.map(async (guidOrDevPathIndex) => {
      if (isGuid(guidOrDevPathIndex)) {
        return guidOrDevPathIndex;
      } else {
        const guid = await getGuidFromPath(guidOrDevPathIndex.agentDirectory);
        return guid;
      }
    }),
  );

  // nudge a random agent
  const _nudge = async () => {
    const agentId = shuffle(guids)[0];
    await nudge(realms, agentId);
  };
  await _nudge();

  return {
    // ws: webSockets[0],
    close: () => {
      for (const ws of webSockets) {
        ws.close();
      }
    },
  };
}; */
const logs = async (args) => {
  let guidsOrDevPathIndexes = args._[0] ?? [];

  guidsOrDevPathIndexes = await normalizeGuidInputs(guidsOrDevPathIndexes, {
    dev: false,
  });

  const jwt = await getLoginJwt();
  if (jwt) {
    const eventSources = guidsOrDevPathIndexes.map((guidOrDevPathIndex) => {
      const u = `${deployEndpointUrl}/agents/${guidOrDevPathIndex}/logs`;
      const eventSource = new EventSource(u, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });
      eventSource.addEventListener('message', (e) => {
        const j = JSON.parse(e.data);
        if (typeof j === 'string') {
          process.stdout.write(j);
        } else {
          console.log(j);
        }
      });
      eventSource.addEventListener('error', (e) => {
        console.warn('error', e);
      });
      eventSource.addEventListener('close', (e) => {
        process.exit(0);
      });
    });

    return {
      close: () => {
        for (const eventSource of eventSources) {
          eventSource.close();
        }
      },
    };
  } else {
    console.log('not logged in');
    process.exit(1);
  }
};
const listen = async (args) => {
  let guidsOrDevPathIndexes = args._[0] ?? [];
  const dev = !!args.dev;
  const debug = !!args.debug;

  // ensure guids
  if (guidsOrDevPathIndexes.length === 0) {
    if (!dev) {
      const guid = await getGuidFromPath(cwd);
      guidsOrDevPathIndexes = [guid];
    } else {
      guidsOrDevPathIndexes = [{
        agentDirectory: cwd,
        portIndex: 0,
      }];
    }
  } else {
    if (!dev) {
      guidsOrDevPathIndexes = await Promise.all(guidsOrDevPathIndexes.map(async (guidOrDevPathIndex) => {
        if (isGuid(guidOrDevPathIndex)) {
          return guidOrDevPathIndex;
        } else {
          const guid = await getGuidFromPath(guidOrDevPathIndex);
          return guid;
        }
      }));
    }
  }

  let webSockets = [];
  if (dev) {
    // wait for agents to join the multiplayer 
    const room = makeRoomName();
    const wsPromises = Promise.all(
      guidsOrDevPathIndexes.map(async (guidOrDevPathIndex) => {
        return await join({
          _: [guidOrDevPathIndex, room],
          local: args.local,
          dev,
          debug,
        })/* .then(() => {
          console.log('join promise ok');
        }).catch((err) => {
          console.warn('join promise error', err);
        }); */
      }),
    );
    webSockets = await wsPromises;
  }


  const eventSources = guidsOrDevPathIndexes.map((guidOrDevPathIndex) => {
    const agentHost = getAgentHost(
      !dev ? guidOrDevPathIndex : guidOrDevPathIndex.portIndex,
      {
        dev,
      },
    );

    const eventSource = new EventSource(`${agentHost}/events`);
    eventSource.addEventListener('message', (e) => {
      const j = JSON.parse(e.data);
      console.log('event source', j);
    });
    eventSource.addEventListener('error', (e) => {
      console.warn('error', e);
    });
    eventSource.addEventListener('close', (e) => {
      process.exit(0);
    });
  });

  return {
    // ws: webSockets[0],
    close: () => {
      for (const ws of webSockets) {
        ws.close();
      }
      for (const eventSource of eventSources) {
        eventSource.close();
      }
    },
  };
};
// XXX rename command to charge or refill
const fund = async (args) => {
  const local = !!args.local;
  const dev = !!args.dev;
  let guid = await (async () => {
    if (!dev) {
      return args._[0] ?? '';
    } else {
      return await ensureLocalGuid(); // XXX use the agent's local guid
    }
  })();
  let amount = parseFloat(args._[1]) || 0;
  if (!guid) {
    console.warn('need guid');
    process.exit(1);
  }

  const result = await new Promise((accept, reject) => {
    const serverOpts = getServerOpts();
    const server = https.createServer(serverOpts, (req, res) => {
      // set cors
      const corsHeaders = makeCorsHeaders(req);
      for (const { key, value } of corsHeaders) {
        res.setHeader(key, value);
      }

      // handle methods
      if (req.method === 'OPTIONS') {
        res.end();
      } else if (req.method === 'POST') {
        const bs = [];
        req.on('data', (d) => {
          bs.push(d);
        });
        req.on('end', async () => {
          // respond to the page
          res.end();

          // close the server
          server.close();

          const b = Buffer.concat(bs);
          const s = b.toString('utf8');
          const j = JSON.parse(s);
          accept(j);
        });
      } else {
        res.statusCode = 405;
        res.end();
      }
    });
    server.listen(callbackPort, (err) => {
      if (err) {
        console.warn(err);
      } else {
        const _loginHost = local
          ? `https://local.upstreet.ai:4443`
          : `https://login.upstreet.ai`;
        const p = `${_loginHost}/wallettool?method=${'fund'}&dstGuid=${guid}&amount=${amount}`;
        console.log(`Waiting for funding at ${p}`);
        open(p);
      }
    });
  });
  console.log('got funding result', result);
  process.exit(0);
};
const deposit = async (args) => {
  const local = !!args.local;
  const dev = !!args.dev;
  const network = args.network;
  let guid = await (async () => {
    if (!dev) {
      return args._[0] ?? '';
    } else {
      return await ensureLocalGuid(); // XXX use the agent's local guid
    }
  })();
  let amount = parseFloat(args._[1]) || 0;

  const address = await (async () => {
    const jwt = await getLoginJwt();
    if (jwt) {
      const supabase = makeSupabase(jwt);
      const agentJson = await getAssetJson(supabase, guid);
      if (agentJson) {
        return agentJson.address;
      } else {
        console.warn('no agent found: ' + guid);
        process.exit(1);
      }
    } else {
      console.log('not logged in');
      process.exit(1);
    }
  })();

  const result = await new Promise((accept, reject) => {
    const serverOpts = getServerOpts();
    const server = https.createServer(serverOpts, (req, res) => {
      // set cors
      const corsHeaders = makeCorsHeaders(req);
      for (const { key, value } of corsHeaders) {
        res.setHeader(key, value);
      }

      // handle methods
      if (req.method === 'OPTIONS') {
        res.end();
      } else if (req.method === 'POST') {
        const bs = [];
        req.on('data', (d) => {
          bs.push(d);
        });
        req.on('end', async () => {
          // respond to the page
          res.end();

          // close the server
          server.close();

          const b = Buffer.concat(bs);
          const s = b.toString('utf8');
          const j = JSON.parse(s);
          accept(j);
        });
      } else {
        res.statusCode = 405;
        res.end();
      }
    });
    server.listen(callbackPort, (err) => {
      if (err) {
        console.warn(err);
      } else {
        const host = local
          ? `https://local.upstreet.ai:4443`
          : `https://login.upstreet.ai`;
        const p = `${host}/wallettool?method=${'deposit'}&dstAddress=${address}&network=${network}&amount=${amount}`;
        console.log(`Waiting for deposit at ${p}`);
        open(p);
      }
    });
  });
  console.log('got deposit result', result);
};
const withdraw = async (args) => {
  const guid = args._[0] ?? '';
  const amount = parseFloat(args._[1]) || 0;
  const destinationAddress = args._[2] ?? '';
  const network = args.network ?? Object.keys(providers)[0];
  if (!guid) {
    console.warn('need guid');
    process.exit(1);
  }
  if (!destinationAddress) {
    console.warn('need destination address');
    process.exit(1);
  }

  const jwt = await getLoginJwt();
  if (jwt) {
    const supabase = makeSupabase(jwt);

    const mnemonic = await getAgentMnemonic(supabase, guid);
    const wallets = getConnectedWalletsFromMnemonic(mnemonic);
    const wallet = wallets[network];

    // send
    const wei = BigInt(amount * 1e18);
    console.log('send transaction', {
      to: destinationAddress,
      value: '0x' + wei.toString(16),
    });
    const tx = await wallet.sendTransaction({
      to: destinationAddress,
      value: '0x' + wei.toString(16),
    });
    console.log('got tx', { tx });

    // wait for the tx receipt
    const receipt = await tx.wait();
    console.log('got receipt', { receipt });
  } else {
    console.log('not logged in');
    process.exit(1);
  }
};
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
const generateAgentJsonFromPrompt = async (prompt, style = 'Simple 2d anime style with strong lines and bold colors.') => {
  const jwt = await getLoginJwt();
  if (jwt) {
    const numRetries = 5;
    for (let i = 0; i < numRetries; i++) {
      const messages = [
        {
          role: 'system',
          content: dedent`
            You are an AI agent profile generator. The user will specify a prompt, and you will generate an agent profile based on it.
            Agents are not chatbots, apps, or assistants. They are simulated characters with unique personalities, backgrounds, and abilities.
            Respond in proper JSON! You must escape newlines (i.e. \n)!
            The format is:
            \`\`\`
            {
              "name": "A name for the agent",
              "description": "A short description of the agent. This will be used in search results, meta tags, and profile pages. It can be a few sentences long.",
              "bio": "A more in-depth simulated biography for the agent. It can be up to a few paragraphs long.",
              "visualDescription": "A visual description of what the agent looks like, as a short image prompt.",
            }
            \`\`\`
          `,
        },
        {
          role: 'user',
          content: `Generate an agent for the following prompt:\n${prompt}`,
        },
      ];
      localStorage.setItem('jwt', JSON.stringify(jwt));
      try {
        const content = await fetchChatCompletion({
          model: generationModel,
          messages,
        });
        const codeBlock = parseCodeBlock(content);
        const j = JSON.parse(codeBlock);
        j.visualDescription = `${style} ${prompt}`;
        return j;
      } catch (err) {
        console.warn('chat completion error', err);
        continue;
      }
      /* if (proxyRes.ok) {
        const j = await proxyRes.json();
        const content = j.choices[0].message.content;
        try {
          const codeBlock = parseCodeBlock(content);
          const j = JSON.parse(codeBlock);
          j.visualDescription = `${style} ${prompt}`;
          return j;
        } catch (err) {
          // console.warn('could not parse generated agent json', content);
          continue;
        }
      } else {
        const text = await proxyRes.text();
        console.warn('chat completion failed', proxyRes.status, text);
        continue;
      } */
    }
  } else {
    throw new Error('not logged in');
  }
};
const generateImage = async (prompt, opts = {}) => {
  const jwt = await getLoginJwt();
  if (jwt) {
    const numRetries = 5;
    for (let i = 0; i < numRetries; i++) {
      const {
        model = 'dall-e-3',
        width = 1024, // [1024, 1792]
        height = 1024,
        quality = 'hd', // ['hd', 'standard']
      } = opts;
      // localStorage.setItem('jwt', JSON.stringify(jwt));
      const u = `${aiHost}/api/ai/images/generations`;
      const j = {
        prompt,
        model,
        size: `${width}x${height}`,
        quality,
        n: 1,
      };
      const res = await fetch(u, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(j),
      });
      if (res.ok) {
        const json = await res.json();
        const imageUrl = json.data[0].url;
        const res2 = await fetch(imageUrl);
        if (res2.ok) {
          const arrayBuffer = await res2.arrayBuffer();
          return arrayBuffer;
        } else {
          const text = await res2.text();
          console.warn('generate image fetch error', text);
          // throw new Error(`image generation error: ${text}`);
          continue;
        }
      } else {
        const json = await res.json();
        const { error } = json;
        console.log('got generate image error', {
          prompt,
          error,
        });
        // throw new Error(`image generation error: ${error}`);
        continue;
      }
    }
    throw new Error('image generation failed');
  } else {
    throw new Error('not logged in');
  }
};
const getCodeGenContext = async () => {
  // load the component jsdoc nodes
  const nodes = await (async () => {
    // generate new components based on the actions the agent should be allowed to take
    const defaultComponentsPath = path.join(
      BASE_DIRNAME,
      'sdk',
      'src',
      'default-components.tsx',
    );
    const componentsPath = path.join(
      BASE_DIRNAME,
      'sdk',
      'src',
      'components.ts',
    );
    const paths = [
      defaultComponentsPath,
      componentsPath,
    ];
    
    const nodes = [];
    for (const p of paths) {
      // read the file
      let s = await fs.promises.readFile(p, 'utf8');
      // remove everything up to and including the line "// END IMPORTS", including newlines
      s = s.replace(/[\s\S]*?\/\/ END IMPORTS\n/, '');
      // write the file to tmp dir
      const tmpDir = await makeTempDir();
      const p2 = path.join(tmpDir, path.basename(p));
      await fs.promises.writeFile(p2, s);
      // convert to data url
      // console.log('got doc nodes 1', { p2 });
      let ns = await doc(`file://${p2}`);
      // console.log('got doc nodes 2', nodes);
      // filter to only documented nodes
      ns = ns.filter((node) => !!node.jsDoc);
      ns.splice(
        ns.findIndex(node => node.name === 'DefaultAgentComponents'),
        1,
      );
      ns = ns.map((node) => ({
        ...node.jsDoc,
        name: node.name,
      }));
      // add to the nodes
      nodes.push(...ns);
      await rimraf(tmpDir);
    }
    // console.log('got doc nodes 3', JSON.stringify(nodes, null, 2));

    return nodes;
  })();
  // console.log('got nodes', JSON.stringify(nodes, null, 2));

  return {
    nodes,
  };
};
const generateTemplateFromPrompt = async (prompt) => {
  // create a temporary directory
  const templateDirectory = await makeTempDir();

  // copy over the basic template
  const basicTemplateDirectory = path.join(templatesDirectory, 'empty');
  await recursiveCopy(basicTemplateDirectory, templateDirectory);

  // generate the agent json
  const agentJson = await generateAgentJsonFromPrompt(prompt);

  console.log(pc.italic('Generating code...'));
  const agentJSXPath = path.join( templateDirectory, 'agent.tsx' );
  const codeGenContext = await getCodeGenContext();
  const { imports } = await modifyAgentJSXWithGeneratedCode({
    agentJSXPath,
    prompt,
    codeGenContext,
  });
  console.log('\nUsing components:');
  console.log(
    imports
      .map(x => '- ' + pc.cyan(x))
      .join('\n')
      .trim() + '\n'
  );

  console.log(pc.italic('Generating avatar...'));
  // generate the agent preview_url
  const imageArrayBuffer = await generateImage(agentJson.visualDescription);
  // upload to r2
  const imageGuid = crypto.randomUUID();
  const previewUrl = await putFile(`previews/${imageGuid}.png`, imageArrayBuffer);
  // set the agentJson preview url
  agentJson.previewUrl = previewUrl;

  // write back the generated the agent json
  await fs.promises.writeFile(
    path.join(templateDirectory, agentJsonSrcFilename),
    JSON.stringify(agentJson, null, 2),
  );

  return {
    templateDirectory,
    agentJson,
  };
};
const buildWranglerToml = (
  t,
  { name, guid, agentJson, mnemonic, agentToken },
) => {
  t.name = name;
  // t.tail_consumers[0].service = name;
  t.vars.GUID = guid;
  t.vars.AGENT_JSON = JSON.stringify(agentJson);
  t.vars.WALLET_MNEMONIC = mnemonic;
  if (agentToken) {
    t.vars.AGENT_TOKEN = agentToken;
  } else {
    console.warn(
      dedent`
        Note: you are not logged in, so the agent token will not be set. You can set this later by doing:
          usdk login
          usdk authorize
      `,
    );
  }
  return t;
};
const setWranglerTomlAgentToken = (
  t,
  { agentToken },
) => {
  t.vars.AGENT_TOKEN = agentToken;
  return t;
};
const getAgentToken = async (jwt, guid) => {
  const jwtRes = await fetch(`${metamaskHost}/agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      agentId: guid,
      supabaseJwt: jwt,
    }),
  });
  if (jwtRes.ok) {
    return jwtRes.json();
  } else {
    const text = await jwtRes.text();
    console.warn(
      `Failed to get agent token: ${text}`,
    );
  }
};
const create = async (args) => {
  // Ensure user is logged in.
  const guid = makeDevGuid();
  const jwt = await getLoginJwt();
  let agentToken = null;
  let userPrivate = null;
  if (jwt !== null) {
    [agentToken, userPrivate] = await Promise.all([
      getAgentToken(jwt, guid),
      getUserForJwt(jwt, {
        private: true,
      }),
    ]);
    if (!agentToken) {
      console.warn('Authorization error. Please try logging in again.')
      process.exit(1)
    }
  } else {
    console.warn('You must be logged in to create an agent.');
    process.exit(1)
  }

  if (args.prompt && args.template) {
    console.warn('cannot use both prompt and --template');
    process.exit(1);
  }

  const dstDir = args._[0] ?? cwd;
  const prompt = args._[1] ?? '';
  const force = !!args.force;
  const forceNoConfirm = !!args.forceNoConfirm;
  const dev = !!args.dev;
  const template = args.template ?? 'basic';

  const mnemonic = generateMnemonic();
  const wallet = getWalletFromMnemonic(mnemonic);
  const walletAddress = wallet.address.toLowerCase();

  const stripeConnectAccountId = userPrivate?.stripe_connect_account_id;

  // read agent files
  console.log(pc.italic('\nReading files...'));
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

        if (!isYes(answer)) process.exit(1);
      }

      // Remove all files.
      await Promise.all(
        files.map((filePath) => rimraf(path.join(dstDir, filePath))),
      );
    } else {
      // throw error
      console.log('directory is not empty (-f to override)');
      console.log('files (' + dstDir + '):\n' + files.slice(0, 8).join('\n'));
      process.exit(1);
    }
  }

  // bootstrap destination directory
  await mkdirp(dstDir);

  // generate the agent if necessary
  let srcTemplateDir;
  let agentJson = {};
  if (prompt) {
    if (jwt) {
      console.log(pc.italic('Generating agent...'));
      const generateTemplateResponse =
        await generateTemplateFromPrompt(prompt);

      agentJson = generateTemplateResponse.agentJson;
      srcTemplateDir = generateTemplateResponse.templateDirectory;

      console.log(pc.italic('Generated agent.'));
    } else {
      throw new Error('not logged in: cannot generate agent from prompt');
    }
  } else {
    srcTemplateDir = path.join(templatesDirectory, template);
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

  // const srcAgentJson = path.join(srcTemplateDir, agentJsonSrcFilename);

  const srcSdkDir = path.join(BASE_DIRNAME, 'sdk');
  const srcDstDir = path.join(dstDir, 'sdk');

  const srcTsconfigPath = path.join(BASE_DIRNAME, 'tsconfig.json');
  const dstTsconfigPath = path.join(dstDir, 'tsconfig.json');

  const srcJestConfigPath = path.join(BASE_DIRNAME, 'jest.config.js');
  const dstJestConfigPath = path.join(dstDir, 'jest.config.js');

  // compile the agent json
  // const agentJsonString = await fs.promises.readFile(srcAgentJson, 'utf8');
  // const agentJson = JSON.parse(agentJsonString);
  compileAgentJson(agentJson, {
    guid,
    stripeConnectAccountId,
    walletAddress,
    dev,
  });

  // copy over the template files
  console.log(pc.italic('Copying files...'));
  const name = getAgentName(guid);
  const opts = {
    // overwrite: force,
  };
  await Promise.all([
    // template -> root
    recursiveCopy(srcTemplateDir, dstDir, {
      ...opts,
      filter: srcTemplateFilter,
    }),
    // root package.json
    mergeJson(dstPackageJsonPath, srcPackageJsonPaths, (a, b) => {
      return {
        ...a,
        ...b,
        name,
        dependencies: {
          ...a.dependencies,
          ...b.dependencies,
          'react-agents': 'file:./sdk/src',
        },
      };
    }),
    // root tsconfig
    recursiveCopy(srcTsconfigPath, dstTsconfigPath, opts),
    // root jest config
    recursiveCopy(srcJestConfigPath, dstJestConfigPath, opts),
    // root wrangler.toml
    copyWithStringTransform(srcWranglerToml, dstWranglerToml, (s) => {
      let t = toml.parse(s);
      t = buildWranglerToml(t, { name, guid, agentJson, mnemonic, agentToken });
      return toml.stringify(t);
    }),
    // sdk directory
    recursiveCopy(srcSdkDir, srcDstDir, opts),
  ]);

  // npm install
  console.log(pc.italic('Installing dependencies...'));
  try {
    const execFile = util.promisify(child_process.execFile);
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

  return {
    guid,
    mnemonic,
    agentJson,
  };
};
const devAgentUrl = `http://local.upstreet.ai:${devServerPort}`;
const devAgentJsonUrl = `${devAgentUrl}/${agentJsonDstFilename}`;
const makeRoomName = () => `room:` + makeId(8);
const dev = async (args) => {
  const subcommand = args._[0] ?? '';
  const guidsOrDevPathIndexes = args._[1] ?? [];

  switch (subcommand) {
    case 'chat': {
      // defer to conversation mode
      await chat({
        _: [guidsOrDevPathIndexes],
        browser: args.browser,
        dev: true,
        // vision: args.vision,
        debug: args.debug,
      });

      break;
    }
    case 'listen': {
      await listen({
        _: [guidsOrDevPathIndexes],
        dev: true,
        local: args.local,
        // vision: args.vision,
        debug: args.debug,
      });

      break;
    }

    case 'ls': {
      await ls({
        _: [],
        dev: true,
        network: args.network,
      });

      break;
    }
    case 'fund': {
      await fund({
        _: [],
        local: args.local,
        network: args.network,
        dev: true,
      });

      break;
    }
    case 'deposit': {
      await deposit({
        _: [],
        local: args.local,
        network: args.network,
        dev: true,
      });

      break;
    }
    case '': {
      // nothing
      break;
    }
    default: {
      console.warn(`unknown subcommand: ${subcommand}`);
      process.exit(1);
    }
  }
};
const search = async (args) => {
  const prompt = args._[0] ?? '';

  const jwt = await getLoginJwt();
  const userId = jwt && (await getUserIdForJwt(jwt));
  if (userId) {
    if (prompt) {
      const supabase = makeAnonymousClient(env);
      localStorage.setItem('jwt', JSON.stringify(jwt));
      const embedding = await lembed(prompt);
      /*
        call the supabase function:
        function match_assets(
          embedding vector(3072),
          match_threshold float,
          match_count int
        )
      */
      const result = await supabase.rpc('match_assets', {
        query_embedding: embedding,
        match_threshold: 0.2,
        match_count: 10,
      });
      const { error, data } = result;
      if (!error) {
        const assets = data.map((asset) => {
          return `${asset.id}: ${asset.name ?? ''}: ${asset.description ?? ''}`;
        });
        console.log(assets.join('\n'));
      } else {
        console.warn(error);
        process.exit(1);
      }
    } else {
      throw new Error('no prompt');
    }
  } else {
    throw new Error('not logged in');
  }
};
const getNpmRoot = async () => {
  const { stdout } = await execFile('npm', ['root', '--quiet', '-g']);
  return stdout.trim();
};
const ensureNpmRoot = (() => {
  let npmRootPromise = null;
  return () => {
    if (npmRootPromise === null) {
      npmRootPromise = getNpmRoot();
    }
    return npmRootPromise;
  };
})();
const runJest = async (agentDirectory) => {
  const npmRoot = await ensureNpmRoot();
  await execFile(process.argv[0], ['--experimental-vm-modules', jestBin], {
    stdio: 'inherit',
    cwd: agentDirectory,
    env: {
      NODE_PATH: npmRoot, // needed to import usdk
    },
  });
};
const getDirectoryZip = async (dirPath, { exclude = [] } = {}) => {
  // console.log('get directory zip', dirPath);
  let files = await recursiveReaddir(dirPath);
  files = files.filter((p) => !exclude.some((re) => re.test(p)));
  // console.log('got files', files);

  const zip = new JSZip();
  // const queueManager = new QueueManager({
  //   parallelism: 32,
  // });
  // const promises = [];
  for (const p of files) {
    // const promise = queueManager.waitForTurn(async () => {
      const basePath = p.slice(dirPath.length + 1);
      // const stats = await fs.promises.lstat(p);
      // if (stats.isFile()) {
        const stream = fs.createReadStream(p);
        zip.file(basePath, stream);
      // }
    // });
    // promises.push(promise);
  }
  // await Promise.all(promises);

  const arrayBuffer = await zip.generateAsync({
    type: 'arraybuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });
  const uint8Array = new Uint8Array(arrayBuffer);
  return uint8Array;
};
const extractZip = async (zipBuffer, tempPath) => {
  const cleanup = async () => {
    await rimraf(tempPath);
  };

  // read the zip file using jszip
  const zip = new JSZip();
  await zip.loadAsync(zipBuffer);
  const ps = [];
  const queueManager = new QueueManager({
    parallelism: 10,
  });
  zip.forEach((relativePath, zipEntry) => {
    const fullPathName = [tempPath, relativePath].join('/');

    if (!zipEntry.dir) {
      const p = (async () => {
        return await queueManager.waitForTurn(async () => {
          // check if the file exists
          let stats = null;
          try {
            stats = await fs.promises.lstat(fullPathName);
          } catch (err) {
            if (err.code === 'ENOENT') {
              // nothing
            } else {
              // console.warn(err.stack);
              throw err;
            }
          }
          if (stats === null) {
            // console.log('write file 1', fullPathName);
            const arrayBuffer = await zipEntry.async('arraybuffer');
            // console.log('write file 2', fullPathName);
            await mkdirp(path.dirname(fullPathName));
            // console.log('write file 3', fullPathName);
            await fs.promises.writeFile(
              fullPathName,
              Buffer.from(arrayBuffer),
            );
            // console.log('write file 4', fullPathName);
            return relativePath;
          } else {
            throw conflictError;
          }
        });
      })();
      ps.push(p);
    }
  });
  const files = await Promise.all(ps);
  return {
    files,
    cleanup,
  };
};
const test = async (args) => {
  let guidsOrDevPathIndexes = args._[0] ?? [];
  const all = !!args.all;
  const dev = true;
  const debug = !!args.debug;

  const jwt = await getLoginJwt();
  if (jwt !== null) {
    const runAgentTest = async (guidOrDevPathIndex) => {
      // console.log('got chat args', JSON.stringify(args));
      const {
        agentDirectory,
      } = guidOrDevPathIndex;

      // start the dev agents
      const cp = await startDevServer(guidOrDevPathIndex, {
        debug,
      });

      // wait for agents to join the multiplayer room
      const room = makeRoomName();
      const ws = await join({
        _: [guidOrDevPathIndex, room],
        dev,
        // debug,
      });

      // connect to the chat
      const {
        realms,
      } = await connect({
        _: [room],
        browser: false,
        repl: false,
        debug,
        local: false,
        // vision: false,
      });

      // run tests
      try {
        await runJest(agentDirectory);
      } finally {
        // clean up
        ws.close();
        realms.disconnect();
        process.kill(cp.pid, 'SIGTERM');
      }
    };
    const testTemplate = async (template) => {
      console.log('running template test: ' + template);

      // create the template
      const agentDirectory = await makeTempDir();
      await create({
        _: [agentDirectory],
        template,
      });

      await runAgentTest(agentDirectory);
    };

    if (all) {
      const templateNames = await getTemplateNames();
      for (const template of templateNames) {
        await testTemplate(template);
      }
    } else {
      guidsOrDevPathIndexes = await normalizeGuidInputs(guidsOrDevPathIndexes, { dev });
      for (const guidOrDevPathIndex of guidsOrDevPathIndexes) {
        await runAgentTest(guidOrDevPathIndex);
      }
    }
  } else {
    console.log('not logged in');
    process.exit(1);
  }
};
/* const capture = async (args) => {
  const microphone = args.microphone;
  const camera = args.camera;
  const screen = args.screen;
  const width = args.width;
  const height = args.height;
  const rows = args.rows;
  const cols = args.cols ?? 80;
  const execute = !!args.execute;

  if (camera && screen) {
    throw new Error('camera and screen are mutually exclusive');
  }

  const inputDevices = new InputDevices();
  const devices = await inputDevices.listDevices();

  if (
    microphone ||
    camera ||
    screen
  ) {
    const jwt = await getLoginJwt();
    if (jwt !== null) {
      // console.log('got devices', devices);
      const cameraDevice = typeof camera === 'boolean' ? inputDevices.getDefaultCameraDevice(devices.video) : devices.video.find(d => d.id === camera);
      const screenDevice = typeof screen === 'boolean' ? inputDevices.getDefaultScreenDevice(devices.video) : devices.video.find(d => d.id === screen);
      const microphoneDevice = typeof microphone === 'boolean' ? inputDevices.getDefaultMicrophoneDevice(devices.audio) : devices.audio.find(d => d.id === microphone);
      
      if (microphone) {
        if (!microphoneDevice) {
          throw new Error('invalid microphone device');
        }

        const myvad = await vad.NonRealTimeVAD.new({
          // positiveSpeechThreshold: 0.1,
          // negativeSpeechThreshold: 0.1,
        });
        const microphoneQueueManager = new QueueManager();

        const sampleRate = AudioInput.defaultSampleRate;
        // const numSamples = sampleRate * 2;
        // const numSamples = sampleRate / 2;
        const numSamples = sampleRate;
        const microphoneInput = inputDevices.getAudioInput(microphoneDevice.id, {
          sampleRate,
          numSamples,
        });

        const bs = [];
        let lastDetected = false;
        microphoneInput.on('data', async (d) => {
          // console.log('got mic data', d.length);
          // (async () => {
            await microphoneQueueManager.waitForTurn(async () => {
              bs.push(d);

              // console.time('lol');
              const asyncIterator = myvad.run(d, sampleRate);
              // console.log('run iter', numSamples);
              // const results = [];
              let detected = false;
              for await (const vadResult of asyncIterator) {
                // console.log('got vad result', vadResult);
                // results.push(vadResult);
                detected = true;
              }

              console.log('check detected', detected, lastDetected);

              if (detected) {
                // console.log('got vad results', results);
              } else {
                if (lastDetected) {
                  const mp3BufferPromise = encodeMp3(bs);
                  bs.length = 0;
                  const mp3Buffer = await mp3BufferPromise;

                  console.log('got mp3 buffer', mp3Buffer);
                  if (execute) {
                    const transcription = await transcribe(mp3Buffer, {
                      jwt,
                    });
                    console.log('got transcription:', JSON.stringify(transcription));
                  }
                } else {
                  // remove all except the last buffer
                  bs.splice(0, bs.length - 1);
                }
              }
              lastDetected = detected;
              // console.timeEnd('lol');
            });
          // })();
        });
      }
      
      if (camera) {
        if (!cameraDevice) {
          throw new Error('invalid camera device');
        }

        const cameraQueueManager = new QueueManager();
        
        const cameraInput = inputDevices.getVideoInput(cameraDevice.id, {
          width,
          height,
          fps: 5,
        });
        // cameraInput.on('data', (b) => {
        //   console.log('got camera data', b);
        // });
        cameraInput.on('frame', async (imageData) => {
          // console.log('got camera frame', imageData);
          cameraInput.drawImage(imageData, cols, rows);

          if (execute) {
            await cameraQueueManager.waitForTurn(async () => {
              // encode to webp
              const frame = await encodeWebp(imageData);

              // describe the image
              const text = await describe(frame, undefined, {
                jwt,
              });
              for (let i = 0; i < 30; i++) {
                console.log('description:', text);
              }

              // // send the video frame
              // const headRealm = realms.getClosestRealm(realms.lastRootRealmKey);
              // const {networkedVideoClient} = headRealm;
              // networkedVideoClient.sendVideoFrame(frame);
            });
          }
        });
      } else if (screen) {
        if (!screenDevice) {
          throw new Error('invalid screen device');
        }

        const screenQueueManager = new QueueManager();

        const screenInput = inputDevices.getVideoInput(screenDevice.id, {
          width,
          height,
          fps: 5,
        });
        // screenInput.on('data', (b) => {
        //   console.log('got screen data', b);
        // });
        screenInput.on('frame', async (imageData) => {
          // console.log('got screen frame', imageData);
          screenInput.drawImage(imageData, cols, rows);

          if (execute) {
            await screenQueueManager.waitForTurn(async () => {
              // encode to webp
              const frame = await encodeWebp(imageData);

              // describe the image
              const text = await describe(frame, undefined, {
                jwt,
              });
              for (let i = 0; i < 30; i++) {
                console.log('description:', text);
              }

              // // send the video frame
              // const headRealm = realms.getClosestRealm(realms.lastRootRealmKey);
              // const {networkedVideoClient} = headRealm;
              // networkedVideoClient.sendVideoFrame(frame);
            });
          }
        });
      }
    } else {
      console.log('not logged in');
      process.exit(1);
    }
  } else {
    // console.log('devices:');
    console.log(devices);
  }
}; */
// const deploymentTypes = ['agent', 'ui'];
const deploy = async (args) => {
  try {
    const agentDirectory = args._[0] ?? cwd;

    // log in
    const jwt = await getLoginJwt();
    const userId = jwt && (await getUserIdForJwt(jwt));
    if (userId) {
      const uint8Array = await getDirectoryZip(agentDirectory, {
        exclude: [/\/node_modules\//],
      });
      // console.log('got zip', agentDirectory, uint8Array.byteLength);

      // // XXX unzip to test location
      // const tempDir = await makeTempDir();
      // const { files, cleanup } = await extractZip(uint8Array, tempDir);
      // console.log('got temp dir', tempDir);

      // upload the agent
      const u = `${deployEndpointUrl}/agent`;
      // const proxyRes = await fetch(u, {
      //   method: 'PUT',
      //   headers: {
      //     Authorization: `Bearer ${jwt}`,
      //     'Content-Type': 'application/zip',
      //   },
      //   body: uint8Array,
      // });
      const req = https.request(u, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/zip',
          'Content-Length': uint8Array.byteLength,
        },
      });
      // create a stream to pass to the request
      const dataStream = new stream.PassThrough();
      dataStream.pipe(req);
      // dataStream.on('data', (b) => {
      // });
      // dataStream.on('end', (b) => {
      // });
      // pump the loop
      (async () => {
        const chunkSize = 4 * 1024;
        const logSize = (i) => {
          process.stdout.write(
            `\r${prettyBytes(i)} / ${prettyBytes(uint8Array.byteLength)} (${((i / uint8Array.byteLength) * 100).toFixed(2)}%)`,
          );
        };
        for (let i = 0; i < uint8Array.byteLength; i += chunkSize) {
          logSize(i);
          const slice = Buffer.from(uint8Array.slice(i, i + chunkSize));
          const ok = dataStream.write(slice);
          if (!ok) {
            await new Promise((accept) => {
              dataStream.once('drain', accept);
            });
          }
        }
        dataStream.end();

        logSize(uint8Array.length);
        console.log();
      })();
      const j = await new Promise((accept, reject) => {
        req.on('response', async (res) => {
          // console.log('got response', res.statusCode);

          const b = await new Promise((accept, reject) => {
            const bs = [];
            res.on('data', (b) => {
              bs.push(b);
            });
            res.on('end', async () => {
              const b = Buffer.concat(bs);
              accept(b);
            });
            res.on('error', reject);
          });
          const s = b.toString('utf8');
          // console.log('got response output', s);

          if (res.statusCode === 200) {
            const j = JSON.parse(s);
            accept(j);
          } else {
            reject(new Error('deploy failed: ' + s));
          }
        });
        req.on('error', reject);
      });
      const { guid, url, wranglerToml } = j;

      
      // write back the new wrangler.toml
      const wranglerTomlPath = path.join(agentDirectory, 'wrangler.toml');
      await fs.promises.writeFile(wranglerTomlPath, wranglerToml);
      
      console.log();
      console.group(pc.green('Agent Deployed Successfully:'), '\n');
      console.log(pc.cyan('✓ Host:'), url, '\n');
      console.log(pc.cyan('✓ Public Profile:'), getAgentPublicUrl(guid), '\n');
      console.log(pc.cyan('✓ Chat using the sdk, run:'), 'usdk chat ' + guid, '\n');

    } else {
      console.log('not logged in');
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
const ls = async (args) => {
  const network = args.network ?? Object.keys(providers)[0];
  // const local = !!args.local;
  const dev = !!args.dev;

  const queueManager = new QueueManager({
    parallelism: 8,
  });

  const listAssets = async (supabase, agentAssets) => {
    const table = new Table({
      head: [
        'id',
        'name',
        'enabled',
        'address',
        'location',
        'balance',
        'battery',
        // 'bio',
        'server',
        'created',
      ],
      colWidths: [38, 20, 9, 44, 10, 10, 10, /*40,*/ 73, 10],
    });
    const promises = [];
    for (let i = 0; i < agentAssets.length; i++) {
      const agent = agentAssets[i];
      const agentHost = getAgentHost(agent.id, {
        dev,
      });
      const p = queueManager.waitForTurn(async () => {
        const statusPromise = (async () => {
          const u = `${agentHost}/status`;
          const proxyRes = await fetch(u);
          if (proxyRes.ok) {
            const j = await proxyRes.json();
            return j;
          } else {
            return null;
          }
        })();
        const creditsPromise = (async () => {
          const creditsResult = await supabase
            .from('credits')
            .select('credits')
            .eq('agent_id', agent.id)
            .maybeSingle();
          const { error, data } = creditsResult;
          if (!error) {
            return data?.credits ?? 0;
          } else {
            throw new Error(
              `could not get credits for agent ${agent.id}: ${error}`,
            );
          }
        })();

        const res = await fetch(`${agent.start_url}/agent.json`);
        if (res.ok) {
          const agentJson = await res.json();
          if (
            agentJson.id &&
            agentJson.name &&
            agentJson.address &&
            agentJson.bio
          ) {
            const balancePromise = (async () => {
              const provider = providers[network];
              const balance = await provider.getBalance(agentJson.address);
              const ethBalance = ethers.formatEther(balance);
              return ethBalance;
            })();
            const [status, credits, balance] = await Promise.all([
              statusPromise,
              creditsPromise,
              balancePromise,
            ]);

            const serverUrl = agentHost;

            table.push([
              agentJson.id,
              agentJson.name,
              status?.enabled ?? false,
              agentJson.address,
              status?.room ?? '',
              balance,
              credits,
              // agentJson.bio,
              serverUrl,
              timeAgo(new Date(agent.created_at)),
            ]);
          // } else {
          //   console.warn('skipping agent', agentJson);
          }
        } else {
          console.warn('could not get agent json', agent.start_url);
        }
      });
      promises.push(p);
    }
    await Promise.all(promises);
    console.log(table.toString());
  };

  const jwt = await getLoginJwt();
  const userId = jwt && (await getUserIdForJwt(jwt));
  if (userId) {
    const supabase = makeSupabase(jwt);

    if (!dev) {
      // list agents in the account
      const assetsResult = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'npc');
      const { error, data } = assetsResult;
      if (!error) {
        // console.log('got remote data', data);
        await listAssets(supabase, data);
        process.exit(0);
      } else {
        throw new Error(`could not get assets for user ${userId}: ${error}`);
      }
    } else {
      // use the local development guid
      const guid = await ensureLocalGuid();
      const user_id = makeZeroGuid();
      const created_at = new Date().toISOString();
      const agent = {
        start_url: devAgentJsonUrl,
        created_at,
        user_id,
        name: defaultName,
        id: guid,
        preview_url: '',
        type: 'npc',
        description: defaultDescription,
        rarity: null,
        slots: null,
        hero_urls: null,
        address: null,
        enabled: false,
        character_name: null,
      };
      await listAssets(supabase, [agent]);
      process.exit(0);
    }
  } else {
    console.log('not logged in');
    process.exit(1);
  }
};
const rm = async (args) => {
  const guid = args._[0] ?? '';

  if (guid) {
    const jwt = await getLoginJwt();
    const userId = jwt && (await getUserIdForJwt(jwt));
    if (userId) {
      const u = `${deployEndpointUrl}/agent`;
      const req = await fetch(u, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/zip',
          // 'Content-Length': uint8Array.byteLength,
        },
        body: JSON.stringify({
          guid,
        }),
      });
      if (req.ok) {
        await req.json();
        console.log(`deleted agent ${guid}`);
      } else {
        const text = await req.text();
        console.warn(`could not delete agent ${guid}: ${text}`);
      }

      // const supabase = makeSupabase(jwt);
      // const assetsResult = await supabase
      //   .from('assets')
      //   .delete()
      //   .eq('id', guid)
      //   .eq('type', 'npc')
      //   .single();

      // const { error, data } = assetsResult;
      // if (!error) {
      //   console.log(`deleted agent ${guid}`);
      // } else {
      //   console.warn(`could not delete agent ${guid}: ${JSON.stringify(error)}`);
      // }
    } else {
      console.log('not logged in');
      process.exit(1);
    }
  } else {
    console.log('no guid provided');
    process.exit(1);
  }
};
const join = async (args) => {
  const guidOrDevPathIndex = // guid or dev path index
    args._[0] ??
    (dev
      ? {
          agentDirectory: cwd,
          portIndex: 0,
        }
      : '');
  const room = args._[1] ?? makeRoomName();
  const dev = !!args.dev;
  // const debug = !!args.debug;

  const _joinAgent = async () => {
    // cause the agent to join the room
    const agentHost = getAgentHost(
      !dev ? guidOrDevPathIndex : guidOrDevPathIndex.portIndex,
      {
        dev,
      },
    );
    // console.log('get agent host', {
    //   guidOrDevPathIndex,
    //   agentHost,
    // });
    const u = `${agentHost}/join`;
    // console.log('join 1', u);
    const headers = {};
    if (!dev) {
      const jwt = await getLoginJwt();
      headers.Authorization = `Bearer ${jwt}`;
    }
    const joinReq = await fetch(u, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        room,
      }),
    });
    if (joinReq.ok) {
      const joinJson = await joinReq.json();
      // console.log('join 2', joinJson);

      const ws = await connectAgentWs(guidOrDevPathIndex, {
        dev,
      });
      return ws;
    } else {
      const text = await joinReq.text();
      console.warn(
        'failed to join, status code: ' + joinReq.status + ': ' + text,
      );
      process.exit(1);
    }
  };

  // need guide and room
  if (guidOrDevPathIndex) {
    if (room) {
      return await _joinAgent();
    } else {
      console.log('no room name provided');
      process.exit(1);
    }
  } else {
    console.log('no guid provided');
    process.exit(1);
  }
};
const leave = async (args) => {
  const guid = args._[0] ?? '';
  const room = args._[1] ?? '';
  const dev = !!args.dev;

  if (guid) {
    if (room) {
      const jwt = await getLoginJwt();
      const userId = jwt && (await getUserIdForJwt(jwt));
      if (userId) {
        const agentHost = getAgentHost(guid, {
          dev,
        });
        const leaveReq = await fetch(`${agentHost}/leave`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            room,
          }),
        });
        const joinJson = await leaveReq.json();
        console.log(joinJson);
      } else {
        console.log('not logged in');
        process.exit(1);
      }
    } else {
      console.log('no room name provided');
      process.exit(1);
    }
  } else {
    console.log('no guid provided');
    process.exit(1);
  }
};
/* const enableDisable = (enabled) => async (args) => {
  const guid = args._[0] ?? '';
  const local = !!args.local;
  const _agentsHost = local ? localAgentsHost : agentsHost;

  if (guid) {
    const jwt = await getLoginJwt();
    // const userId = jwt && (await getUserIdForJwt(jwt));
    // if (userId) {
    if (jwt) {
      const statusReq = await fetch(`${_agentsHost}/agents/${guid}/status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          enabled,
        }),
      });
      const statusJson = await statusReq.json();

      console.log(`enabled agent ${guid}:`, statusJson);
    } else {
      console.log('not logged in');
      process.exit(1);
    }
  } else {
    console.log('no guid provided');
    process.exit(1);
  }
};
const enable = enableDisable(true);
const disable = enableDisable(false); */
const voice = async (args) => {
  const subcommand = args._[0] ?? '';
  const subcommandArgs = args._[1] ?? [];

  const jwt = await getLoginJwt();
  if (jwt !== null) {
    const userId = await getUserIdForJwt(jwt);

    const voiceTrainer = new VoiceTrainer();
    switch (subcommand) {
      case 'ls': {
        // XXX move to assets
        const supabase = makeSupabase(jwt);
        const result = await supabase.from('assets')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'voice');
        const { error, data } = result;
        if (!error) {
          // const voices =  await voiceTrainer.getVoices({
          //   jwt,
          // });
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.warn('error getting voices:', error);
          process.exit(1);
        }
        break;
      }
      case 'get': {
        // XXX move to assets
        const voiceName = subcommandArgs[0] ?? '';
        if (voiceName) {
          const supabase = makeSupabase(jwt);
          const result = await supabase.from('assets')
            .select('*')
            .eq('name', voiceName)
            .eq('user_id', userId)
            .eq('type', 'voice')
            .maybeSingle();
          const { error, data } = result;
          if (!error) {
            // const voice = await voiceTrainer.getVoice(voiceName, {
            //   jwt,
            // });
            console.log(JSON.stringify(data, null, 2));
            if (data) {
              const { start_url } = data;
              const res = await fetch(start_url);
              if (res.ok) {
                const voiceJson = await res.json();
                console.log(JSON.stringify(voiceJson, null, 2));
              } else {
                console.warn('could not get voice json:', res.status);
              }
            }
          } else {
            console.warn('error getting voice:', error);
            process.exit(1);
          }
        } else {
          console.warn('invalid arguments');
          process.exit(1);
        }
        break;
      }
      /* case 'sample': {
        // XXX move to assets
        const voiceName = subcommandArgs[0] ?? '';
        const voiceSample = subcommandArgs[1] ?? '';
        const filePath = subcommandArgs[2] ?? '';
        if (voiceName && voiceSample && filePath) {
          const supabase = makeSupabase(jwt);
          const result = await supabase.from('assets')
            .select('*')
            .eq('name', voiceName)
            .eq('user_id', userId)
            .eq('type', 'voice')
            .maybeSingle();
          const { error, data } = result;
          if (!error) {
            // XXX read the real data
            // const ab = await voiceTrainer.getVoiceSample(voiceName, voiceSample, {
            //   jwt,
            // });
            await fs.promises.writeFile(filePath, Buffer.from(ab));
          } else {
            console.warn('error getting voice sample:', error);
            process.exit(1);
          }
        } else {
          console.warn('invalid arguments');
          process.exit(1);
        }
        break;
      } */
      case 'add': {
        const voiceName = subcommandArgs[0] ?? '';
        const voiceFilePaths = subcommandArgs.slice(1);
        if (voiceName && voiceFilePaths.length > 0) {
          const voiceFiles = await Promise.all(voiceFilePaths.map(async (p, i) => {
            const data = await fs.promises.readFile(p);
            const blob = new Blob([data], { type: 'audio/mp3' });
            blob.name = `${voiceName}-${i}-${path.basename(p)}`;
            return blob;
          }));

          // XXX move this to the voices api
          const id = crypto.randomUUID();
          const [
            { voice_id },
            voiceUrls,
          ] = await Promise.all([
            voiceTrainer.addVoice(voiceName, voiceFiles, {
              jwt,
            }),
            Promise.all(voiceFiles.map(async (blob) => {
              const keyPath = ['assets', id, blob.name].join('/');
              const u = `${r2EndpointUrl}/${keyPath}`;
              try {
                const res = await fetch(u, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${jwt}`,
                  },
                  body: blob,
                });
                if (res.ok) {
                  const j = await res.json();
                  return j;
                } else {
                  const text = await res.text();
                  throw new Error(`could not upload voice file: ${blob.name}: ${text}`);
                }
              } catch (err) {
                throw new Error('failed to put voice: ' + u + ': ' + err.stack);
              }
            })),
          ]);
          const newVoiceEndpoint = `elevenlabs:${voiceName}:${voice_id}`;
          const voice = {
            name: voiceName,
            voiceEndpoint: newVoiceEndpoint,
            voiceUrls,
          };

          //

          const keyPath = ['assets', id, `${id}.voice`].join('/');
          const s = JSON.stringify(voice, null, 2);
          const u = `${r2EndpointUrl}/${keyPath}`;
          const res = await fetch(u, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${jwt}`,
            },
            body: s,
          });
          if (res.ok) {
            const start_url = await res.json();
            const asset = {
              id,
              user_id: userId,
              type: 'voice',
              name: voiceName,
              description: 'Created with agents sdk',
              start_url,
              preview_url: '/images/voice-inv.svg',
            };
            const supabase = makeSupabase(jwt);
            const { error } = await supabase.from('assets').upsert(asset);
            if (!error) {
               console.log(JSON.stringify(asset, null, 2));
            } else {
              console.warn('could not upsert asset:', error);
              process.exit(1);
            }
          } else {
            const text = await res.text();
            console.warn('could not upload voice: ' + u + ': ' + text);
            process.exit(1);
          }
        } else {
          console.warn('invalid arguments');
          process.exit(1);
        }
        break;
      }
      case 'remove': {
        // XXX move this to the voice api
        const supabase = makeSupabase(jwt);
        const result = await supabase.from('assets')
          .delete()
          .eq('name', voiceName)
          .eq('user_id', userId)
          .eq('type', 'voice');
        const { error } = result;
        if (!error) {
          const voiceName = subcommandArgs[0] ?? '';
          if (voiceName) {
            await voiceTrainer.removeVoice(voiceName, {
              jwt,
            });
          } else {
            console.warn('invalid arguments');
            process.exit(1);
          }
        } else {
          console.warn('error deleting voice: ' + error);
          process.exit(1);
        }
        break;
      }
      default: {
        console.warn(`unknown subcommand: ${subcommand}`);
        process.exit(1);
      }
    }
  }
};

const getTemplateNames = async () => await fs.promises.readdir(templatesDirectory);
const handleError = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    console.warn(err.stack);
    process.exit(1);
  }
};
const main = async () => {
  let commandExecuted = false;
  program
    .name('usdk')
    .description('Upstreet Agents SDK')
    .exitOverride((err) => {
      if (!commandExecuted) {
        process.exit(0);
      }
    });

  // misc
  program
    .command('version')
    .description('Print the version of the SDK')
    .action(async () => {
      await handleError(async () => {
        commandExecuted = true;
        console.log(pc.cyan(packageJson.version));
      });
    });
  /* program
    .command('-h')
    .description('Display help')
    .action(() => {
      program.help();
    }); */

  // account
  program
    .command('status')
    .description('Print the current login status of the SDK')
    // .argument('<string>', 'string to split')
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        };
        await status(args);
      });
    });
  program
    .command('login')
    .description('Log in to the SDK')
    .option(`-l, --local`, `Connect to localhost app server instead of hosted`)
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        };
        await login(args);
      });
    });
  program
    .command('authorize')
    .description('Authorize an agent of the SDK')
    .argument(`[directory]`, `The directory to create the project in`)
    .action(async (directory = '',opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [directory],
          ...opts,
        };
        await authorize(args);
      });
    });
  program
    .command('logout')
    .description('Log out of the SDK')
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        };
        await logout(args);
      });
    });
  /*program
    .command('wear')
    .description('Wear the character with the given guid')
    .argument('<guid>', 'The guid of the agent to wear')
    .action(async (guid = '', opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        let args;
        if (typeof guid === 'string') {
          args = {
            _: [guid],
            ...opts,
          };
        } else {
          opts = guid;
          guid = undefined;
          args = {
            _: [],
            ...opts,
          };
        }
        await wear(args);
      });
    });*/
  /*program
    .command('unwear')
    .description('Unwear the currently worn character')
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        // console.log('got args', JSON.stringify(args));
        // const args = {
        //   _: [guid],
        // };
        const args = {
          _: [],
          ...opts,
        };
        await unwear(args);
      });
    });*/

  // agents
  const templateNames = await getTemplateNames();
  program
    .command('create')
    .description('Create a new agent, from either a prompt or template')
    .argument(`[directory]`, `The directory to create the project in`)
    .argument(`[prompt]`, `Optional prompt to use to generate the agent`)
    .option(`-f, --force`, `Overwrite existing files`)
    .option(`-F, --force-no-confirm`, `Overwrite existing files without confirming\nUseful for headless environments. ${pc.red('WARNING: Data loss can occur. Use at your own risk.')}`)
    .option(
      `-t, --template <string>`,
      `The template to use for the new project; one of: ${JSON.stringify(templateNames)} (default: ${JSON.stringify(templateNames[0])})`,
    )
    .action(async (directory = undefined, prompt = undefined, opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        let args;
        if (typeof directory === 'string') {
          if (typeof prompt === 'string') {
            args = {
              _: [directory, prompt],
              ...opts,
            };
          } else {
            prompt = undefined;
            args = {
              _: [directory],
              ...opts,
            };
          }
        } else {
          // opts = directory;
          directory = undefined;
          prompt = undefined;
          args = {
            _: [],
            ...opts,
          };
        }
        await create(args);
      });
    });
  const devSubcommands = [
    'chat',
    // 'simulate',
    'listen',
    'ls',
    'fund',
    'deposit',
  ];
  program
    .command('dev')
    .description(
      'Start a dev server for the agent in the current directory, and optionally run a subcommand',
    )
    .argument(
      `[subcommand]`,
      `Optional subcommand to run after starting the dev server; one of [${JSON.stringify(devSubcommands)}]`,
    )
    .argument(`[guids...]`, `Guids of the agents to connect to`)
    .option(`-l, --local`, `Connect to local servers`)
    .option(`-r, --room <room>`, `Room to join`)
    .option(`-b, --browser`, `Open the chat room in a browser window`)
    // .option(`-v, --vision`, `Enable webcam vision`)
    .option(`-g, --debug`, `Enable debug logging`)
    .action(async (subcommand = '', guids = [], opts = {}) => {
      // console.log(
      //   'dev args',
      //   JSON.stringify([subcommand, guids, opts], null, 2),
      // );
      await handleError(async () => {
        commandExecuted = true;
        let args;
        if (guids.length === 0) {
          guids = [
            {
              agentDirectory: cwd,
              portIndex: 0,
            },
          ];
        } else {
          guids = guids.map((guid, i) => {
            return {
              agentDirectory: path.join(cwd, guid),
              portIndex: i,
            };
          });
        }
        args = {
          _: [subcommand, guids],
          ...opts,
        };
        await dev(args);
      });
    });
  program
    .command('search')
    .description(
      'Find an agent to do something',
    )
    .argument(
      `[query]`,
      `Prompt to search for`,
    )
    // .option(`-g, --debug`, `Enable debug logging`)
    .action(async (prompt = '', opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        let args;
        args = {
          _: [prompt],
          ...opts,
        };
        await search(args);
      });
    });
  program
    .command('test')
    .description('Run agent tests')
    .argument(`[directories...]`, `Directories containing the agent projects to test`)
    .option('-a, --all', 'Run all tests')
    .option('-g, --debug', 'Enable debug logging')
    .action(async (directories = [], opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [directories],
          ...opts,
        };
        await test(args);
      });
    });
  /* program
    .command('capture')
    .description('Test display functionality')
    .option('-m, --microphone [id]', 'Enable microphone')
    .option('-c, --camera [id]', 'Enable camera')
    .option('-s, --screen [id]', 'Enable screen capture')
    .option('-w, --width <width>', 'Render width')
    .option('-h, --height <height>', 'Render height')
    .option('-r, --rows <rows>', 'Render rows')
    .option('-l, --cols <cols>', 'Render cols')
    .option('-x, --execute', 'Execute inference')
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        };
        await capture(args);
      });
    }); */
  program
    .command('deploy')
    .description('Deploy an agent to the network')
    .argument(`[directory]`, `Directory containing the agent project to deploy`)
    // .argument(
    //   `[type]`,
    //   `Type of deployment to perform, one of ${JSON.stringify([deploymentTypes])}`,
    // )
    .action(async (directory, opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;

        let args;
        if (typeof directory === 'string') {
          args = {
            _: [directory],
            ...opts,
          };
        } else {
          args = {
            _: [],
            ...opts,
          };
        }

        await deploy(args);
      });
    });
  const networkOptions = ['baseSepolia', 'opMainnet'];
  /*program
    .command('ls')
    .description('List the currently deployed agents')
    .option(
      `-n, --network <networkId>`,
      `The blockchain network to use for querying agent wallets; one of ${JSON.stringify(networkOptions)}`,
    )
    .option(
      `-l, --local`,
      `Connect to localhost servers for development instead of remote (requires running local agent backend)`,
    )
    .option(
      `-d, --dev`,
      `List local development agents instead of account agents (requires running cli dev server)`,
    )
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        };
        await ls(args);
      });
    });*/
  program
    .command('rm')
    .description('Remove a deployed agent from the network')
    .argument(`<guid>`, `Guid of the agent to delete`)
    .action(async (guid = '', opts) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [guid],
          ...opts,
        };
        await rm(args);
      });
    });
  program
    .command('join')
    .description(`Make an agent join a multiplayer room`)
    .argument(`<guid>`, `Guid of the agent to`)
    .argument(`<room>`, `Name of the room to join`)
    .option(
      `-l, --local`,
      `Connect to localhost servers for development instead of remote (requires running local agent backend)`,
    )
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        };
        await rm(args);
      });
    });
  program
    .command('leave')
    .description(`Make an agent leave a multiplayer room`)
    .argument(`<guid>`, `Guid of the agent`)
    .option(
      `-l, --local`,
      `Connect to localhost servers for development instead of remote (requires running local agent backend)`,
    )
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        };
        await leave(args);
      });
    });
  /* program
    .command('enable')
    .description(`Enable an agent for autonomous operation`)
    .argument(`<guid>`, `Guid of the agent`)
    .option(
      `-l, --local`,
      `Connect to localhost servers for development instead of remote (requires running local agent backend)`,
    )
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        }
        await enable(args);
      });
    });
  program
    .command('disable')
    .description(`Disable an agent for autonomous operation`)
    .argument(`<guid>`, `Guid of the agent`)
    .option(
      `-l, --local`,
      `Connect to localhost servers for development instead of remote (requires running local agent backend)`,
    )
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        };
        await disable(args);
      });
    }); */
  const voiceSubCommands = [
    'ls',
    'get',
    // 'sample',
    'add',
    'remove',
  ];
  program
    .command('voice')
    .description(
      'Manage agent voices',
    )
    .argument(
      `[subcommand]`,
      `What voice action to perform; one of [${JSON.stringify(voiceSubCommands)}]`,
    )
    .argument(
      `[args...]`,
      `Arguments to pass to the subcommand`,
    )
    .action(async (subcommand = '', args = [], opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        args = {
          _: [subcommand, args],
          ...opts,
        };
        await voice(args);
      });
    });
  // program
  //   .command('connect')
  //   .description(`Connect to a multiplayer room`)
  //   .argument(`<room>`, `Name of the room to join`)
  //   .option(
  //     `-l, --local`,
  //     `Connect to localhost servers for development instead of remote (requires running local agent backend)`,
  //   )
  //   .option(
  //     `-d, --dev`,
  //     `Use the local development guid instead of your account guid`,
  //   )
  //   .option(`-v, --vision`, `Enable webcam vision`)
  //   .option(`-g, --debug`, `Enable debug logging`)
  //   .action(async (room = '', opts = {}) => {
  //     await handleError(async () => {
  //       commandExecuted = true;
  //       let args;
  //       if (typeof room === 'string') {
  //         args = {
  //           _: [room],
  //           ...opts,
  //         };
  //         await connect(args);
  //       } else {
  //         console.warn(`invalid arguments: ${room}`);
  //       }
  //     });
  //   });
  program
    .command('chat')
    .description(`Chat with agents in a multiplayer room`)
    .argument(`[guids...]`, `Guids of the agents to join the room`)
    .option(`-b, --browser`, `Open the chat room in a browser window`)
    .option(`-r, --room`, `The room name to join`)
    // .option(
    //   `-d, --dev`,
    //   `Chat with a local development agent`,
    // )
    // .option(`-v, --vision`, `Enable webcam vision`)
    .option(`-g, --debug`, `Enable debug logging`)
    .action(async (guids = [], opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        let args;
        args = {
          _: [guids],
          ...opts,
        };
        await chat(args);
      });
    });
  /* program
    .command('simulate')
    .description('Simulate an interaction between agents')
    .argument(`[guids...]`, `The guids of the agents to simulate`)
    .option(`-r, --room`, `The room name to join`)
    // .option(
    //   `-d, --dev`,
    //   `Chat with a local development agent`,
    // )
    // .option(`-v, --vision`, `Enable webcam vision`)
    .option(`-g, --debug`, `Enable debug logging`)
    .action(async (guids = [], opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        if (guids.every((guid) => typeof guid === 'string')) {
          let args;
          args = {
            _: guids,
            ...opts,
          };
          await simulate(args);
        } else {
          console.warn(`invalid arguments: ${guids}`);
          process.exit(1);
        }
      });
    }); */
  program
    .command('logs')
    .description(`Stream an agent's logs`)
    .argument(`[guids...]`, `The guids of the agents to listen to`)
    // .option(
    //   `-d, --dev`,
    //   `Chat with a local development agent`,
    // )
    .action(async (guids = [], opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        let args;
        args = {
          _: [guids],
          ...opts,
        };
        await logs(args);
      });
    });
  program
    .command('listen')
    .description(`Stream an agent's action events`)
    .argument(`[guids...]`, `The guids of the agents to listen to`)
    // .option(
    //   `-d, --dev`,
    //   `Chat with a local development agent`,
    // )
    .action(async (guids = [], opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        let args;
        args = {
          _: guids,
          ...opts,
        };
        await listen(args);
      });
    });

  // wallet
  /*program
    .command('fund')
    .description('Fund an agent on the network')
    .argument(`<guid>`, `Guid of the agent to deposit to`)
    .argument(`<amount>`, `Amount of funds to deposit`)
    .option(
      `-l, --local`,
      `Connect to localhost servers for development instead of remote (requires running local agent backend)`,
    )
    .option(
      `-d, --dev`,
      `Use the local development guid instead of your account guid`,
    )
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        };
        await fund(args);
      });
    });*/
  /*program
    .command('deposit')
    .description('Deposit funds to an agent on the network')
    .argument(`<guid>`, `Guid of the agent to deposit to`)
    .argument(`<amount>`, `Amount of funds to deposit`)
    .option(
      `-l, --local`,
      `Connect to localhost servers for development instead of remote (requires running local agent backend)`,
    )
    .option(
      `-d, --dev`,
      `Use the local development guid instead of your account guid`,
    )
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        };
        await deposit(args);
      });
    });*/
  /*program
    .command('withdraw')
    .description('Withdraw funds from an agent on the network')
    .argument(`<guid>`, `Guid of the agent to withdraw from`)
    .argument(`<amount>`, `Amount of funds to withdraw`)
    .argument(`<destination>`, `Destination address to withdraw to`)
    .option(
      `-n, --network <networkId>`,
      `The blockchain network to use for querying agent wallets; one of ${JSON.stringify(networkOptions)}`,
    )
    .action(async (opts = {}) => {
      await handleError(async () => {
        commandExecuted = true;
        const args = {
          _: [],
          ...opts,
        };
        await withdraw(args);
      });
    });*/
  await program.parseAsync();
};
// handle uncaught exceptions
const handleGlobalError = (err, err2) => {
  console.log('cli uncaught exception', err, err2);
  process.exit(1);
};
process.on('uncaughtException', handleGlobalError);
process.on('unhandledRejection', handleGlobalError);
// run main
(async () => {
  try {
    await main();
  } catch (err) {
    console.warn(err.stack);
  }
})();
