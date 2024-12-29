import React from 'react';
import { Action, useEnv } from 'react-agents';
import { z } from 'zod';
import { ThreeDGenerationPlugin } from '@elizaos/plugin-3d-generation';
import { solanaPlugin } from '@elizaos/plugin-solana';
import util from 'util';


function generateZodSchema(obj: any): z.ZodTypeAny {
  if (typeof obj === "string") return z.string();
  if (typeof obj === "number") return z.number();
  if (typeof obj === "boolean") return z.boolean();
  if (Array.isArray(obj)) {
    return z.array(generateZodSchema(obj[0] || z.any()));
  }
  if (typeof obj === "object" && obj !== null) {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const key in obj) {
      shape[key] = generateZodSchema(obj[key]);
    }
    return z.object(shape);
  }
  return z.any();
}

//

type IAgentRuntime = {};
type State = {};
type Options = {};
type Memory = {
  user: string;
  content: any;
};

type IActionHandlerAttachment = {
  id: string;
  url: string;
  // title: "Generated 3D",
  // source: "ThreeDGeneration",
  // description: ThreeDPrompt,
  // text: ThreeDPrompt,
};
type IActionHandlerCallbackArgs = {
  text: string;
  error?: boolean;
  attachments?: IActionHandlerAttachment[],
};
type HandlerFn = (
  runtime: IAgentRuntime,
  message: Memory,
  state: State,
  options: Options,
  callback: (result: IActionHandlerCallbackArgs) => void,
) => void;
type ValidateFn = (
  runtime: IAgentRuntime,
  message: Memory,
) => Promise<boolean>;
type IAction = {
  name: string;
  // similies?: string[];
  description: string;
  examples: Memory[][];
  validate: ValidateFn,
  handler: HandlerFn;
};

type IEvaluator = {
  name: string;
    // similes?: string[],
    alwaysRun?: boolean,
    validate: ValidateFn,
    description: string,
    handler: HandlerFn,
    examples: {
      context: string;
      message: Memory[];
    }[],
};

type IProvider = {
  get: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ) => Promise<string | null>;
};

type IPlugin = {
  actions: IAction[];
  evaluators: IEvaluator[];
  providers: IProvider[];
};

//

const pluginWrap = (plugin: IPlugin) => (props: any) => {
  console.log('render plugin', util.inspect(plugin, {
    depth: 7,
  }));
  const env = useEnv();
  return (
    <>
      {(plugin.actions ?? []).map((action: any) => {
        const examples = action.examples.map(exampleMessages => {
          const agentMessages = exampleMessages.filter(message => {
            return /agentName/.test(message.user);
          });
          if (agentMessages.length > 0) {
            const agentMessage = agentMessages[0];
            const {
              action,
              ...args
            } = agentMessage.content;
            return args;
          } else {
            return null;
          }
        }).filter(Boolean);
        console.log('got examples', examples);
        if (examples.length > 0) {
          const schema = generateZodSchema(examples[0]);
          // console.log('got schema', schema);
          return (
            <Action
              type={action.name}
              description={action.description}
              schema={schema}
              examples={examples}
              handler={async e => {
                const { args } = e.data.message; 
                console.log('got handler', args);

                await new Promise((resolve, reject) => {
                  const runtime = {
                    getSetting(key: string) {
                      return env[key];
                    },
                  };
                  const message = {
                    content: args,
                  }
                  const state = {};
                  const options = {};
                  const callback = (result: IActionHandlerCallbackArgs) => {
                    console.log('got callback result', result);
                    const {
                      text,
                      error,
                      attachments,
                    } = result;
                    resolve(null);
                  };
                  console.log('call action handler', action.handler);
                  action.handler(runtime, message, state, options, callback);
                });
              }}
              key={action.name}
            />
          );
        } else {
          return null;
        }
      }).filter(Boolean)}
    </>
  );
};

export const plugins = {
  '@elizaos/plugin-3d-generation': pluginWrap(ThreeDGenerationPlugin),
  '@elizaos/plugin-solana': pluginWrap(solanaPlugin),
};