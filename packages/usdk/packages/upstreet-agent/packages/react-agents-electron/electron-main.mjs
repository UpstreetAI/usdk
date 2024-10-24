import { BrowserWindow, desktopCapturer, screen, session } from 'electron';
import { Button, Key, keyboard, mouse, Point } from '@nut-tree-fork/nut-js';
import { ReactAgentsLocalRuntime } from '../react-agents-local/local-runtime.mjs';

console.log('electron start script!');

// const host = 'https://chat.upstreet.ai';
const host = 'http://localhost:3000';

const createOTP = async (jwt) => {
  const res = await fetch(
    `https://ai.upstreet.ai/api/register-otp?token=${jwt}`,
    {
      method: 'POST',
    },
  );

  if (res.ok) {
    return res.text();
  } else {
    throw new Error('Failed to create a one-time password.');
  }
};

const _main = async () => {
  // console.log('got args', process.argv);
  const agentSpec = JSON.parse(process.argv[2]);
  const room = process.argv[3];
  const jwt = process.argv[4];
  const debug = process.argv[5] === '1';

  // console.log('got args', {
  //   agentSpec,
  //   room,
  //   jwt,
  //   debug,
  // });

  if (agentSpec.directory) {
    // start the agent
    const runtime = new ReactAgentsLocalRuntime(agentSpec);
    await runtime.start({
      debug,
    });

    console.log('electron main ready');

    // create the window
    {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.workAreaSize;

      // trade the jwt for an otp auth token
      const authToken = await createOTP(jwt);
      const u = new URL(`${host}/login`);
      u.searchParams.set('auth_token', authToken);
      u.searchParams.set('referrer_url', `${host}/rooms/${room}`);

      // main window
      const win = new BrowserWindow({
        width,
        height,
        x: 0,
        y: 0,
        frame: false,
        webPreferences: {
          session: session.fromPartition('login'),
        },
      });
      if (debug) {
        win.webContents.openDevTools();
      }
      win.loadURL(u.href);
    }

    // this will start signal that the electron process has successfully started
    // console.log('electron main ready');
  } else {
    throw new Error('no directory in agent spec');
  }
};
_main()
  .catch((err) => {
    console.error('error in electron start script', err);
    process.exit(1);
  });