---
sidebar_position: 2
slug: /sdk/components/action
description: "Every time an agent `.think()`s, it will generate and run one of the `<Action>`s it has declared."
sidebar_label: <Action />
---

# Acting with `<Action>`s

Agents communicate with the outside world by performing actions. Every time an agent `.think()`s, it will generate and run one of the `<Action>`s it has declared. Under the hood, this uses the LLM's tool calling facility.

Each action has a name, description, `zod` schema, examples, and handler, all of which are optional. When appropriate params are provided to the `<Action>` component, the agent's cognitive loop is capable of generating the function call and typed arguments for your handler.

The most common type of action is `chat`, which corresponds to the agent sending a simple chat message.

The frontends that the agent is connected to will render each action message accordingly. For example, when the agent emits a chat message, the character on the screen might speak the line.

By default, when an agent performs an action, it will simply log that action in its message history and broadcast it to the rooms it is in. Defining a custom handler allows the agent to override this behavior to perform arbitrary asynchronous behaviors before comitting the new action, or choosing to discard it outright.

```tsx
import { z } from 'zod';
export default () => (
  <Agent>
    <Action
      type="fetchRequest"
      description="Perform an HTTP request to the given url"
      schema={
        z.object({
          url: z.string()
        })
      }
      handler={async (e) => {
        const { agent, message } = e.data;
        const { args } = message;
        
        // perform the fetch
        const req = await fetch(args.url);
        const {ok, statusCode} = req;
        if (ok) {
          const text = await req.text();
          
          // commit the action to the message history
          const newMessage = {
            ...message,
            args: {
              ...args,
              result: {
                statusCode,
                text,
              },
            },
          };
          await agent.addAction(newMessage);
          
          // have the agent explain the result of the fetch request
          await agent.monologue('Briefly explain the result of the HTTP request');
        } else {
          console.warn(`failed to fetch: ${statusCode}`);
        }
      }}
    />
  </Agent>
);
```