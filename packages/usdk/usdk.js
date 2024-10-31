#!/usr/bin/env -S node --no-warnings --experimental-wasm-modules
import { main } from './cli.js';

// Set up global error handling
['uncaughtException', 'unhandledRejection'].forEach(event =>
  process.on(event, (err, err2) => {
    console.log('cli uncaught exception', err, err2);
    process.exit(1);
  })
);

// Execute CLI
(async () => {
  try {
    await main();
  } catch (err) {
    console.warn(err.stack);
    process.exit(1);
  }
})();