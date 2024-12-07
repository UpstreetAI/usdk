import React, { useState, useEffect } from 'react';
import dedent from 'dedent';
import {
  Memory,
} from '../../types';
import { Prompt } from '../core/prompt';
import { useCachedMessages, useAgent, useConversation } from '../../hooks';
import { EveryNMessages } from '../util/message-utils';
import { QueueManager } from '../../../queue-manager';

const maxDefaultMemoryValues = 8;
const maxMemoryQueries = 8;
const maxMemoryQueryValues = 3;
const writeEveryN = 1;

export const RAGMemory = () => {
  const agent = useAgent();
  const conversation = useConversation();
  // const messages = useCachedMessages();
  const [generativeAgent, setGenerativeAgent] = useState(() => agent.generative({
    conversation,
  }));
  const [memories, setMemories] = useState<Memory[]>([]);
  const [queueManager, setQueueManager] = useState(() => new QueueManager());

  return (
    <>
      {memories.length > 0 && (
        <Prompt>
          {dedent`\
            # Memories
            You remember the following:
            \`\`\`
          ` + '\n' +
          JSON.stringify(memories, null, 2)
          }
        </Prompt>
      )}
      {/* read memories */}
      <EveryNMessages n={1}>{async (e) => {
        const embeddingString = conversation.getEmbeddingString();
        // const embedding = await agent.appContextValue.embed(embeddingString);

        const memories = await agent.getMemory(embeddingString, {
          matchCount: maxDefaultMemoryValues,
          // signal,
        });
        // console.log('load memories', memories);
        setMemories(memories);
      }}</EveryNMessages>
      {/* write memories */}
      <EveryNMessages n={writeEveryN} firstCallback={false}>{(e) => {
        (async () => {
          await queueManager.waitForTurn(async () => {
            const cachedMessages = conversation.messageCache.getMessages();
            const memories = cachedMessages.map(m => {
              const {
                name,
                method,
                args,
              } = m;
              return {
                name,
                method,
                args,
              };
            });

            const lastMessages = memories.slice(-(maxDefaultMemoryValues + writeEveryN));
            const oldContextMessages = lastMessages.slice(0, -writeEveryN);
            const newContextMessages = lastMessages.slice(-writeEveryN);

            const summary = await generativeAgent.complete([
              {
                role: 'user',
                content: dedent`\
                  # Old message history
                  Here is the old message history, for context:
                  \`\`\`
                ` + '\n' +
                JSON.stringify(oldContextMessages, null, 2) + '\n' +
                dedent`\
                  \`\`\`

                  # New messages
                  And here are the new messages we are addding:
                  \`\`\`
                ` + '\n' +
                JSON.stringify(newContextMessages, null, 2) + '\n' +
                dedent`\
                  \`\`\`

                  Summarize the new messages in a sentence or few. Include in your summary the interesting information that occurs in the new messages list above.
                `,
              },
            ]);

            console.log('memorize', {
              oldContextMessages,
              newContextMessages,
              summary,
            });
            const text = summary.content as string;
            await agent.addMemory(text);
          });
        })();
      }}</EveryNMessages>
    </>
  );
};