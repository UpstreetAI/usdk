import { parseAgentSpecs } from './agent-spec-utils.mjs';
import { installAgent } from '../packages/upstreet-agent/packages/react-agents-node/install-agent.mjs';

//

export const build = async (args, opts) => {
  // const jwt = opts.jwt;
  // if (!jwt) {
  //   console.error('You must be logged in to create an agent.');
  //   return;
  // }

  const agentSpecs = await parseAgentSpecs(args._[0]);
  if (!agentSpecs.every((agentSpec) => !!agentSpec.directory)) {
    throw new Error('agent argument is not a local directory');
  }

  const results = [];
  for (const agentSpec of agentSpecs) {
    const {
      directory,
      portIndex,
    } = agentSpec;

    const result = await installAgent(directory);
    results.push(result);
  }
  return results;
};