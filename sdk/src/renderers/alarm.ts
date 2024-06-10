// import { UserHandler, AgentConsole } from '../types';
import { compileUserAgentAlarm } from '../runtime';
// import { ConversationContext } from '../classes/conversation-context.mjs';
// import { getConnectedWalletsFromMnemonic } from '../util/ethereum-utils.mjs';
import { AgentRenderer } from '../runtime.ts';

/* const prepareUserArgs = async ({
  conversationContext,
  env,
  userRender,
  enabled,
}) => {
  // const currentAgentId = (args as any).currentAgentId as string;
  // const agentIds = (args as any).agentIds as string;
  // const messages = (args as any).messages as ActionMessages;

  // const scene = conversationContext.getScene();
  // const currentAgent = conversationContext.getCurrentAgent();
  // const agents = conversationContext.getAgents().concat([currentAgent]);
  // const messages = conversationContext.getMessages();

  console.log('prepare user args', {
    env,
    // currentAgent,
    // agents,
    // messages,
  });
  // const host = 'http://localhost';
  // const proxyRes2 = await getStaticAsset(
  //   new Request(`${host}/agent.npc`),
  //   env,
  // );

  const mnemonic = env.WALLET_MNEMONIC;
  const wallets = getConnectedWalletsFromMnemonic(mnemonic);

  return {
    env,
    conversationContext,
    userRender,
    // scene,
    // agents,
    // currentAgent,
    // messages,
    wallets,
    enabled,
  };
}; */

const renderUserAlarm = async (agentRenderer: AgentRenderer) => {
  // const userArgs = await prepareUserArgs({
  //   conversationContext,
  //   env,
  //   userRender,
  //   enabled,
  // });
  const alarmSpec = await compileUserAgentAlarm({
    agentRenderer,
  });
  // console.log('returned alarm spec', alarmSpec);
  return alarmSpec;
};
export default renderUserAlarm;
