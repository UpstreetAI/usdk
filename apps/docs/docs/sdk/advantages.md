---
sidebar_position: 4
slug: /sdk/advantages
description: "React shines in its role as a renderer!"
sidebar_label: Advantages
---

# Advantages

## Prompt-native

React shines in its role as a renderer -- it's equally good at rendering prompt strings as it is at rendering the DOM:

```tsx
import bio from 'bio.txt' with { type: 'text' };
const Personality = ({bio}: {bio: string}) => (
  <Prompt>This assistant has the following persona: {bio}</Prompt>
)
const MyAgent = () => (
  <Agent>
    <Personality>{bio}</Personality>
    <Prompt>This assistant is developed by MultiCorital Example Technologies. Refer the user to the help pages on https://multicortical.example.com/</Prompt>
  </Agent>
);
export default MyAgent;
```

This will result in the following prompt snippet:

```text
This assistant has the following persona: She is a cool and cheerful person.
This assistant is developed by MultiCorital Example Technologies. Refer the user to the help pages on https://multicortical.example.com/<
```

React is component-oriented, so parts of the prompt can be independently developed and composed as elements such as the `<Personality>` component above. Additionally, using React give access to the web and NPM ecosystems, which means that we have access to many solutions for problems like asynchronous programming, state management, and many integration libraries readily available.

## Well-typed

Using TypeScript allows for a significant of the agent's behavior to be type-checked, helping us catch many errors at development time. This is especially important for building robust dynamic systems like agents.

Further, a strong type system allows us to interface with the underlying LLM to generate well-typed data at the framework level using libraries like `zod`.

Here is an example that uses 

```tsx
import { z } from `zod`;
import dedent from 'dedent';
import { useSubtleAi } from 'react-agents';
const CharacterImageGenerator = ({ style }) => (
  <JsonAction
    method="generate_image"
    description="Generate a character description for an image generator"
    args={{
      characterDescription: 'A visual description of the base character',
      clothingDescription: 'A visual description of the clothes the character is wearing',
      backgroundDescription: 'A visual description of the background the character appears on. Can be null.',
    }}
    schema={
      z.object({
        characterDescription: z.string(),
        clothingDescription: z.string(),
        backgroundDescription: z.union([z.string(), z.null()]),
      }),
    }
    handler={(e) => {
      const { agent, message } = e.data;
      const { method, args } = message;
      const { characterDescription, clothingDescription, backgroundDescription } = args;
      const imageResult = await subtleAi.imageGeneration.generate(dedent`
        ${style} style.
        A character that looks like ${characterDescription}.
        Character is wearing ${clothingDescription}.
        The background is ${backgroundDescription}.
      `);
      await agent.commit({
        method,
        args: {
          ...args,
          image: imageResult,
        },
      });
    }}
  />
);
const MyAgent = () => {
  const subtleAi = useSubtleAi();
  return (
    <Agent>
      <CharacterImageGenerator style="anime" />
    </Agent>
  );
};
export default MyAgent;
```

## Isolated

TypeScript is built from the ground up to run in stable, efficient, and secure isolates.

React Agents only have access their own code and state, and are completely abstracted from the platform. This allows them to run both locally on your machine, and serverlessly in the cloud with no change. Additionally, because React Agents are event-loop aware, they sleep and wake dynamically depending on whether there is work to do, allowing us to save on infrastructure costs and be relatively liberal with the amount of agents we deploy.

We based our implementation on top of `wrangler`, `miniflare`, CloudFlare Workers, and Durable Objects. Thanks to the folks at CloudFlare for making such an extensible open source framework, and fielding our support requests!

## Robust tooling

React and TypeScript have a decade of tooling infrastructure development behind them. There are IDE integrations, type checkers, compilers, documentation tools, hot code reloaders, facilities for CI, testing, and more that you get for free!

We're looking to bring more of this tooling into React Agents.