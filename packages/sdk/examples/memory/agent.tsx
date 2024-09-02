import React from 'react';
// import dedent from 'dedent';
// import ethers from 'upstreet-sdk/ethers';
// const { Contract } = ethers;
import {
  PendingActionEvent,
  Agent,
  Action,
} from 'react-agents';
import {z} from 'zod';

//

const AddMemoryAction = () => {
  return (
    <Action
      name="add_memory"
      description={`Add the given memory string to the embedded database. Always use this whenever the user requests it.`}
      // args={{
      //   text: 'Some string to remember, which could be a sentence or a few. It should be concise, but still include all of the relevant details.',
      // }}
      examples={[
        {
          query: 'Query string to search for a memory.',
        },
      ]}
      schema={
        z.object({
          addMemId: z.string(),
          text: z.string(),
        })
      }
      handler={async (e: PendingActionEvent) => {
        const { agent, message } = e.data;
        const args = message.args as any;

        if (typeof args === 'object' && typeof args?.text === 'string') {
          // console.log('remember handler 1', new Error().stack);
          console.log('remember handler 1');
          await agent.agent.addMemory(args.text, message);
          console.log('remember handler 2');
          // await agent.agent.addAction(message, {
          //   conversation,
          // });
          console.log('remember handler 3');
          await agent.monologue(`${agent.agent.name} just stored the knowledge asked to store: ${JSON.stringify(args.text)}, use this to generate the next action which is most appropriate according to the current chat history`);
          console.log('remember handler 4');
        } else {
          throw new Error('Invalid args');
        }
      }}
    />
  );
};
const GetMemoryAction = () => {
  return (
    <Action
      name="get_memory"
      description={`Get a memory that was previously stored in the embedded database, based on the text string. Always use this whenever the user requests it.`}
      // args={{
      //   query: 'Query string to search for a memory.',
      // }}
      examples={[
        {
          text: 'Text string to search for a memory.',
        },
      ]}
      schema={
        z.object({
          getMemId: z.string(),
          text: z.string(),
        })
      }
      handler={async (e: PendingActionEvent) => {
        const { agent, message } = e.data;
        const args = message.args as any;

        if (typeof args === 'object' && typeof args?.text === 'string') {
          const memories = await agent.agent.getMemory(args.text, {
            matchThreshold: 0.2,
            matchCount: 10,
          });
          if (memories.length > 0) {
            const memory = memories[0];
            const newMessage = {
              ...message,
              args: {
                ...message.args,
                value: memory,
              },
            };
            e.commit();
            // await agent.addAction(newMessage, {
            //   conversation,
            // });
            console.log('got memory', memory);
            await agent.monologue(
              `${agent.agent.name} just remembered: ${JSON.stringify(args.text)} -> ${JSON.stringify(memory.text)} use this to generate the next action which is most appropriate according to the current chat history`,
            );
          } else {
            await agent.monologue(
              `Could not remember: ${JSON.stringify(args.text)}`,
            );
          }
        } else {
          throw new Error('Invalid args');
        }
      }}
    />
  );
};
const MemoryActions = () => {
  return (
    <>
      <AddMemoryAction />
      <GetMemoryAction />
    </>
  );
};

export default function MyAgent() {
  return (
    <Agent>
      <MemoryActions />
    </Agent>
  );
}
