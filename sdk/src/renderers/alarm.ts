// import { UserHandler, AgentConsole } from '../types';
import { compileUserAgentAlarm } from '../runtime';
// import { ConversationContext } from '../classes/conversation-context.mjs';
// import { getConnectedWalletsFromMnemonic } from '../util/ethereum-utils.mjs';
import { AgentRenderer } from '../runtime.ts';

const renderUserAlarm = async (agentRenderer: AgentRenderer) => {
  const alarmSpec = await compileUserAgentAlarm({
    agentRenderer,
  });
  // console.log('returned alarm spec', alarmSpec);
  return alarmSpec;
};
export default renderUserAlarm;
