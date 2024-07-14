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

  Personality,
  Perception,

  useAgents,
  useCurrentAgent,

  Action,
  PendingActionEvent,
} from 'react-agents';

//

const PaymentRequestAction = () => {
  return (
    <Action
      name="paymentRequest"
      description={`Request a payment of a specific amount. Amount is in cents.`}
      args={{
        handlerType: 'paymentRequest',
        amount: '2000',
        currency: 'USD',
        description: 'A description of what is being sold.'
      }}
      // handler={async (e: PendingActionEvent) => {
      //   // const {
      //   //   agent,
      //   // } = e.data;
      // }}
    />
  );
};
const PaymentResponsePerception = () => {
  return (
    <Perception
      type="paymentResponse"
      handler={async (e) => {
        const { agent } = e.data;
        await agent.think('Get notified of the payment success.');
      }}
    />
  );
};

export default function MyAgent(props) {
  return (
    <Agent>
      <Personality>A merchant selling various magical isekai anime items.</Personality>
      <PaymentRequestAction />
      <PaymentResponsePerception />
    </Agent>
  );
}
