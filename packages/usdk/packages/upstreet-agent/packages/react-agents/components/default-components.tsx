import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import dedent from 'dedent';
// import { ZodTypeAny, ZodUnion, z } from 'zod';
// import { printNode, zodToTs } from 'zod-to-ts';
// import type { Browser, BrowserContext, Page } from 'playwright-core-lite';
// import { minimatch } from 'minimatch';
import { timeAgo } from 'react-agents/util/time-ago.mjs';

import type {
  AppContextValue,
  // AgentProps,
  ActionProps,
  ActionPropsAux,
  UniformPropsAux,
  // PromptProps,
  // ParserProps,
  // PerceptionProps,
  // SchedulerProps,
  // ServerProps,
  SceneObject,
  AgentObject,
  ActiveAgentObject,
  ConversationObject,
  PendingActionEvent,
  ActionEvent,
  ActionMessage,
  PlayableAudioStream,
  Attachment,
  FormattedAttachment,
  GenerativeAgentObject,
  DiscordRoomSpec,
  DiscordRoomSpecs,
  DiscordProps,
  DiscordArgs,
  TwitterProps,
  TwitterArgs,
  TwitterSpacesProps,
  TwitterSpacesArgs,
  TelnyxProps,
  TelnyxBotArgs,
  TelnyxBot,
  VideoPerceptionProps,
  Evaluator,
  LoopProps,
  ActOpts,
} from '../types';
// import {
//   AppContext,
// } from '../context';
// import {
//   PerceptionModifier,
//   Server,
// } from './base-components';
// import {
//   AbortableActionEvent,
// } from '../classes/abortable-action-event';
// import {
//   AbortablePerceptionEvent,
// } from '../classes/abortable-perception-event';
import {
  useAgent,
  useAuthToken,
  useActions,
  useUniforms,
  useName,
  usePersonality,
  useStoreItems,
  usePurchases,
  useKv,
  useTts,
  useConversation,
  useCachedMessages,
  useNumMessages,
} from '../hooks';
// import { shuffle, parseCodeBlock } from '../util/util.mjs';
// import {
//   storeItemType,
// } from '../util/agent-features.mjs';
// import {
//   currencies,
//   intervals,
// } from '../constants.mjs';
// import {
//   // describe,
//   describeJson,
// } from '../util/vision.mjs';
// import {
//   imageSizes,
//   fetchImageGeneration,
// } from '../util/generate-image.mjs';
// import {
//   generateSound,
// } from '../util/generate-sound.mjs';
// import {
//   generateModel,
// } from '../util/generate-model.mjs';
// import {
//   generateVideo,
// } from '../util/generate-video.mjs';
import { Prompt } from './prompt';
// import { r2EndpointUrl } from '../util/endpoints.mjs';
import { ChatLoop } from '../loops/chat-loop.tsx';
// import { webbrowserActionsToText } from '../util/browser-action-utils.mjs';
// import { createBrowser/*, testBrowser*/ } from '../util/create-browser.mjs';
import {
  formatActionsPrompt,
} from '../util/format-schema';

// defaults

/**
 * Renders the default agent components.
 * @returns The JSX elements representing the default agent components.
 */
export const DefaultAgentComponents = () => {
  return (
    <>
      <DefaultActions />
      <DefaultPrompts />
      <ChatLoop />
      {/* <InfiniteLoop /> */}
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
      {/* <SocialMediaActions />
      <StoreActions /> */}
    </>
  );
};

/**
 * Renders the default prompts components.
 * @returns The JSX elements representing the default prompts components.
 */
export const DefaultPrompts = () => {
  return (
    <>
      <DefaultHeaderPrompt />
      <ConversationEnvironmentPrompt />
      <ActionsPrompt />
      <StorePrompt />
      <ConversationMessagesPrompt />
      <InstructionsPrompt />
      <DefaultCommunicationGuidelinesPrompt />
    </>
  );
};
export const DefaultHeaderPrompt = () => {
  return (
    <Prompt>
      {dedent`
        Role-play as a character in a chat given the current state.
        Respond with a JSON object specifying the action method and arguments.
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

  const formatAgent = (agent: any) => {
    return [
      `Name: ${agent.name}`,
      `UserId: ${agent.id}`,
      `Bio: ${agent.bio}`,
    ].join('\n');
  };

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
const ActionsPromptInternal = () => {
  const actions = useActions();
  const uniforms = useUniforms();
  const conversation = useConversation();

  let s = '';
  if (actions.length > 0) {
    s = dedent`\
      # Response format
    ` +
    '\n\n' +
    formatActionsPrompt(Array.from(actions.values()), uniforms, conversation);
  }
  return (
    <Prompt>{s}</Prompt>
  );
};
export const ActionsPrompt = () => {
  return (
    <Conversation>
      <ActionsPromptInternal />
    </Conversation>
  );
};
const StoreItemsPrompt = () => {
  const agent = useAgent();
  const storeItems = useStoreItems();
  return !!agent.stripeConnectAccountId && storeItems.length > 0 && (
    <Prompt>
      {dedent`\
        # Store
        Here are the store items available for purchase.
        Amount in cents (e.g. 100 = $1).
        \`\`\`
      ` + '\n' +
      JSON.stringify(storeItems, null, 2) + '\n' +
      dedent`\
        \`\`\`
      `}
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

  const formatAttachments = (attachments?: Attachment[]) => {
    if (attachments?.length > 0) {
      return attachments.map((attachment) => formatAttachment(attachment));
    } else {
      return undefined;
    }
  };
  const formatAttachment = (attachment: Attachment): FormattedAttachment => {
    const {
      id,
      type,
      // alt,
    } = attachment;
    return {
      id,
      type,
      // alt,
    };
  };

  return (
    <Prompt>
      {dedent`
        # Message history
        ${
          cachedMessages.length > 0
            ? dedent`
              Here is the chat so far:
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

        Before choosing an action, decide if you should respond at all:
        - Return null (no action) if:
          * Message is clearly meant for others (unless you have crucial information)
          * Your input wouldn't add value to the conversation
          * The conversation is naturally concluding
          * You've already responded frequently in the last few messages (2-3 messages max)
          * Multiple other agents are already actively participating
      `}
    </Prompt>
  );
};
export const DefaultCommunicationGuidelinesPrompt = () => {
  return (
    <Prompt>
      {dedent`
        Prioritize responding when:
          - You're directly mentioned or addressed
          - It's a group discussion where you can contribute meaningfully
          - Your personality traits are relevant to the topic

        Communication guidelines:
          - Avoid using names in every message - only use them when:
            * Directly responding to someone for the first time
            * Clarifying who you're addressing in a group
            * There's potential confusion about who you're talking to
          - If you've been very active in the last few messages, wrap up your participation naturally
            * Use phrases like "I'll let you all discuss" or simply stop responding
            * Don't feel obligated to respond to every message
          - Keep responses concise and natural
          - Let conversations breathe - not every message needs a response
          - If multiple agents are responding to the same person, step back and let others take the lead
      `}
    </Prompt>
  );
};

// server

/**
 * Renders the default server components.
 * @returns The JSX elements representing the default server components.
 */
// export const DefaultServers = () => {
//   return <StaticServer />;
// };

// const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// const printRequest = (request: Request) => {
//   const { method, url } = request;
//   return `${method} ${url}`;
// };
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
/* const generateHtml = async (prompt: string, context: AppContextValue) => {
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
}; */
/* const generateJson = async (prompt: string, context: AppContextValue) => {
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
  const responseString = newMessage.content as string;
  return new Response(responseString, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}; */
/* const generateImage = async (prompt: string, context: AppContextValue) => {
  const arrayBuffer = await context.subtleAi.generateImage(prompt);
  return new Response(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
    },
  });
}; */
/* type Route = string | RegExp | null;
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
}); */
/* const generativeFarcasterFrameFetchHandlerHook = new GenerativeFetchHandlerHook(
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
    },
  },
); */
// export const generativeHtmlFetchHandler =
//   generativeHtmlFetchHandlerHook.getHookFn();
// export const generativeJsonFetchHandler =
//   generativeJsonFetchHandlerHook.getHookFn();
// export const generativeImageFetchHandler =
//   generativeImageFetchHandlerHook.getHookFn();
// export const generativeFarcasterFrameFetchHandler =
//   generativeFarcasterFrameFetchHandlerHook.getHookFn();

// XXX support serving the public directory
// XXX support rendering custom react UIs
// XXX support API perception endpoints
/* export const StaticServer = () => {
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
}; */