import React from 'react';
import {
  Agent,
  AgentAppProps,
  DefaultAgentComponents,
  DefaultActions,
  DefaultPrompts,
  DefaultParsers,
  DefaultPerceptions,
  DefaultSchedulers,
  DefaultServers,

  useAgents,
  useCurrentAgent,

  Action,
  PendingActionEvent,
} from 'react-agents';

//

const SendEthAction = () => {
  const agents = useAgents();
  const currentAgent = useCurrentAgent();
  return (
    <Action
      name="sendEth"
      description={`Send an amount of ETH to the specified user id.`}
      args={{
        userId: currentAgent.id,
        amount: '0.001',
      }}
      handler={async (e: PendingActionEvent) => {
        const {
          agent,
          message: { args },
        } = e.data;
        const { userId, amount } = args as any;
        await agent.wallets.baseSepolia.sendTransaction({
          to: agents.find((agent) => agent.id === userId).address,
          value: '0x' + BigInt(amount * 1e18).toString(16),
        });
        await currentAgent.addAction(e.data.message);
      }}
    />
  );
};

export default function MyAgent(props) {
  return (
    <Agent>
      <SendEthAction />
    </Agent>
  );
}
