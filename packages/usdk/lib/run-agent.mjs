import { ReactAgentsNodeRuntime } from '../packages/upstreet-agent/packages/react-agents-node/node-runtime.mjs';
import { ReactAgentsWranglerRuntime } from '../packages/upstreet-agent/packages/react-agents-wrangler/wrangler-runtime.mjs';
import { parseAgentSpecs } from './agent-spec-utils.mjs';

export const runAgent = async (args, opts) => {
  console.log('runAgent', args, opts);
  const agentSpecs = await parseAgentSpecs(args._[0]);
  const runtime = args.runtime ?? 'node';
  const debug = !!args.debug;
  // opts
  const jwt = opts.jwt;
  if (!jwt) {
    throw new Error('You must be logged in to chat.');
  }

  // start dev servers for the agents
  const Runtime = (() => {
    if (runtime === 'node') {
      return ReactAgentsNodeRuntime;
    } else if (runtime === 'wrangler') {
      return ReactAgentsWranglerRuntime;
    } else {
      throw new Error('unknown runtime: ' + runtime);
    }
  })();
  const startPromises = agentSpecs.map(async (agentSpec) => {
    if (agentSpec.directory) {
      const runtime = new Runtime(agentSpec);
      await runtime.start({
        debug,
      });
    }
  });
  await Promise.all(startPromises);

  console.log('started agents');
  return;
};
