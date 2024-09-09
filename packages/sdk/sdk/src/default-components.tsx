import React, { useRef } from 'react';
import { useState, useEffect, useMemo, useContext } from 'react';
import dedent from 'dedent';
import { ZodTypeAny, z } from 'zod';
import { minimatch } from 'minimatch';
import jsAgo from 'js-ago';
// import puppeteer from '@cloudflare/puppeteer';
// import type { ZodTypeAny } from 'zod';
import type {
  AppContextValue,
  // AgentProps,
  ActionProps,
  // PromptProps,
  FormatterProps,
  // ParserProps,
  // PerceptionProps,
  // SchedulerProps,
  // ServerProps,
  SceneObject,
  AgentObject,
  ActiveAgentObject,
  PendingActionEvent,
  PerceptionEvent,
  ActionMessage,
  PlayableAudioStream,
  Attachment,
  FormattedAttachment,
} from './types';
import {
  AppContext,
} from './context';
import {
  Agent,
  Action,
  ActionModifier,
  Prompt,
  Formatter,
  Perception,
  PerceptionModifier,
  Task,
  // Scheduler,
  Server,
  Conversation,
} from './components';
import {
  AbortableActionEvent,
} from './classes/abortable-action-event';
import {
  AbortablePerceptionEvent,
} from './classes/abortable-perception-event';
import {
  useAgent,
  useAuthToken,
  // useAgents,
  // useScene,
  useActions,
  useFormatters,
  useName,
  usePersonality,
  useStoreItems,
  usePurchases,
  useKv,
  useTts,
  useConversation,
  useCachedMessages,
} from './hooks';
// import type { AppContextValue } from './types';
import { parseCodeBlock, printZodSchema } from './util/util.mjs';
import {
  storeItemType,
} from './util/agent-features.mjs';
import {
  currencies,
  intervals,
} from './constants.mjs';
import {
  describe,
  describeJson,
} from 'usdk/sdk/src/util/vision.mjs';
import {
  imageSizes,
  fetchImageGeneration,
} from 'usdk/sdk/src/util/generate-image.mjs';
// import { blob2img } from 'usdk/util/blob-utils.mjs';
import { r2EndpointUrl } from './util/endpoints.mjs';

// Note: this comment is used to remove imports before running tsdoc
// END IMPORTS

// utils

const timeAgo = (timestamp: Date) => jsAgo(+timestamp / 1000, { format: 'short' });
const defaultPriorityOffset = 100;

// defaults

/**
 * Renders the default agent components.
 * @returns The JSX elements representing the default agent components.
 */
export const DefaultAgentComponents = () => {
  return (
    <>
      <DefaultFormatters />
      <DefaultActions />
      <DefaultPrompts />
      <DefaultPerceptions />
      <DefaultGenerators />
      <DefaultSenses />
      <DefaultTasks />
      <DefaultServers />
    </>
  );
};

// actions

const ChatActions = () => {
  return (
    <>
      <Action
        name="say"
        description={`A character says something.`}
        schema={
          z.object({
            text: z.string(),
          })
        }
        examples={[
          {
            text: 'Hello, there! How are you doing?',
          },
        ]}
        // handler={async (e: PendingActionEvent) => {
        //   await e.commit();
        // }}
      />
    </>
  );
};
const StoreActions = () => {
  const agent = useAgent();
  const storeItems = useStoreItems();
  return (
    <>
      {!!agent.stripeConnectAccountId && storeItems.length > 0 && (
        <Action
          name="paymentRequest"
          description={dedent`\
            Request payment or a subscription for an item available in the store.
          `}
          schema={storeItemType}
          examples={[
            {
              type: 'payment',
              props: {
                name: 'potion',
                description: 'Heals 50 HP',
                amount: 1,
                currency: currencies[0],
              },
            },
            {
              type: 'subscription',
              props: {
                name: 'Blessing',
                description: 'Get daily blessings delivered in your DMs',
                amount: 1,
                currency: currencies[0],
                interval: intervals[0],
                intervalCount: 1,
              },
            },
          ]}
          handler={async (e: PendingActionEvent) => {
            const {
              stripeConnectAccountId,
            } = e.data.agent.agent;
            (e.data.message.args as any).stripeConnectAccountId = stripeConnectAccountId;

            await e.commit();
          }}
        />
      )}
    </>
  );
};

/**
 * Renders the default actions components.
 * @returns The JSX elements representing the default actions components.
 */
export const DefaultActions = () => {
  return (
    <>
      <ChatActions />
      <StoreActions />
    </>
  );
};

// prompts

/**
 * Renders the default prompts components.
 * @returns The JSX elements representing the default prompts components.
 */
export const DefaultPrompts = () => {
  return (
    <>
      <DefaultHeaderPrompt />
      <ConversationEnvironmentPrompt />
      {/* <RAGMemoriesPrompt agents={[currentAgent]} /> */}
      <ActionsPrompt />
      <StorePrompt />
      <ConversationMessagesPrompt />
      <InstructionsPrompt />
    </>
  );
};
export const DefaultHeaderPrompt = () => {
  return (
    <Prompt>
      {dedent`
        Role-play as a character in a chat. I will give you the context, characters, and the possible actions you can take.
        Respond with a JSON object specifying the action method and arguments in the given format.
      `}
    </Prompt>
  );
};
export const ConversationEnvironmentPrompt = () => {
  return (
    <Conversation>
      <ScenePrompt />
      <CharactersPrompt />
    </Conversation>
  );
};
export const ScenePrompt = () => {
  const conversation = useConversation();
  const scene = conversation.getScene();
  return (
    <Prompt>
      {scene && dedent`
        # Scene
        ${scene.description}
      `}
    </Prompt>
  );
};
const formatAgent = (agent: any) => {
  return [
    `Name: ${agent.name}`,
    `UserId: ${agent.id}`,
    `Bio: ${agent.bio}`,
  ].join('\n');
};
export const CharactersPrompt = () => {
  const conversation = useConversation();
  const agents = conversation.getAgents();
  const name = useName();
  const bio = usePersonality();
  const currentAgentSpec = {
    name,
    // id,
    bio,
  };
  const agentSpecs = agents.map((agent) => agent.getPlayerSpec());

  return (
    <Prompt>
      {dedent`
        # Your Character
      ` +
        '\n\n' +
        formatAgent(currentAgentSpec) +
        (agents.length > 0
          ? (
            '\n\n' +
            dedent`
              # Other Characters
            ` +
            '\n\n' +
            agentSpecs
              .map(formatAgent)
              .join('\n\n')
          )
          : ''
        )
      }
    </Prompt>
  );
};
/* export const RAGMemoriesPrompt = ({
  agents,
}: {
  agents: Array<AgentObject>;
}) => {
  // XXX make this asynchroneous
  return null;
  // return (
  //   <Prompt>
  //     {dedent`
  //       ## Memories
  //       ${agents.map((agent) => {
  //         return dedent`
  //           ### ${agent.name}
  //           ${agent.memory.text}
  //         `;
  //       })}
  //     `}
  //   </Prompt>
  // );
}; */
export const ActionsPrompt = () => {
  const actions = useActions();
  const formatters = useFormatters();

  let s = '';
  if (actions.length > 0 && formatters.length > 0) {
    const formatter = formatters[0];
    s = dedent`
      # Actions
      Here are the allowed actions that your character can take:
    ` +
    '\n\n' +
    formatter.formatFn(Array.from(actions.values()));
  }
  return (
    <Prompt>{s}</Prompt>
  );
};
const StoreItemsPrompt = () => {
  const agent = useAgent();
  const storeItems = useStoreItems();
  return (
    <Prompt>
      # Store
      Here are the store items available for purchase.
      {!!agent.stripeConnectAccountId && storeItems.length > 0 ? (
        dedent`\
          Amount in cents (e.g. 100 = $1).
          \`\`\`
        ` + '\n' +
        JSON.stringify(storeItems, null, 2) + '\n' +
        dedent`\
          \`\`\`
        `
      ) : '*none*'}
    </Prompt>
  );
};
const PurchasesPrompt = () => {
  const conversation = useConversation();
  const purchases = usePurchases();

  const conversationUserIds = Array.from(conversation.agentsMap.keys());
  const userPurchases = purchases.filter(purchase => {
    return conversationUserIds.includes(purchase.buyerUserId);
  });

  return (
    <Prompt>
      {purchases.length > 0 && dedent`\
        # Purchases
        Here are the purchases made so far:
        \`\`\`
      ` + '\n' +
      JSON.stringify(userPurchases, null, 2) + '\n' +
      dedent`\
        \`\`\`
      `}
    </Prompt>
  )
};
export const StorePrompt = () => {
  return (
    <>
      <StoreItemsPrompt />
      <Conversation>
        <PurchasesPrompt />
      </Conversation>
    </>
  );
};
export const ConversationMessagesPrompt = () => {
  return (
    <Conversation>
      <CachedMessagesPrompt />
    </Conversation>
  );
}
export const CachedMessagesPrompt = () => {
  const cachedMessages = useCachedMessages();

  const formatAttachments = (attachments: Attachment[]) => attachments.map((attachment) => formatAttachment(attachment));
  const formatAttachment = (attachment: Attachment): FormattedAttachment => {
    const {
      id,
      type,
      alt,
    } = attachment;
    return {
      id,
      type,
      alt,
    };
  };

  return (
    <Prompt>
      {dedent`
        # Message history
        ${
          cachedMessages.length > 0
            ? dedent`
              Here is the chat so far, in JSON format:
            ` +
              '\n' +
              '```' +
              '\n' +
              cachedMessages
                .map((action) => {
                  const { /*userId,*/ name, method, args, attachments = [], timestamp } = action;
                  const j = {
                    // userId,
                    name,
                    method,
                    args,
                    attachments: formatAttachments(attachments),
                  };
                  return JSON.stringify(j) + ' ' + timeAgo(new Date(timestamp));
                })
                .join('\n') +
              '\n' +
              dedent`
                <end of message history, continue from here>
              ` +
              '\n' +
              '```'
            : 'No messages have been sent or received yet. This is the beginning of the conversation.'
        }
      `}
    </Prompt>
  );
};
export const InstructionsPrompt = () => {
  const agent = useAgent();

  return (
    <Prompt>
      {dedent`
        # Instructions
        Respond with the next action taken by your character: ${agent.name}
        The method/args of your response must match one of the allowed actions.
      `}
    </Prompt>
  );
};

// formatters
const makeJsonSchema = (method: string, args: z.ZodType<object> = z.object({})) => {
  return z.object({
    method: z.literal(method),
    args,
  });
};
export const DefaultFormatters = () => {
  return <JsonFormatter />;
};
export const JsonFormatter = () => {
  return (
    <Formatter
      /* map actions to zod schema to generate an action */
      schemaFn={(actions: ActionProps[]) => {
        const types = actions.map((action) => {
          const {
            name,
            schema: argsSchema,
          } = action;
          const zodSchema = makeJsonSchema(name, argsSchema);
          return zodSchema;
        });
        if (types.length >= 2) {
          return z.union(
            types as any
          );
        } else if (types.length === 1) {
          return types[0];
        } else {
          return z.object({});
        }
      }}
      /* format actions to instruction prompt */
      formatFn={(actions: ActionProps[]) => {
        return actions.map((action) => {
          const {
            name,
            description,
            examples,
          } = action;

          const examplesJsonString = (examples ?? []).map((args) => {
            return JSON.stringify(
              {
                method: name,
                args,
              }
            );
          }).join('\n');

          return (
            name ? (
              dedent`
                * ${name}
              ` +
              '\n'
            ) : ''
          ) +
          (description ? (description + '\n') : '') +
          (examplesJsonString
            ? (
              dedent`
                Examples:
                \`\`\`
              ` +
              '\n' +
              examplesJsonString +
              '\n' +
              dedent`
                \`\`\`
              `
            )
            : ''
          );
        }).join('\n\n');
      }}
    />
  );
};

// perceptions

/**
 * Renders the default perceptions components.
 * @returns The JSX elements representing the default perceptions components.
 */
export const DefaultPerceptions = () => {
  // const agent = useAgent();

  return (
    <>
      {/* <Perception
        type="nudge"
        handler={async (e) => {
          const targetPlayerId = (e.data.message.args as any).targetPlayerId as string;
          if (targetPlayerId === agent.id) {
            await e.data.targetAgent.think();
          }
        }}
      /> */}
      <Perception
        type="say"
        handler={async (e) => {
          await e.data.targetAgent.think();
        }}
      />
    </>
  );
};

// generators

const mediaGeneratorSpecs = [
  {
    types: ['image/webp'],
    optionsSchema: z.object({
      image_size: z.enum(imageSizes as any).optional(),
    }).optional(),
    generate: async ({
      prompt,
      options,
    }: {
      prompt: string,
      options?: {
        image_size?: string,
      },
    }, {
      jwt,
    }) => {
      const blob = await fetchImageGeneration(prompt, options, {
        jwt,
      });
      return blob;
    },
  },
];
const MediaGenerator = () => {
  const authToken = useAuthToken();
  const types = mediaGeneratorSpecs.flatMap(spec => spec.types) as [string, ...string[]];
  const generationSchemas = mediaGeneratorSpecs.map(spec => {
    const o = {
      type: z.enum(spec.types as any),
      prompt: z.string(),
      options: spec.optionsSchema,
      chatText: z.string().optional(),
    };
    return z.object(o);
  });
  const generationSchemasUnion = generationSchemas.length >= 2 ? z.union(generationSchemas as any) : generationSchemas[0];

  return (
    <Action
      name="media"
      description={dedent`\
        Generate simulated multimedia content and send it as an attachment.

        The given prompt will be used for generating the media.
        The optional chat text will be said sent along with the media.

        The available content types are:
        \`\`\`
      ` + '\n' +
      JSON.stringify(types, null, 2) + '\n' +
      dedent`\
        \`\`\`
      `}
      schema={generationSchemasUnion}
      examples={[
        {
          type: 'image/jpeg',
          prompt: `girl wearing a dress and a hat selling flowers in a Zelda-inspired market`,
          options: {
            image_size: imageSizes[0],
          },
          chatText: "Guess where I am? ;)",
        }
      ]}
      handler={async (e: PendingActionEvent) => {
        const {
          agent,
          message: {
            args: {
              type,
              prompt,
              options,
              chatText,
            },
          },
        } = e.data;

        console.log('got args', e.data.message.args);

        const retry = () => {
          agent.think();
        };

        const mediaGeneratorSpec = mediaGeneratorSpecs.find(spec => spec.types.includes(type));
        if (mediaGeneratorSpec) {
          const blob = await mediaGeneratorSpec.generate({
            prompt,
            options,
          }, {
            jwt: authToken,
          });
          console.log('got blob', blob);

          // upload to r2
          const guid = crypto.randomUUID();
          const keyPath = ['assets', guid, `image.jpg`].join('/');
          const u = `${r2EndpointUrl}/${keyPath}`;
          try {
            const res = await fetch(u, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${authToken}`,
              },
              body: blob,
            });
            if (res.ok) {
              const imageUrl = await res.json();
              // return j;
              // console.log('got image url', [imageUrl]);
              const m = {
                method: 'say',
                args: {
                  text: chatText ?? '',
                },
                attachments: [
                  {
                    id: guid,
                    type: 'image/webp',
                    url: imageUrl,
                    // alt: chatText,
                  },
                ],
              };
              console.log('add message', m);
              await agent.addMessage(m);
            } else {
              const text = await res.text();
              throw new Error(`could not upload voice file: ${blob.name}: ${text}`);
            }
          } catch (err) {
            throw new Error('failed to put voice: ' + u + ': ' + err.stack);
          }

          // const img = await blob2img(blob);
          // img.style.cssText = `\
          //   position: fixed;
          //   bottom: 0;
          //   right: 0;
          //   width: 300px;
          //   height: auto;
          //   z-index: 100;
          // `;
          // console.log('got img', img);
        } else {
          console.warn('warning: no media generator spec found for type', {
            type,
            mediaGeneratorSpecs,
          });
          retry();
        }
      }}
    />
  );
};
export const DefaultGenerators = () => {
  return (
    <MediaGenerator />
  );
};

// senses

const mediaPerceptionSpecs = [
  {
    types: ['image/jpeg', 'image/png', 'image/webp'],
    describe: async ({
      // blob,
      url,
      questions,
      agent,
    }: {
      // blob: Blob,
      url: string,
      questions: string[],
      agent: AgentObject,
    }, {
      jwt,
    }) => {
      const answersFormat = z.object({
        answers: z.array(z.string()),
      });
      const answersObject = await describeJson(url, dedent`\
        Respond as if you are role playing the following character:
        Name: ${agent.name}
        Bio: ${agent.bio}

        Answer the following questions about the image, as JSON array.
        Each question string in the input array should be answered with a string in the output array.
      ` + JSON.stringify({
        questions,
      }, null, 2), answersFormat, {
        jwt,
      });
      const { answers } = answersObject;
      return answers;
    },
  },
];
export const MultimediaSense = () => {
  const conversation = useConversation();
  const authToken = useAuthToken();
  const randomId = useMemo(() => crypto.randomUUID(), []);

  const makeAttachments = (messages: ActionMessage[]) => {
    const result = [];
    for (const message of messages) {
      if (message.attachments) {
        for (const attachment of message.attachments) {
          result.push(attachment);
        }
      }
    }
    return result;
  };
  const attachments = makeAttachments(conversation.messageCache.messages);

  return (
    <Action
      name="mediaPerception"
      description={
        dedent`
          Query multimedia content using natural language questions + answers.
          The questions should be short and specific.
          Use this whenever you need to know more information about a piece of media, like an image attachment.

          The available content is:
          \`\`\`
        ` + '\n' +
        JSON.stringify(attachments, null, 2) + '\n' +
        dedent`
          \`\`\`
        `
      }
      schema={
        z.object({
          // type: z.enum(types),
          id: z.string(),
          questions: z.array(z.string()),
        })
      }
      examples={[
        {
          // type: 'image/jpeg',
          id: randomId,
          questions: [
            'Describe the image.',
          ],
        },
        {
          // type: 'image/jpeg',
          id: randomId,
          questions: [
            `What are the dimensions of the subject, in meters?`,
          ],
        },
        {
          // type: 'image/jpeg',
          id: randomId,
          questions: [
            `Describe the people in the image.`,
            `What's the mood/aesthetic?`,
          ],
        },
      ]}
      handler={async (e: PendingActionEvent) => {
        console.log('mediaPerception handler 1', e.data);
        const {
          agent,
          message: {
            args: {
              id: attachmentId,
              questions,
            },
          },
        } = e.data;
        const retry = () => {
          agent.think();
        };
        const makeQa = (questions: string[], answers: string[]) => {
          return questions.map((q, index) => {
            const a = answers[index];
            return {
              q,
              a,
            };
          });
        };

        const attachments = [];
        const attachmentsToMessagesMap = new WeakMap();
        for (const message of conversation.messageCache.messages) {
          if (message.attachments) {
            for (const attachment of message.attachments) {
              attachments.push(attachment);
              attachmentsToMessagesMap.set(attachment, message);
            }
          }
        }

        const attachment = attachments.find(attachment => attachment.id === attachmentId);
        console.log('mediaPerception handler 2', {
          attachmentId,
          attachments,
          attachment,
          questions,
          agent,
          conversation,
        });
        if (attachment) {
          const {
            type,
            url,
          } = attachment;
          if (url) {
            // const res = await fetch(url);
            // const blob = await res.blob();
            // console.log('querying!', {
            //   blob,
            //   questions,
            //   agent,
            // });
            const mediaPerceptionSpec = mediaPerceptionSpecs.find(spec => spec.types.includes(type));
            if (mediaPerceptionSpec) {
              const answers = await mediaPerceptionSpec.describe({
                // blob,
                url,
                questions,
                agent: agent.agent,
              }, {
                jwt: authToken,
              });
              // const alt = makeQa(questions, answers);
              console.log('got answers', {
                questions,
                answers,
                // alt,
              });
              (e.data.message.args as any).questions = questions;
              console.log('commit 1', e.data.message);
              await e.commit();
              const alt = makeQa(questions, answers);
              console.log('commit 2', e.data.message, alt);
              await agent.think(dedent`\
                Character looked at attachment and discovered the following:
              ` + '\n' +
                JSON.stringify(alt, null, 2)
              );
            } else {
              console.warn('warning: no media perception spec found for type', {
                type,
                mediaPerceptionSpecs,
              });
              retry();
            }
          } else {
            console.warn('warning: attachment has no url', {
              attachmentId,
              attachments,
              attachment,
            });
            retry();
          }
        } else {
          console.warn('warning: model generated invalid id, retrying', {
            attachmentId,
            attachments,
            attachment,
          });
          retry();
        }
      }}
    />
  )
};
export const DefaultSenses = () => {
  // const agent = useAgent();

  return (
    <>
      <Conversation>
        <MultimediaSense />
      </Conversation>
    </>
  );
};

// server

/**
 * Renders the default server components.
 * @returns The JSX elements representing the default server components.
 */
export const DefaultServers = () => {
  return <StaticServer />;
};

// task

/**
 * Renders the default server components.
 * @returns The JSX elements representing the default server components.
 */
export const DefaultTasks = () => {
  return <StatusTask />
};
export const StatusTask = () => {
  // const agent = useAgent();
  // const agents = useAgents();
  // const conversation = useConversation();
  // const agents = conversation.getAgents();
  // const lastActions = useActionHistory({
  //   filter: {
  //     limit: 1,
  //   },
  // });
  // console.log('got last actions', lastActions);
  // XXX use exponential backoff

  // const symbol = useMemo(() => Symbol('task'), []);
  // const [enabled, setEnabled] = useState(false);
  // const [timestampOfLastRemoteChatMessage, setTimestampOfLastRemoteChatMessage] = useState(0);

  return (
    // <>
    //   <Server>
    //     {() => {
    //       return {
    //         async fetch(request: Request, env: object) {
    //           if (request.method === 'POST' && request.url === '/status') {
    //             const j = await request.json();
    //             const enabled = j?.enabled;
    //             if (typeof enabled === 'boolean') {
    //               setEnabled(enabled);
    //               return new Response(JSON.stringify({
    //                 ok: true,
    //               }));
    //             } else {
    //               return new Response(JSON.stringify({
    //                 error: `Invalid value for 'enabled'.`,
    //               }));
    //             }
    //           } else {
    //             return null;
    //           }
    //         },
    //       };
    //     }}
    //   </Server>
    //   {enabled && <Task
    //     id={symbol}
    //     handler={async (e) => {
    //       await agent.think();
    //       return new TaskResult(TaskResult.SCHEDULE, {
    //         timestamp: Date.now() + 2000,
    //       });
    //     }}
    //   />}
    // </>
    <>
      {/* <Task
        id={symbol}
        handler={async (e) => {
          await agent.think();
          return new TaskResult(TaskResult.SCHEDULE, {
            timestamp: new Date(Date.now() + 2000),
          });
        }}
      /> */}
    </>
  );
};

// const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const printRequest = (request: Request) => {
  const { method, url } = request;
  return `${method} ${url}`;
};
// const generateWebServerCode = async (
//   request: Request,
//   prompt: string,
//   context: AppContextValue,
// ) => {
//   const messages = [
//     {
//       role: 'system',
//       content: dedent`
//         You are an programmatic web server.
//         Take the user's specifcation of an in-flight web Request and write the Typescript code to generate a Response.
//         i.e. your task is to write a JavaScript function with the following signature:
//         \`\`\`
//         handle: (request: Request) => Promise<Response>;
//         \`\`\`

//         Do not write any comments, only the code. Use JavaScript, not TypeScript. Wrap your response on triple backticks.
//         e.g.
//         \`\`\`js
//         async function handle(request) {
//           return new Response('Hello, world!', { status: 200 });
//         }
//         \`\`\`

//         The APIs available to you are as follows:

//         /**
//          * Generate fully functional HTML page source from the given prompt.
//          * @param {string} prompt - The user prompt to generate the HTML page source from.
//          * @returns {Response} - Response that resolves to the HTML page source.
//          * @example
//          * const googleHtmlRes = await generateHtml('A fake version of the simple Google web page. It should include the classig Google header image, the search bar, and the two buttons "Search" and "I'm Feeling Lucky".');
//          * const googleHtml = await googleHtmlRes.text();
//          */
//         generateHtml: (prompt: string) => Promise<Response>;
//         \`\`\`

//         /**
//          * Generate a JSON response to a request.
//          * @param {string} prompt - The prompt to generate the JSON response from.
//          * @returns {Promise<Response>} - Response that resolves to the JSON response.
//          * @example
//          * const searchResultsRes = await generateJson(\`
//          * Object representing search results for the query "cats". It should match the schema:
//          * { results: [{ name: string, description: string, imgUrl: string }] }');
//          * \`);
//          * const searchResults = await searchResultsRes.json();
//          */
//         generateJson: (prompt: string) => Promise<Response>;

//         /**
//          * Generate an image response to a request.
//          * @param {string} prompt - The prompt to generate the image response from.
//          * @returns {Promise<Response>} - Response that resolves to the image data.
//          * @example
//          * const catImageRes = await generateImage('A cute cat image.');
//          * const catImageBlob = await catImageRes.blob();
//          */
//         generateImage: (prompt: string) => Promise<Response>;
//       `,
//     },
//     {
//       role: 'user',
//       content: dedent`
//         HTTP request being handled:
//         \`\`\`
//         ${printRequest(request)}
//         \`\`\`
//         Generate code to do the following:
//         ${prompt}
//       `,
//     },
//   ];
//   const newMessage = await context.subtleAi.complete(messages);
//   const responseString = newMessage.content;
//   const codeBlock = parseCodeBlock(responseString);
//   return new Response(codeBlock, {
//     status: 200,
//     headers: {
//       'Content-Type': 'application/javascript',
//     },
//   });
// };
const generateHtml = async (prompt: string, context: AppContextValue) => {
  // const { method, url } = request;
  // const headers = Array.from(request.headers.entries())
  //   .map(([k, v]) => `${capitalize(k)}: ${v}`)
  //   .join('\n');
  const messages = [
    {
      role: 'system',
      content: dedent`
        You are an HTML page generator.
        Take the user's specifcation of a web page and generate the HTML source for it.
        When referencing images from the local server, use relative paths instead of absolute.

        Wrap your response on triple backticks.
        e.g.
        Prompt: A simple hello world web page with a header, an image, a heading, a paragraph, and a form with a textarea and a submit button.
        Response:
        \`\`\`html
        <html>
          <head>
            <title>Hello, world!</title>
          </head>
          <body>
            <img src="/banner.png">
            <h1>Hi there</h1>
            <p>Welcome to my web page!</p>
            <form>
              <textarea id="textarea"></textarea>
              <input type="submit">
            </form>
          </body>
        </html>
        \`\`\`
      `,
    },
    {
      role: 'user',
      content: dedent`
        Generate an HTML page to do the following:
        ${prompt}
      `,
    },
  ];
  const newMessage = await context.subtleAi.complete(messages);
  const responseString = newMessage.content;
  const codeBlock = parseCodeBlock(responseString);
  return new Response(codeBlock, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
};
const generateJson = async (prompt: string, context: AppContextValue) => {
  // const { method, url } = request;
  // const headers = Array.from(request.headers.entries())
  //   .map(([k, v]) => `${capitalize(k)}: ${v}`)
  //   .join('\n');
  const messages = [
    {
      role: 'system',
      content: dedent`
        You are a JSON data API simulator.
        Take the user's specifcation of a JSON data specification to return and return it.

        Do not write any comments, only the JSON. Wrap your response on triple backticks.
        e.g.
        Prompt: Object representing search results for the query 'cats'. It should match the schema: { results: [{ name: string, description: string, imgUrl: string }] }
        Response:
        \`\`\`json
        {
          "results": [
            { "name": "Fluffy", "description": "A fluffy cat", "imgUrl": "/images/cats/fluffy.jpg" },
            { "name": "Whiskers", "description": "A cat with whiskers", "imgUrl": "/images/cats/whiskers.jpg" }
          ]
        }
        \`\`\`
      `,
    },
    {
      role: 'user',
      content: dedent`
        Generate an HTML page to do the following:
        ${prompt}
      `,
    },
  ];
  const newMessage = await context.subtleAi.complete(messages);
  const responseString = newMessage.content;
  return new Response(responseString, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
const generateImage = async (prompt: string, context: AppContextValue) => {
  const arrayBuffer = await context.subtleAi.generateImage(prompt);
  return new Response(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
    },
  });
};
type Route = string | RegExp | null;
type Routes = Array<Route>;
type HandlerType = (
  this: GenerativeFetchHandler,
  request: Request,
  context: AppContextValue,
) => Promise<Response>;
class GenerativeFetchHandler {
  method: string | null;
  route: Route | Routes;
  prompt: string;
  handler: HandlerType;

  constructor({
    method,
    route,
    prompt,
    handler,
  }: {
    method: string | null;
    route: Route | Routes;
    prompt: string;
    handler: HandlerType;
  }) {
    this.method = method;
    this.route = route;
    this.prompt = prompt;
    this.handler = handler;
  }
  matches(request: Request) {
    const u = new URL(request.url);
    const routes = Array.isArray(this.route) ? this.route : [this.route];
    return routes.every((route) => {
      /* console.log('match route', {
        method: this.method,
        route,
        prompt: this.prompt,
        handler: this.handler.toString(),
        pathname: u.pathname,
        methodMatch: this.method === null || request.method === this.method,
        routeMatch:
          route === null ||
          (typeof route === 'string' && minimatch(u.pathname, route)) ||
          (route instanceof RegExp && route.test(u.pathname)),
        fullMatch:
          (this.method === null || request.method === this.method) &&
          (route === null ||
            (typeof route === 'string' && minimatch(u.pathname, route)) ||
            (route instanceof RegExp && route.test(u.pathname)))
      }); */
      return (
        (this.method === null || request.method === this.method) &&
        (route === null ||
          (typeof route === 'string' && minimatch(u.pathname, route)) ||
          (route instanceof RegExp && route.test(u.pathname)))
      );
    });
  }
  async handle(request: Request, appContextValue: AppContextValue) {
    return await this.handler.call(this, request, appContextValue);
  }
}

class GenerativeFetchHandlerHook {
  cachedHandlers: Array<GenerativeFetchHandler>;
  handler: HandlerType;

  constructor({
    cachedHandlers,
    handler,
  }: {
    cachedHandlers: Array<GenerativeFetchHandler>;
    handler: HandlerType;
  }) {
    this.handler = handler;
    this.cachedHandlers = cachedHandlers;
  }

  private hookFn(method: string | null, route: Route | Routes, prompt: string) {
    const handler = new GenerativeFetchHandler({
      method,
      route,
      prompt,
      handler: this.handler,
    });
    // console.log('add handler', {
    //   method,
    //   route,
    //   prompt,
    //   handler: this.handler,
    // });
    this.cachedHandlers.push(handler);
  }
  getHookFn() {
    return this.hookFn.bind(this);
  }
}
const cachedGenerativeHandlers = [];
const getCachedGenerativeHandlers = () => cachedGenerativeHandlers;
const clearCachedGenerativeHandlers = () => {
  cachedGenerativeHandlers.length = 0;
};
// const generativeFetchHandlerHook = new GenerativeFetchHandlerHook({
//   cachedHandlers: cachedGenerativeHandlers,
//   async handler(
//     this: GenerativeFetchHandler,
//     request: Request,
//     context: AppContextValue,
//   ) {
//     let codeString = null;
//     let error = null;
//     try {
//       const webServerCodeRes = await generateWebServerCode(
//         request,
//         this.prompt,
//         context,
//       );
//       codeString = await webServerCodeRes.text();
//     } catch (err) {
//       error = err;
//     }

//     if (!error) {
//       if (!error) {
//         const text = '';
//         const newRes = new Response(text, {
//           status: 200,
//           headers: {
//             'Content-Type': 'application/javascript',
//           },
//         });
//         return newRes;
//       } else {
//         return new Response(
//           JSON.stringify({
//             error,
//           }),
//           {
//             status: 500,
//             headers: {
//               'Content-Type': 'application/json',
//             },
//           },
//         );
//       }
//     } else {
//       return new Response(
//         JSON.stringify({
//           error: 'failed to parse LLM output: ' + error,
//         }),
//         {
//           status: 500,
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         },
//       );
//     }
//   },
// });
const generativeHtmlFetchHandlerHook = new GenerativeFetchHandlerHook({
  cachedHandlers: cachedGenerativeHandlers,
  async handler(
    this: GenerativeFetchHandler,
    request: Request,
    context: AppContextValue,
  ) {
    let htmlString = null;
    let error = null;
    try {
      const webServerCodeRes = await generateHtml(this.prompt, context);
      htmlString = await webServerCodeRes.text();
    } catch (err) {
      error = err;
    }

    if (!error) {
      if (!error) {
        const newRes = new Response(htmlString, {
          status: 200,
          headers: {
            'Content-Type': 'application/javascript',
          },
        });
        return newRes;
      } else {
        return new Response(
          JSON.stringify({
            error,
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
      }
    } else {
      return new Response(
        JSON.stringify({
          error: 'failed to parse LLM output: ' + error,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
  },
});
const generativeJsonFetchHandlerHook = new GenerativeFetchHandlerHook({
  cachedHandlers: cachedGenerativeHandlers,
  async handler(
    this: GenerativeFetchHandler,
    request: Request,
    context: AppContextValue,
  ) {
    const jsonRes = await generateJson(
      dedent`
        HTTP request being handled:
        \`\`\`
        ${printRequest(request)}
        \`\`\`
        Generate JSON for do the following:
        ${this.prompt}
      `,
      context,
    );
    return jsonRes;
  },
});
const generativeImageFetchHandlerHook = new GenerativeFetchHandlerHook({
  cachedHandlers: cachedGenerativeHandlers,
  async handler(
    this: GenerativeFetchHandler,
    request: Request,
    context: AppContextValue,
  ) {
    const messages = [
      {
        role: 'system',
        content: dedent`
          You are an assistant that writes image prompts for a generative AI system.
          Take the user's specifcation of an in-flight web Request and and a prompt, and write an 1-3 sentence image prompt for it.

          Wrap your response on triple backticks.
          e.g.
          Prompt:
          Write an appropriate image prompt for the following web request:
          GET /images/anime/cats/miko.png
          The image should be set in a fantasy isekai background.
          Response:
          \`\`\`txt
          A fantasy isekai landscape featuring a cute anime-style cat named Miko. The scene is vibrant and magical, with a lush forest in the background, mystical floating islands above, and a clear blue sky. The cat, Miko, has large expressive eyes, fluffy fur, and wears a small red cloak. The overall atmosphere is enchanting and whimsical, perfectly suited for an isekai setting.
          \`\`\`
        `,
      },
      {
        role: 'user',
        content: dedent`
          HTTP request being handled:
          \`\`\`
          ${printRequest(request)}
          \`\`\`
          Generate an image prompt for the following:
          ${this.prompt}
        `,
      },
    ];
    // console.log('generate image 1', {
    //   messages,
    // });
    const newMessage = await context.subtleAi.complete(messages);
    const imagePrompt = newMessage.content;

    // console.log('generate image 2', {
    //   imagePrompt,
    // });
    const imageRes = await generateImage(imagePrompt, context);
    const json = await imageRes.json();
    // console.log('generate image 3', {
    //   json: JSON.stringify(json, null, 2),
    // });
    const url = json.data[0].url;
    // console.log('generate image 4', {
    //   url,
    // });
    const proxyRes = await fetch(url);
    if (proxyRes.ok) {
      return new Response(proxyRes.body, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
        },
      });
    } else {
      return new Response(proxyRes.body, {
        status: proxyRes.status,
      });
    }
  },
});
const generativeFarcasterFrameFetchHandlerHook = new GenerativeFetchHandlerHook(
  {
    cachedHandlers: cachedGenerativeHandlers,
    async handler(
      this: GenerativeFetchHandler,
      request: Request,
      context: AppContextValue,
    ) {
      const imageUrl = `https://picsum.photos/300`;
      const frameHtml = dedent`
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${imageUrl}" />
            <meta property="og:image" content="${imageUrl}" />

            <meta property="fc:frame:button:1" content="Green" />
            <meta property="fc:frame:button:2" content="Purple" />
            <meta property="fc:frame:button:3" content="Red" />
            <meta property="fc:frame:button:4" content="Blue" />
          </head>
          <body>
            <h1>Frame test</h1>
            <p>Hello, world</p>
          </body>
        </html>
      `;
      return new Response(frameHtml);
      /* const messages = [
        {
          role: 'system',
          content: dedent`
            You are an assistant that writes image prompts for a generative AI system.
            Take the user's specifcation of an in-flight web Request and and a prompt, and write an 1-3 sentence image prompt for it.

            Wrap your response on triple backticks.
            e.g.
            Prompt:
            Write an appropriate image prompt for the following web request:
            GET /images/anime/cats/miko.png
            The image should be set in a fantasy isekai background.
            Response:
            \`\`\`txt
            A fantasy isekai landscape featuring a cute anime-style cat named Miko. The scene is vibrant and magical, with a lush forest in the background, mystical floating islands above, and a clear blue sky. The cat, Miko, has large expressive eyes, fluffy fur, and wears a small red cloak. The overall atmosphere is enchanting and whimsical, perfectly suited for an isekai setting.
            \`\`\`
          `,
        },
        {
          role: 'user',
          content: dedent`
            HTTP request being handled:
            \`\`\`
            ${printRequest(request)}
            \`\`\`
            Generate an image prompt for the following:
            ${this.prompt}
          `,
        },
      ];
      // console.log('generate image 1', {
      //   messages,
      // });
      const newMessage = await context.subtleAi.complete(messages);
      const imagePrompt = newMessage.content;

      // console.log('generate image 2', {
      //   imagePrompt,
      // });
      const imageRes = await generateImage(imagePrompt, context);
      const json = await imageRes.json();
      // console.log('generate image 3', {
      //   json: JSON.stringify(json, null, 2),
      // });
      const url = json.data[0].url;
      console.log('generate image 4', {
        url,
      });
      const proxyRes = await fetch(url);
      if (proxyRes.ok) {
        return new Response(proxyRes.body, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
          },
        });
      } else {
        return new Response(proxyRes.body, {
          status: proxyRes.status,
        });
      } */
    },
  },
);
// export const generativeFetchHandler = generativeFetchHandlerHook.getHookFn();
export const generativeHtmlFetchHandler =
  generativeHtmlFetchHandlerHook.getHookFn();
export const generativeJsonFetchHandler =
  generativeJsonFetchHandlerHook.getHookFn();
export const generativeImageFetchHandler =
  generativeImageFetchHandlerHook.getHookFn();
export const generativeFarcasterFrameFetchHandler =
  generativeFarcasterFrameFetchHandlerHook.getHookFn();

// XXX support serving the public directory
// XXX support rendering custom react UIs
// XXX support API perception endpoints
export const StaticServer = () => {
  return (
    <Server>
      {() => {
        return {
          async fetch(request: Request, env: object) {
            const u = new URL(request.url);
            const { pathname } = u;
            // XXX finish this to serve the agent's public directory
            if (pathname === '/agent.npc') {
              const s = (env as any).AGENT_JSON as string;
              console.log('returning agent json', { s, env });
              return new Response(s);
            } else {
              return null;
            }
          },
        };
      }}
    </Server>
  );
};
export const GenerativeServer = ({
  children,
}: {
  children: React.ReactNode | (() => void);
}) => {
  const appContextValue = useContext(AppContext);

  const childFn = children as () => void;
  if (typeof childFn === 'function') {
    // XXX this should be cleared at the beginning of the render pass, not each time GenerativeServer is declared
    clearCachedGenerativeHandlers();
    childFn();
  } else {
    console.warn(
      'GenerativeServer children must be a function: ' + typeof childFn,
    );
    return null;
  }
  const handlers = getCachedGenerativeHandlers();

  return (
    <Server>
      {() => {
        return {
          async fetch(request: Request, env: object) {
            const handler = handlers.find((handler) =>
              handler.matches(request),
            );
            if (handler) {
              return await handler.handle(request, appContextValue);
            } else {
              return null;
            }
          },
        };
      }}
    </Server>
  );
};

export type WebBrowserProps = {
  hint: string,
  maxSteps: number,
  navigationTimeout: number,
};
export const WebBrowser: React.FC<WebBrowserProps> = (props: WebBrowserProps) => {
  const agent = useAgent();
  const authToken = useAuthToken();
  const hint = props.hint ?? '';
  return (
    <Action
      name="webBrowser"
      description={`Browse the web and return some result. Specify the url to navigate to, the data type of result we are looking for, and the action to perform on the page to get the result.${hint ? ` ${hint}` : ''}`}
      schema={
        z.object({
          url: z.string(),
          resultType: z.enum([
            'text',
            'image',
            'data',
          ]),
          action: z.string(),
        })
      }
      examples={[
        {
          url: `https://imgur.com/`,
          action: 'Return the most interesting image',
          resultType: 'image',
        },
      ]}
      handler={async (e: PendingActionEvent) => {
        const { message } = e.data;
        const { args } = message;
        const { url, action, resultType } = args;

        const browserWSEndpoint = await (async () => {
          const res = await fetch(`https://ai.upstreet.ai/api/browserBase/connectUrl`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          const j = await res.json();
          const { url } = j;
          return url;
        })();
        let browser = null;
        let page = null;
        try {
          browser = await puppeteer.connect({
            browserWSEndpoint,
          });
          const pages = await browser.pages();
          page = pages[0];
          await page.goto(url);

          const [
            extractedHtml,
            extractedText,
          ] = await Promise.all([
            page.$eval('*', (el: any) => el.outerHtml),
            page.$eval('*', (el: any) => {
              const selection = window.getSelection();
              const range = document.createRange();
              range.selectNode(el);
              selection.removeAllRanges();
              selection.addRange(range);
              return window.getSelection().toString();
            }),
          ]);

          const response = await agent.generate(dedent`
          `, {
            // XXX zod schema
          });
          // XXX finish this
        } finally {
          page && page.close();
          browser && browser.close();
        }
      }}
    />
  )
};

export type RateLimitProps = {
  maxUserMessages: number;
  maxUserMessagesTime: number;
  message: string;
};
type UserMessageTimestamp = {
  timestamp: number;
};
export const RateLimit: React.FC<RateLimitProps> = (props: RateLimitProps) => {
  const maxUserMessages = props?.maxUserMessages ?? 5;
  const maxUserMessagesTime = props?.maxUserMessagesTime ?? 60 * 60 * 24 * 1000; // 1 day
  const rateLimitMessage = props?.message || 'You are sending messages too quickly. Please wait a moment before sending another message.';

  const rateLimitMessageSent = useRef(false);
  const kv = useKv();

  return (
    <PerceptionModifier
      type="say"
      handler={async (e: AbortablePerceptionEvent) => {
        const rateLimitingEnabled =
          maxUserMessages !== 0 &&
          isFinite(maxUserMessages) &&
          maxUserMessagesTime !== 0 &&
          isFinite(maxUserMessagesTime);
        const isOwner = e.data.sourceAgent.id === e.data.targetAgent.agent.ownerId;
        if (rateLimitingEnabled && !isOwner) {
          // if rate limiting is enabled
          const { /*message, */sourceAgent, targetAgent } = e.data;
          // fetch old timestamps
          const key = `userMessageTimestamps.${sourceAgent.id}`;
          let userMessageTimestamps = await kv.get<UserMessageTimestamp[]>(key) ?? [];
          // filter out old timestamps
          const now = Date.now();
          userMessageTimestamps = userMessageTimestamps.filter((t) => now - t.timestamp < maxUserMessagesTime);
          if (userMessageTimestamps.length < maxUserMessages) {
            // if we have room for more timestamps
            // add new timestamp
            userMessageTimestamps.push({
              timestamp: now,
            });
            // save state
            (async () => {
              await kv.set(key, userMessageTimestamps);
            })().catch((err) => {
              console.warn('failed to set user message timestamps', err);
            });
            // flag the success
            rateLimitMessageSent.current = false;
            // continue normal handling
          } else {
            // else if we have hit the rate limit
            // abort the perception event
            e.abort();

            // once per limit, send a message to the user
            if (!rateLimitMessageSent.current) {
              rateLimitMessageSent.current = true;

              // send rate limit blocker message
              (async () => {
                await targetAgent.say(rateLimitMessage);
              })().catch((err) => {
                console.warn('failed to send rate limit message', err);
              });
            }
          }
        }
      }}
      priority={-defaultPriorityOffset}
    />
  );
};

export type TTSProps = {
  voiceEndpoint?: string; // voice to use
};
export const TTS: React.FC<TTSProps> = (props: TTSProps) => {
  const voiceEndpoint = props?.voiceEndpoint;

  const tts = useTts({
    voiceEndpoint,
  });

  return (
    <ActionModifier
      name="say"
      handler={async (e: AbortableActionEvent) => {
        const { message, agent } = e.data;
        const args = message.args as any;
        const text = (args as any).text as string;

        const readableAudioStream = tts.getVoiceStream(text);
        const { type } = readableAudioStream;
        const playableAudioStream = readableAudioStream as PlayableAudioStream;
        playableAudioStream.id = crypto.randomUUID();
        agent.addAudioStream(playableAudioStream);

        if (!message.attachments) {
          message.attachments = [];
        }
        message.attachments.push({
          id: playableAudioStream.id,
          type,
        });
      }}
    />
  );
};
