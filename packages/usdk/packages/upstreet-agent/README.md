# Upstreet Agent

This README provides instructions for setting up and customizing your [Upstreet Agent](https://www.upstreet.ai/), initialized with `usdk create`.

## Prerequisites

Before you begin, ensure you have the following:

- [Upstreet SDK](https://www.upstreet.ai/sdk) installed via npm
- An active login to the Upstreet SDK
- Sufficient [Credits](https://www.upstreet.ai/credits) to create and interact with agents

## Key Files and Customization

### 1. wrangler.toml

It is highly recommended not to modify this configuration file manually. Following is a breakdown of some important variables within it:

- `AGENT_JSON`: Contains essential agent data. The "id" key must never be modified. Manual modifications might break your agent, so proceed with caution if changes are required.
- `WALLET_MNEMONIC`: Customize as needed
- `WORKER_ENV`: Defines the agent's current environment

> ⚠️ Never modify `AGENT_TOKEN`, `SUPABASE_URL`, or `SUPABASE_PUBLIC_API_KEY` unless you know exactly what you're doing!

The file is located at the root of the agent directory i.e `myAgent/wrangler.toml`.

### 2. agent.tsx

This is where the magic happens!

Customize your agent's features using our React-based components, located at the root of the agent directory i.e `myAgent/agent.tsx`.

The following is the base structure of an Agent:

```jsx
import React from 'react';
import {
  Agent,
} from 'react-agents';

export default function MyAgent() {
  return (
    <Agent>
      {/* Add features here */}
    </Agent>
  );
}
```

You can easily add or remove features to customize your agent. For example, here's how you can add Text-to-Speech (TTS) capability:

```jsx
import React from 'react';
import {
  Agent,
  TTS,
  // Import more features here
} from 'react-agents';

export default function MyAgent() {
  return (
    <Agent>
      <TTS voiceEndpoint="elevenlabs:scillia:kNBPK9DILaezWWUSHpF9" />
      {/* Add more features here */}
    </Agent>
  );
}
```

This modular approach allows you to easily add, remove, or modify features as needed. Experiment with different components to create an agent that perfectly suits your requirements!

### 3. default-components.tsx

Located at `packages/upstreet-agent/packages/react-agents/default-components.tsx`, this file houses all default agent features. Feel free to create your own custom React components to supercharge your agent with unique capabilities!

The following are some default features an Agent has, which are designed for:

- **DefaultPrompts**: Handles prompt injection based on all the functional components added to the Agent, to guide the Agent's responses.
- **DefaultPerceptions**: Handles how the agent perceives and responds to incoming stimulations from entities i.e messages and nudges.
- **DefaultActions**: Handles chat, social media, and store-related actions that an agent can execute in response to a prompt.
- **DefaultFormatters**: Handles JSON formatting for actions.
- **DefaultGenerators**: Handles media generation capabilities.
- **DefaultSenses**: Provides multimedia perception and web browsing abilities.
- **DefaultDrivers**: Implements phone-related actions (calls and texts).
- **RAGMemory**: Manages the agent's memory system.

These components form the foundation of your agent's capabilities. You can modify or extend them to create a truly unique AI assistant!

## Running and Testing

To run and test your agent:

1. Run `usdk chat [agent-dir]` to start the agent in a local environment.
2. Prompt the agent to perform the specific action you want to test, or use your own testing process to verify its functionality. Additionally, you can write tests using Jest to automate and ensure the reliability of your agent's features.

## Deployment

Ready to unleash your agent onto the world? Simply run:

```
usdk deploy [agent-dir]
```

Your agent will be live and accessible via the provided URL obtained after a successful deployment.

## Need Help?

- Check out our [documentation](https://docs.upstreet.ai)
- Join our [Discord community](https://discord.gg/upstreet)
- Reach out to our support team at support@upstreet.ai

Happy Agent building! 🤖✨