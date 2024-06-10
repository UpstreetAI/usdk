import { AgentConsole } from './agent-console.mjs';

const originalConsole = globalThis.console;
export const console = new AgentConsole({
  console: originalConsole,
});
// XXX need to localize the console per durable object
export const bindGlobalConsole = (_console) => {
  console.set(_console);
};
