import React from 'react';
import { z } from 'zod';
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
  useStripe,

  Action,
  PendingActionEvent,
/* IMPORTS REGEX HOOK */
} from 'react-agents';

//

const PaymentRequestAction = () => {
  const stripe = useStripe();
  return (
    <Action
      name="paymentRequest"
      description={`Request payment for a product or service.`}
      schema={
        z.object({
          amount: z.number(),
          currency: z.enum(['usd']),
          productName: z.string(),
          productDescription: z.string(),
          productQuantity: z.number(),
        })
      }
      examples={[
        {
          // handlerType: 'paymentRequest',
          amount: 2000,
          currency: 'usd',
          productName: 'Name of the product being sold.',
          productDescription: 'Description of the product being sold.',
          productQuantity: 1,
        },
      ]}
      handler={async (e: PendingActionEvent) => {
        const {
          agent,
          message,
        } = e.data;
        const {
          // userId,
          // name,
          method,
          args,
        } = message;
        const {
          amount,
          currency,
          productName,
          productDescription,
          productQuantity,
        } = args;

        const session = await stripe.checkout.sessions.create({
          success_url: agent.location.href,
          line_items: [
            {
              price_data: {
                currency,
                unit_amount: amount,
                product_data: {
                  name: productName,
                  description: productDescription,
                },
              },
              quantity: productQuantity,
            },
          ],
          mode: 'payment',
          metadata: {
            agent_id: agent.agent.id,
          },
        });

        const newMessage = {
          method,
          args: {
            type: 'stripe',
            id: session.id,
            url: session.url,
            amount,
            currency,
            productName,
            productDescription,
            productQuantity,
          },
        };
        await agent.addMessage(newMessage);
      }}
    />
  );
};
const PaymentResponsePerception = () => {
  return (
    <Perception
      type="paymentResponse"
      handler={async (e) => {
        const { agent } = e.data;
        // await agent.think('Get notified of the payment success.');
        await agent.monologue('Acknowledge the payment.');
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
{/* JSX REGEX HOOK */}
    </Agent>
  );
}
