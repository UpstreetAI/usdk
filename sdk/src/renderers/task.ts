// import { UserHandler, AgentConsole } from '../types';
import { compileUserAgentTasks } from '../runtime';
// import { ConversationContext } from '../classes/conversation-context.mjs';
// import { getConnectedWalletsFromMnemonic } from '../util/ethereum-utils.mjs';
import { AgentRenderer } from '../runtime.ts';

const renderUserTasks = async (agentRenderer: AgentRenderer) => {
  const taskUpdater = await compileUserAgentTasks({
    agentRenderer,
  });
  return taskUpdater;
};
export default renderUserTasks;
