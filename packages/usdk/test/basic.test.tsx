import path from 'path';
import fs from 'fs';
import child_process from 'child_process';

import { mkdirp } from 'mkdirp';
import { rimraf } from 'rimraf';

import React from 'react';
import { createRoot, Agent } from 'react-agents';
import * as codecs from 'codecs/ws-codec-runtime-fs.mjs';

const registryHash = `f3689d8c6118c97390779a3322ebca8c61a34a2d`;
const npmBin = 'pnpm';

const npmInstallDirectory = async (cwd: string) => {
  const cp = child_process.spawn(npmBin, ['install'], {
    stdio: 'inherit',
    cwd,
  });
  await new Promise((resolve, reject) => {
    cp.on('close', (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        reject(new Error(`npm install failed with code ${code}`));
      }
    });
    cp.on('error', (err) => {
      console.warn('npm install error', err.stack);
      reject(err);
    });
  });
};

test('createRoot', async () => {
  // create the agents directory
  const agentsDir = path.join('/tmp', '.agents');
  await mkdirp(agentsDir);

  const indexJson = await (async () => {
    const res = await fetch(`https://rawcdn.githack.com/elizaos-plugins/registry/${registryHash}/index.json`);
    const j = res.json();
    return j;
  })();

  const skip = 0;
  const limit = 1;
  for (const [name, ref] of Object.entries(indexJson).slice(skip, skip + limit)) {
    // create the agent directory
    const agentBaseName = name
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '');
    // console.log('base name', {name, agentBaseName});
    const agentDir = path.join(agentsDir, agentBaseName);
    await mkdirp(agentDir);
    // change to the agent directory
    process.chdir(agentDir);

    // create the package.json
    const packageJson = {
      name,
      dependencies: {
        [name]: ref,
      },
    };
    // write the package.json
    await fs.promises.writeFile(
      path.join(agentDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // perform npm install
    await npmInstallDirectory(agentDir);

    const agentJson = {
      id: "b94ed43d-4305-4b38-a3b6-4d5b3b6a8fc3",
      ownerId: "4cf9f0df-6ec4-4c44-8251-c1cbb61f7a6b",
      address: "0x5f7b45a76a71b68d114d7868be9b5ad8870ba678",
      stripeConnectAccountId: "",
      name: "AI Agent 77139",
      description: "Created by the AI Agent SDK",
      bio: "A cool AI",
      model: "openai:gpt-4o-2024-08-06",
      smallModel: "openai:gpt-4o-mini",
      largeModel: "openai:o1-preview",
      startUrl: "https://user-agent-b94ed43d-4305-4b38-a3b6-4d5b3b6a8fc3.isekaichat.workers.dev",
      previewUrl: "",
      homespaceUrl: "",
      avatarUrl: "",
      voiceEndpoint: "elevenlabs:scillia:kNBPK9DILaezWWUSHpF9",
      voicePack: "ShiShi voice pack",
      capabilities: [],
      version: "0.0.108",
      plugins: [
        {
          name,
          parameters: {},
        },
      ],
    };
    const state = {
      agentJson,
      env: {},
      enivronment: 'development',
      codecs,
    };

    // render the agent
    const root = createRoot(state);
    // const { agents } = await root.render(<Agent />);
    const { agents } = await root.render(<Agent />);
    console.log('agents', agents);

    // unmount the agent
    await root.unmount();
  }

  // remove the agents directory
  await rimraf(agentsDir);
});