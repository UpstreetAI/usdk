import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { AgentMain } from '../react-agents/entry.ts';
import * as codecs from '../codecs/ws-codec-runtime-fs.mjs';
import userRender from './agent.tsx';
// import { getCurrentDirname } from '../react-agents/util/path-util.mjs';

//

['uncaughtException', 'unhandledRejection'].forEach(event => {
  process.on(event, err => {
    console.error(err);
  });
});

//

const main = ({
  directory,
  init = {},
  debug = 0,
} = {}) => {
  const getConfig = () => {
    const agentJsonTxt = fs.readFileSync(agentJsonPath, 'utf8');
    const agentJson = JSON.parse(agentJsonTxt);
    return agentJson;
  };
  const getAuth = () => {
    const envTxtString = fs.readFileSync(envTxtPath, 'utf8');
    const envTxt = dotenv.parse(envTxtString);
    return envTxt;
  };
  const agentJsonPath = path.join(directory, 'agent.json');
  // // this file should be running from the agent's directory, so we can find the wrangler.toml file relative to it
  const envTxtPath = path.join(directory, '.env.txt');

  const config = getConfig();
  let alarmTimestamp = null;
  const state = {
    config,
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
  const env = {
    WORKER_ENV: 'development',
    init,
    debug,
  };
  const auth = getAuth();
  const agentMain = new AgentMain(state, env, auth);
  return agentMain;
};
export default main;