import { ReactAgentsLocalRuntime } from '../react-agents-local/local-runtime.mjs';

console.log('electron start script!');

const _main = async () => {
  // console.log('got args', process.argv);
  const agentSpec = JSON.parse(process.argv[2]);
  console.log('got agent spec', agentSpec);
  const debug = process.argv[3] === '1';

  if (agentSpec.directory) {
    const runtime = new ReactAgentsLocalRuntime(agentSpec);
    await runtime.start({
      debug,
    });
    // this will start signal that the electron process has successfully started
    console.log('electron main ready');
  } else {
    throw new Error('no directory in agent spec');
  }
};
_main()
  .catch((err) => {
    console.error('error in electron start script', err);
    process.exit(1);
  });