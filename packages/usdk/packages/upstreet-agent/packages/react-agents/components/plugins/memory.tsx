import React, { useState, useEffect } from 'react';
import dedent from 'dedent';
import {
  Memory,
} from '../../types';
// import { lembed } from '../../util/embedding.mjs';
import { Prompt } from '../core/prompt';
import { useCachedMessages, useAgent, useConversation } from '../../hooks';
// import {
//   ActiveAgentObject,
// } from '../../types';
// import { Prompt } from '../core/prompt';
// import { DeferConversation } from '../core/conversation';
import { EveryNMessages } from '../util/message-utils';
import { QueueManager } from '../../../queue-manager';

const maxDefaultMemoryValues = 8;
const maxMemoryQueries = 8;
const maxMemoryQueryValues = 3;
const writeEveryN = 1;

/* const DefaultMemoriesInternal = () => {
  const agent = useAgent();
  const conversation = useConversation();
  const [recentMemoriesValue, setRecentMemoriesValue] = useState<string[]>([]);
  const [queriedMemoriesValue, setQueriedMemoriesValue] = useState<string[]>([]);

  const refreshRecentMemories = async ({
    signal,
  }: {
    signal: AbortSignal,
  }) => {
    const memories = await agent.getMemories({
      matchCount: maxDefaultMemoryValues,
      signal,
    });
    // console.log('got new value 1', memories, signal.aborted);
    if (signal.aborted) return;

    const value = memories.map(memory => memory.text);
    // console.log('got new value 2', value);
    setRecentMemoriesValue(value);
  };
  const refreshEmbeddedMemories = async ({
    signal,
  }: {
    signal: AbortSignal,
  }) => {
    const embeddingString = conversation.getEmbeddingString();
    const memories = await agent.getMemory(embeddingString, {
      matchCount: maxDefaultMemoryValues,
      signal,
    });
    // console.log('got new value 3', memories, signal.aborted);
    if (signal.aborted) return;

    const value = memories.map(memory => memory.text);
    // console.log('got new value 4', value);
    setQueriedMemoriesValue(value);
  };

  const allMemoriesValue = [
    ...recentMemoriesValue,
    ...queriedMemoriesValue,
  ];
  // console.log('render all memories', {
  //   allMemoriesValue,
  //   recentMemoriesValue,
  //   queriedMemoriesValue,
  // });

  return (
    <>
      {allMemoriesValue.length > 0 && (
        <Prompt>
          {dedent`\
            # Memories
            Your character remembers the following:
            \`\`\`
          ` + '\n' +
          JSON.stringify(queriedMemoriesValue, null, 2) + '\n' +
          dedent`\
            \`\`\`
          ` + '\n' +
          dedent`\
            Note: to remember more specific memories, use the \`queryMemories\` action.
          ` 
          }
        </Prompt>
      )}
      <DeferConversation>
        <EveryNMessages n={10}>{({
          signal,
        }: {
          signal: AbortSignal,
        }) => {
          refreshRecentMemories({
            signal,
          });
        }}</EveryNMessages>
        <EveryNMessages n={1}>{({
          signal,
        }: {
          signal: AbortSignal,
        }) => {
          refreshEmbeddedMemories({
            signal,
          });
        }}</EveryNMessages>
      </DeferConversation>
    </>
  );
};
const DefaultMemories = () => {
  return (
    <DefaultMemoriesInternal />
  );
};
const MemoryWatcher = ({
  memoryQueries,
}: {
  memoryQueries: MemoryQuery[],
}) => {
  const agent = useAgent();
  const [memoryWatchers, setMemoryWatchers] = useState(() => new Map<string, MemoryWatcherObject>());
  const [memoryEpoch, setMemoryEpoch] = useState(0);

  const allMemoryWatchers = Array.from(memoryWatchers.values());

  // listen to the queries and start/stop the watchers
  useEffect(() => {
    // console.log('got memory queries update', structuredClone(memoryQueries));

    // remove old watchers
    for (const [query, watcher] of Array.from(memoryWatchers.entries())) {
      if (!memoryQueries.some(memoryQuery => memoryQuery.query === query)) {
        // console.log('remove old watcher', { query });
        memoryWatchers.delete(query);
        watcher.destroy();
      }
    }
    // add new watchers
    for (const memoryQuery of memoryQueries) {
      const { query } = memoryQuery;
      if (!memoryWatchers.has(query)) {
        const watcher = new MemoryWatcherObject(query, {
          agent,
        });
        // console.log('add new watcher', { query });
        // trigger re-render when the watched value updates
        watcher.addEventListener('update', () => {
          // console.log('watcher update', {
          //   query,
          //   value: watcher.value,
          // });
          setMemoryEpoch(e => e + 1);
        });
        memoryWatchers.set(query, watcher);
      }
    }
  }, [JSON.stringify(memoryQueries)]);
  
  return allMemoryWatchers.length > 0 && (
    <>
      <Prompt>
        {dedent`\
          # Memory Watchers
          Here are the memory watchers that are currently active, along with the results.
          \`\`\`
        ` + '\n' +
        JSON.stringify(allMemoryWatchers.map(watcher => watcher.getQa()), null, 2) + '\n' +
        dedent`\
          \`\`\`
        `}
      </Prompt>
      <DeferConversation>
        {allMemoryWatchers.map((memoryWatcher, index) => {
          return (
            <EveryNMessages n={1} key={memoryWatcher.query}>{() => {
              memoryWatcher.refresh();
            }}</EveryNMessages>
          );
        })}
      </DeferConversation>
    </>
  );
};

type MemoryQuery = {
  query: string;
};
class MemoryWatcherObject extends EventTarget {
  query: string = '';
  value: string[] | undefined = [];
  agent: ActiveAgentObject;
  constructor(query: string, opts?: any) {
    super();

    const {
      agent,
    }: {
      agent: any,
    } = opts ?? {};

    this.query = query;
    this.agent = agent;
  }
  async refresh() {
    const { agent } = this;
    const memories = await agent.getMemory(this.query, {
      matchCount: maxMemoryQueryValues,
    });
    this.value = memories.map(memory => memory.text);

    this.dispatchEvent(new MessageEvent('update', {
      data: {
        value: this.value,
      },
    }));
  }
  getQa() {
    return {
      q: this.query,
      a: this.value,
    };
  }
  destroy() {
    // nothing
  }
};
const AddMemoryAction = () => {
  const agent = useAgent();
  return (
    <Action
      type="addMemory"
      description={dedent`\
        Save a memory to the database in the form of a question and answer.
        Use this whenever there there is a new fact or detail that you want to remember.
      `}
      schema={
        z.object({
          query: z.string(),
          answer: z.string(),
        })
      }
      examples={[
        {
          query: 'What time did we schedule the karaoke night?',
          answer: '7pm, but bring glitter.',
        },
        {
          query: 'What was the secret password to enter the speakeasy?',
          answer: 'Flamingo hats unite!',
        },
        {
          query: 'Who is the lead singer of our virtual rock band?',
          answer: 'Captain Zed the Time Traveler.',
        },
        {
          query: 'What was the last pizza topping we debated?',
          answer: 'Pineapple, and it got heated.',
        },
        {
          query: 'What is my character\'s mission in this quirky reality show?',
          answer: 'Win the golden avocado.',
        },
        {
          query: 'When are we supposed to launch the confetti cannon?',
          answer: 'Right after the CEO’s dance-off.',
        },
        {
          query: 'What’s the name of our team’s pet mascot?',
          answer: 'Sir Fluffington the Third.',
        },
        {
          query: 'What’s the theme of this week\'s office party?',
          answer: 'Space pirates with neon lights.',
        },
      ]}
      handler={async (e: PendingActionEvent) => {
        const { query, answer } = e.data.message.args as {
          query: string,
          answer: string,
        };
        const text = `${query}\n${answer}`;
        const content = {
          query,
          answer,
        };
        await agent.addMemory(text, content);
        await e.commit();
      }}
    />
  );
};
const QueryMemoriesAction = ({
  memoryQueries,
  setMemoryQueries,
}) => {
  return (
    <Action
      type="queryMemories"
      description={
        dedent`\
          This action lets you remember specific details better by focusing your attention on a question.
          Using this whenever the topic of conversation changes. It will significantly boost your ability to recall information.
          For example, "What are the plans to meet up?" will help us remember the details of the meet-up.

          We are already querying the following:
        ` + '\n' +
        JSON.stringify(memoryQueries, null, 2)
      }
      schema={
        z.object({
          query: z.string(),
        })
      }
      examples={[
        {
          query: 'What pizza toppings does everyone like for the next movie marathon?',
        },
        {
          query: 'When is the CEO’s karaoke battle scheduled again?',
        },
        {
          query: 'Which team member is in charge of the surprise flash mob?',
        },
        {
          query: 'What wild idea did we brainstorm for the company’s anniversary?',
        },
        {
          query: 'Who volunteered to handle the laser light show at the next event?',
        },
      ]}
      handler={async (e: PendingActionEvent) => {
        const { query } = e.data.message.args as {
          query: string,
        };
        setMemoryQueries((queries = []) => {
          const o = shuffle([
            ...queries,
            {
              query,
            },
          ]).slice(-maxMemoryQueries);
          return o;
        });
        await e.commit();
      }}
    />
  );
};
const MemoryQueriesInternal = () => {
  const conversation = useConversation();
  const kv = useKv();
  const [memoryQueries, setMemoryQueries] = kv.use<MemoryQuery[]>(`memoryQueries-${conversation.getKey()}`, () => []);

  return (
    <>
      <QueryMemoriesAction memoryQueries={memoryQueries} setMemoryQueries={setMemoryQueries} />
      <MemoryWatcher memoryQueries={memoryQueries} />
    </>
  );
};
const MemoryQueries = () => {
  return (
    <MemoryQueriesInternal />
  );
};
export const RAGMemory = () => {
  return (
    <>
      <AddMemoryAction />
      <DefaultMemories />
      <MemoryQueries />
    </>
  );
}; */

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
        console.log('load memories', memories);
        setMemories(memories);
      }}</EveryNMessages>
      {/* write memories */}
      <EveryNMessages n={writeEveryN} firstCallback={false}>{(e) => {
        (async () => {
          await queueManager.waitForTurn(async () => {
            // XXX get the summary string from the last N messages
            const messages = conversation.messageCache.getMessages();
            const memories = messages.map(m => {
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

            // async complete(
            //   messages: ChatMessages,
            //   opts: SubtleAiCompleteOpts = {
            //     model: this.agent.model,
            //   },
            // ) {

            const last2NMessages = memories.slice(-(maxDefaultMemoryValues + writeEveryN));
            const oldContextMessages = last2NMessages.slice(0, -writeEveryN);
            const newContextMessages = last2NMessages.slice(-writeEveryN);

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