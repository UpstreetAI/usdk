import React, { useState, useEffect } from 'react';
import { useRuntime } from 'react-agents';
// import { z } from 'zod';
import util from 'util';
import type {
  IAgentRuntime,
  State,
  Options,
  Memory,
  IActionHandlerAttachment,
  IActionHandlerCallbackArgs,
  HandlerFn,
  ValidateFn,
  IAction,
  IEvaluator,
  IProvider,
  IPlugin,
  Database,
  IAdapter,
  IRuntime,
  Client as ElizaClient,
} from '../types/eliza.d.ts';
import { DiscordClientInterface } from '@elizaos/client-discord';
import { GitHubClientInterface } from '@elizaos/client-github';
import { TwitterClientInterface } from '@elizaos/client-twitter';

//

const Client = (props: {
  client: ElizaClient;
  opts: any;
}) => {
  const {
    client,
    opts,
  } = props;
  const runtime = useRuntime();

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    let live = true;
    signal.addEventListener('abort', () => {
      live = false;
    });

    (async () => {
      const instance = await client.start(runtime);
      if (live) {
        signal.addEventListener('abort', async () => {
          await instance.stop(runtime);
        });
      } else {
        await instance.stop(runtime);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <>
    </>
  );
};
const clientWrap = (client: ElizaClient) => (opts: any) => {
  console.log('render client', util.inspect(client, {
    depth: 7,
  }));
  return (
    <Client client={client} opts={opts} />
  );
};

export const clients = {
  '@elizaos/plugin-discord': clientWrap(DiscordClientInterface),
  '@elizaos/plugin-github': clientWrap(GitHubClientInterface),
  '@elizaos/plugin-twitter': clientWrap(TwitterClientInterface),
};