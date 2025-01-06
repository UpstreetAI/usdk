import React from 'react';
import dotenv from 'dotenv';
import { createRoot } from 'react-agents/root.ts';
import * as codecs from 'codecs/ws-codec-runtime-fs.mjs';
import App from './agent.tsx';
import agentJson from './agent.json';
import envTxt from './.env.txt?raw';

// const dirname = path.dirname(import.meta.url.replace('file://', ''));

//

['uncaughtException', 'unhandledRejection'].forEach(event => {
  process.on(event, err => {
    console.error(err);
  });
});

//

const createRootMain = ({
  init = {},
  debug = 0,
} = {}) => {
  const env = dotenv.parse(envTxt);
  const rootOpts = {
    agentJson,
    env,
    codecs,
    envirionment: 'development',
    init,
    debug,
  };
  const root = createRoot(rootOpts);
  root.render(<App />);
  return root;
};
export default createRootMain;