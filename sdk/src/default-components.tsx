import React from 'react';
import { useState, useEffect, useMemo, useContext } from 'react';
import dedent from 'dedent';
import { z } from 'zod';
import { minimatch } from 'minimatch';
import jsAgo from 'js-ago';
import puppeteer from '@cloudflare/puppeteer';
import type { ZodTypeAny } from 'zod';
import { zodToTs, printNode } from 'zod-to-ts';
import type {
  AppContextValue,
  ConfigurationContextValue,
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
  ActionMessage,
  SdkDefaultComponentArgs,
} from './types';
import {
  AppContext,
  ConfigurationContext,
} from './context';
import {
  Agent,
  Action,
  Prompt,
  Formatter,
  Parser,
  Perception,
  Task,
  TaskResult,
  // Scheduler,
  Server,
} from './components';
import { useCurrentAgent, useAuthToken, useAgents, useScene, useActions, useFormatters, useActionHistory, useTts, useChat } from './hooks';
// import type { AppContextValue } from './types';
import { parseCodeBlock } from './util/util.mjs';

// Note: this comment is used to remove imports before running tsdoc
// END IMPORTS

// utils

const timeAgo = (timestamp: Date) =>
  jsAgo(+timestamp / 1000, { format: 'short' });
const shuffle = (array: Array<any>) => array.sort(() => Math.random() - 0.5);
const printZodNode = (z: any) => {
  let s = printNode(z);
  s = s.replace(/    /g, '  ');
  return s;
};

// defaults

/**
 * Renders the default agent components.
 * @returns The JSX elements representing the default agent components.
 */
export const DefaultAgentComponents = () => {
  return (
    <>
      <DefaultFormatters />
      <DefaultParsers />
      <DefaultActions />
      <DefaultPrompts />
      <DefaultPerceptions />
      <DefaultTasks />
      <DefaultServers />
    </>
  );
};

// action modifiers

type ActionHandlerModifier = {
  // preload: (e: MessageEvent) => void;
  // lock: <T>(fn: () => Promise<T>) => T;
  handle: (e: MessageEvent) => Promise<any>;
};
const actionHandlerModifiersKey = 'actionHandlerModifiers';
const getActionModifiers = (configuration: ConfigurationContextValue, method: string) => {
  const actionHandlerModifiers = configuration.get(actionHandlerModifiersKey);
  if (actionHandlerModifiers) {
    const methodActionHandlerModifiers = actionHandlerModifiers.get(method);
    if (methodActionHandlerModifiers) {
      return Array.from(methodActionHandlerModifiers.values());
    }
  }
  return [];
};
const addActionModifier = (configuration: ConfigurationContextValue, method: string, modifier: ActionHandlerModifier) => {
  let actionHandlerModifiers = configuration.get(actionHandlerModifiersKey) ?? new Map();
  let methodActionHandlerModifiers = actionHandlerModifiers.get(method);
  if (!methodActionHandlerModifiers) {
    methodActionHandlerModifiers = new Set();
    actionHandlerModifiers.set(method, methodActionHandlerModifiers);
  }

  methodActionHandlerModifiers.add(modifier);

  configuration.set(actionHandlerModifiersKey, actionHandlerModifiers);
};
const removeActionModifier = (configuration: ConfigurationContextValue, method: string, modifier: ActionHandlerModifier) => {
  const key = 'actionHandlerModifiers';
  const actionHandlerModifiers = configuration.get(actionHandlerModifiersKey);
  if (actionHandlerModifiers) {
    const methodActionHandlerModifiers = actionHandlerModifiers.get(method);
    if (methodActionHandlerModifiers) {
      methodActionHandlerModifiers.delete(modifier);
    }
  }
};

// actions

/**
 * Renders the default actions components.
 * @returns The JSX elements representing the default actions components.
 */
export const DefaultActions = () => {
  const configuration = useContext(ConfigurationContext);
  return (
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
      handler={async (e: PendingActionEvent) => {
        const modifiers = getActionModifiers(configuration, 'say') as Array<ActionHandlerModifier>;
        await Promise.all(modifiers.map((modifier) => modifier.handle(e)));

        await e.commit();
      }}
    />
  );
};

/**
 * Renders a JSON action component for sending ETH to a specified user ID.
 * @returns The JSX element representing the JSON action component.
 */
/* export const JsonAction = ({
  name,
  description,
  schema,
  examples,
  handler,
}: {
  name: string;
  description?: string;
  schema?: z.ZodType<object>,
  examples?: Array<object>;
  handler: (e: PendingActionEvent) => void | Promise<void>;
}) => {
  const agents = useAgents();
  const randomAgent = shuffle(agents.slice())[0];
  const examplesJsonString = examples.map((args) => JSON.stringify(
    {
      userId: randomAgent.id,
      name: randomAgent.name, // helps with dialogue inference
      method: name,
      args,
    }
  )).join('\n');
  return (
    <Action
      name={name}
      description={
        dedent`
          * ${name}
        ` +
        '\n' +
        description +
        '\n' +
        printZodNode(zodToTs(schema).node) +
        '\n' +
        dedent`
          e.g.
          \`\`\`
        ` +
        '\n' +
        examplesJsonString +
        '\n' +
        dedent`
          \`\`\`
        `
      }
      handler={handler}
    />
  );
}; */

// prompts

/**
 * Renders the default prompts components.
 * @returns The JSX elements representing the default prompts components.
 */
export const DefaultPrompts = () => {
  const scene = useScene();
  const agents = useAgents();
  const currentAgent = useCurrentAgent();
  const actions = useActions();
  const formatters = useFormatters();
  return (
    <>
      <DefaultHeaderPrompt />
      <ScenePrompt scene={scene} />
      <CharactersPrompt agents={agents} />
      <RAGMemoriesPrompt agents={[currentAgent]} />
      <ActionsFormatPrompt actions={actions} formatters={formatters} />
      <RecentChatHistoryJsonPrompt />
      <InstructionsJsonPrompt agent={currentAgent} />
    </>
  );
};
export const DefaultHeaderPrompt = () => {
  return (
    <Prompt>
      {dedent`
        Generate dialogue and character actions for a video game. I will give you a description of the scene, characters, and actions that can be taken. You will need to respond with a JSON object that contains the method and arguments for the action the next character should take (such as saying something).
      `}
    </Prompt>
  );
};
export const ScenePrompt = ({ scene }: { scene: SceneObject }) => {
  return (
    <Prompt>
      {dedent`
        # Scene
        Here is a description of the scene where the action is taking place:

        ${scene.description}
      `}
    </Prompt>
  );
};
export const CharactersPrompt = ({
  agents,
}: {
  agents: Array<AgentObject>;
}) => {
  return (
    <Prompt>
      {dedent`
        # Characters
      ` +
        '\n' +
        agents
          .map((agent) => {
            return dedent`
              Name: ${agent.name}
              UserId: ${agent.id}
              Bio: ${agent.bio}
            `;
          })
          .join('\n\n')}
    </Prompt>
  );
};
export const RAGMemoriesPrompt = ({
  agents,
}: {
  agents: Array<AgentObject>;
}) => {
  // XXX make this asynchroneous
  return null;
  // return (
  //   <Prompt>
  //     {/* {dedent`
  //       ## Memories
  //       ${agents.map((agent) => {
  //         return dedent`
  //           ### ${agent.name}
  //           ${agent.memory.text}
  //         `;
  //       })}
  //     `} */}
  //   </Prompt>
  // );
};
export const ActionsFormatPrompt = ({
  actions,
  formatters,
}: {
  actions: Array<ActionProps>;
  formatters: Array<FormatterProps>;
}) => {
  let s = '';
  if (actions.length > 0 && formatters.length > 0) {
    const formatter = formatters[0];
    s = dedent`
      # Actions
      Here are the allowed actions that characters can take:
    ` +
    '\n\n' +
    actions.map((action) => formatter.formatFn(action)).join('\n\n');
  }
  return (
    <Prompt>{s}</Prompt>
  );
};
export const RecentChatHistoryJsonPrompt = () => {
  // const appContextValue = useContext(AppContext);

  // const [historyActions, setHistoryActions] = useState([]);
  // const perAgentHistoryActions = await Promise.all(
  //   agents.map((agent) => agent.getActionHistory()),
  // );
  const historyActions = useActionHistory()
    // .flat()
    .sort((a, b) => +a.timestamp - +b.timestamp);

  // // console.log('render prompt', historyActions);
  // useEffect(() => {
  //   appContextValue.useLoad(
  //     (async () => {
  //       // console.log('start action history');
  //       const perAgentHistoryActions = await Promise.all(
  //         agents.map((agent) => agent.getActionHistory()),
  //       );
  //       /* console.log(
  //         'get action history',
  //         {
  //           perAgentHistoryActions: JSON.stringify(perAgentHistoryActions, null, 2),
  //           now: Date.now(),
  //         },
  //       ); */
  //       const newHistoryActions = perAgentHistoryActions
  //         .flat()
  //         .sort((a, b) => a.timestamp - b.timestamp);
  //       // console.log('new action history', newHistoryActions);
  //       setHistoryActions(newHistoryActions);
  //     })(),
  //   );
  // }, [agents, appContextValue]);

  return (
    <Prompt>
      {dedent`
        # Message history
        ${
          historyActions.length > 0
            ? dedent`
              Here is the chat so far, in JSON format:
            ` +
              '\n' +
              '```' +
              '\n' +
              historyActions
                .map((action) => {
                  const { userId, name, method, args, timestamp } = action;
                  const j = {
                    userId,
                    name,
                    method,
                    args,
                  };
                  return JSON.stringify(j) + ' ' + timeAgo(timestamp);
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
export const InstructionsJsonPrompt = ({
  agent,
}: {
  agent: AgentObject;
}) => {
  return (
    <Prompt>
      {dedent`
        # Instructions
        Continue the conversation.
        Method/args must be one of the allowed action formats.
        The next character to act is ${agent.name} (${JSON.stringify(agent.id)}).
      `}
    </Prompt>
  );
};

export const Personality = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const currentAgent = useCurrentAgent();
  return (
    <Prompt>
      {dedent`
        # Additional note
        ${currentAgent.id} (${currentAgent.name}) has the following personality:
      ` + children}
    </Prompt>
  );
};

// parsers

/**
 * Renders the default parsers components.
 * @returns The JSX elements representing the default parsers components.
 */
export const DefaultParsers = () => {
  return <JsonParser />;
};
export const JsonParser = () => {
  return (
    <Parser
      parseFn={(content: string) => {
        let resultJson = null;
        let error = null;
        try {
          const codeString = parseCodeBlock(content);
          resultJson = JSON.parse(codeString);
        } catch (e) {
          error = e;
        }
        if (!error) {
          const schema = makeJsonSchema();
          try {
            const parsedResultJson = schema.parse(resultJson);
          } catch (err) {
            throw new Error('zod schema parse error: ' + JSON.stringify(resultJson) + '\n' + JSON.stringify(err.issues));
          }
          // if (
          //   typeof resultJson.method === 'string' &&
          //   typeof resultJson.args === 'object' &&
          //   resultJson.args !== null
          // ) {
          return resultJson as ActionMessage;
          // } else {
          //   throw new Error(
          //     'LLM output invalid JSON: ' + JSON.stringify(resultJson, null, 2),
          //   );
          // }
        } else {
          throw new Error(
            'failed to parse LLM output: ' +
              JSON.stringify({
                content,
                error,
              }),
          );
        }
      }}
    />
  );
};

// formatters
export const DefaultFormatters = () => {
  return <JsonFormatter />;
};
const makeJsonSchema = (args: z.ZodType<object> = z.object({})) => {
  return z.object({
    // userId: z.string(),
    // name: z.string(),
    method: z.string(),
    args,
  });
};
export const JsonFormatter = () => {
  return (
    <Formatter
      formatFn={(action: ActionProps) => {
        const {
          name,
          description,
          schema: argsSchema,
          examples,
        } = action;

        const schema = argsSchema && makeJsonSchema(argsSchema);

        // const agents = useAgents();
        const examplesJsonString = (examples ?? []).map((args) => {
          // const randomAgent = shuffle(agents.slice())[0];
          return JSON.stringify(
            {
              // userId: randomAgent.id,
              // name: randomAgent.name, // helps with dialogue inference
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
        (schema ? (
          dedent`
            Schema:
            \`\`\`
          ` +
          '\n' +
          printZodNode(zodToTs(schema).node) +
          '\n' +
          dedent`
            \`\`\`
          ` +
          '\n'
        ) : '') +
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
  const agent = useCurrentAgent();

  return (
    <>
      <Perception
        type="nudge"
        handler={async (e) => {
          const targetPlayerId = (e.data.message.args as any).targetPlayerId as string;
          if (targetPlayerId === agent.id) {
            await e.data.agent.think();
          }
        }}
      />
      <Perception
        type="say"
        handler={async (e) => {
          const { agent } = e.data;
          await agent.think();
        }}
      />
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
  const agent = useCurrentAgent();
  // const agents = useAgents();
  const lastActions = useActionHistory({
    filter: {
      limit: 1,
    },
  });
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
              const s = env.AGENT_JSON;
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
  const agent = useCurrentAgent();
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
export type TTSProps = {
  voiceEndpoint?: string; // voice to use
};
export const TTS: React.FC<TTSProps> = (props: TTSProps) => {
  const voiceEndpoint = props?.voiceEndpoint;
  const configuration = useContext(ConfigurationContext);

  const tts = useTts({
    voiceEndpoint,
  });
  const chat = useChat();

  useEffect(() => {
    const actionHandlerModifier = (() => {
      return {
        handle: async (e) => {
          const { message } = e.data;
          const { args } = message;
          const text = (args as any).text as string;
          const readableAudioStream = tts.getAudioStream(text);
          const { id: audioStreamId } = chat.playAudioStream(readableAudioStream);
          if (args.media) {
            args.media = [];
          }
          args.media.push({
            type: 'audio/mp3',
            ref: audioStreamId,
          });
        },
      };
    })();
    addActionModifier(configuration, 'say', actionHandlerModifier);

    return () => {
      removeActionModifier(configuration, 'say', actionHandlerModifier);
    };
  }, [
    tts,
    chat,
  ]);

  return null;

  /* // XXX move this to useTts
  {
    // XXX get the sampleRate for decode
    const sampleRate = 48000;
    const stream = tts.getStream(text, {
      ...opts,
      // sampleRate: this.audioManager.audioContext.sampleRate,
      sampleRate,
    });
    const readableStream = stream.readable;
    const audioSource = createOpusReadableStreamSource({
      readableStream,
      // audioContext,
    });
    chat.addAudioSource(audioSource);

    audioSource.output.addEventListener('end', e => {
      chat.removeAudioSource(audioSource);
    });

    // frontend
    const ensureAudioStream = (playerId, streamId) => {
      const key = `${playerId}:${streamId}`;
      let audioStream = this.outputAudioStreams.get(key);
      if (!audioStream) {
        const {
          audioContext,
        } = this.audioManager;
        const stream = createOpusAudioOutputStream({
          audioContext,
        });
        
        const audioManagerInput = this.audioManager.getInput();
        stream.outputNode.connect(audioManagerInput);
        console.log('connect node', stream.outputNode);

        audioStreams.set(key, stream);
        audioStream = stream;

        // connect to avatar
        (async () => {
          const remotePlayer = this.playersMap.get(playerId);
          if (remotePlayer) {
            await remotePlayer.waitForAvatar();
            // handle the race condition where the audio stream ends before the avatar is loaded
            if (!audioStreams.has(key)) return;

            remotePlayer.avatar.setAudioEnabled({
              audioContext: this.audioManager.audioContext,
            });
            const audioInput = remotePlayer.avatar.getAudioInput();
            stream.outputNode.connect(audioInput);
          } else {
            console.warn('remote player not found', {
              playerId,
              playersMap: this.playersMap,
            });
            debugger;
          }
        })();
      }
      return audioStream;
    };
  } */
};
