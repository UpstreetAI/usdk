import fs from 'fs';
import toml from '@iarna/toml';
import { AgentMain } from './packages/upstreet-agent/packages/react-agents/entry.ts';
import * as codecs from './packages/upstreet-agent/packages/codecs/ws-codec-runtime-fs.mjs';
import userRender from './agent.tsx';
import { getCurrentDirname } from '../react-agents/util/path-util.mjs';
import path from 'path';

//

['uncaughtException', 'unhandledRejection'].forEach(event => {
  process.on(event, err => {
    console.error(err);
  });
});

//

// this file should be running from the agent's directory, so we can find the wrangler.toml file relative to it
const wranglerTomlPath = path.join(getCurrentDirname(import.meta), '../../../../wrangler.toml');

//

const getEnv = async () => {
  // load the wrangler.toml
  const wranglerTomlString = await fs.promises.readFile(wranglerTomlPath, 'utf8');
  const wranglerToml = toml.parse(wranglerTomlString);

  const agentJsonString = wranglerToml.vars.AGENT_JSON;
  if (!agentJsonString) {
    throw new Error('missing AGENT_JSON in wrangler.toml');
  }
  const agentJson = JSON.parse(agentJsonString);

  const apiKey = wranglerToml.vars.AGENT_TOKEN;
  if (!apiKey) {
    throw new Error('missing AGENT_TOKEN in wrangler.toml');
  }

  const mnemonic = wranglerToml.vars.WALLET_MNEMONIC;
  if (!mnemonic) {
    throw new Error('missing WALLET_MNEMONIC in wrangler.toml');
  }

  const {
    SUPABASE_URL,
    SUPABASE_PUBLIC_API_KEY,
  } = wranglerToml.vars;
  if (!SUPABASE_URL || !SUPABASE_PUBLIC_API_KEY) {
    throw new Error('missing SUPABASE_URL or SUPABASE_PUBLIC_API_KEY in wrangler.toml');
  }

  // send init message
  const env = {
    AGENT_JSON: JSON.stringify(agentJson),
    AGENT_TOKEN: apiKey,
    WALLET_MNEMONIC: mnemonic,
    SUPABASE_URL,
    SUPABASE_PUBLIC_API_KEY,
    WORKER_ENV: 'development', // 'production',
  };
  return env;
};

//

const main = async () => {
  const env = await getEnv();

  let alarmTimestamp = null;
  const state = {
    userRender,
    codecs,
    storage: {
      async getAlarm() {
        return alarmTimestamp;
      },
      setAlarm(timestamp) {
        alarmTimestamp = timestamp;
      },
    },
  };
  const agentMain = new AgentMain(state, env);
  return agentMain;
};
export default main;