import { parseAgentSpecs } from './agent-spec-utils.mjs';
import { ReactAgentsLocalRuntime } from '../packages/upstreet-agent/packages/react-agents-local/local-runtime.mjs';
// import { getLoginJwt } from '../util/login-util.mjs';
import {
  makeRoomName,
  connect,
  join,
  leave,
} from '../util/connect-utils.mjs';

//

export const chat = async (args, opts) => {
  // console.log('got chat args', args);
  const agentSpecs = await parseAgentSpecs(args._[0]);
  const room = args.room ?? makeRoomName();
  const browser = args.browser;
  const inputStream = args.inputStream;
  const outputStream = args.outputStream;
  const debug = !!args.debug;
  // opts
  const jwt = opts.jwt;
  if (!jwt) {
    throw new Error('You must be logged in to chat.');
  }

  // start dev servers for the agents
  const startPromises = agentSpecs.map(async (agentSpec) => {
    if (agentSpec.directory) {
      const runtime = new ReactAgentsLocalRuntime(agentSpec);
      await runtime.start({
        debug,
      });
    }
  });
  await Promise.all(startPromises);

  // wait for agents to join the multiplayer room
  const agentRefs = agentSpecs.map((agentSpec) => agentSpec.ref);
  await join({
    _: [agentRefs, room],
  });

  // connect to the chat
  const mode = (() => {
    if (browser) {
      return 'browser';
    } else if (inputStream && outputStream) {
      return 'stream';
    } else {
      return 'repl';
    }
  })();
  await connect({
    _: [room],
    mode,
    inputStream,
    outputStream,
    debug,
  });
};