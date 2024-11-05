# An Upstreet Agent project

This is an [Upstreet Agent](https://www.upstreet.ai/) project bootstrapped with `usdk create`.

This README provides instructions for customizing and running your Upstreet Agent.

## Prerequisites

Before you begin, ensure you have the following:

- [Upstreet SDK](https://www.upstreet.ai/sdk) installed via npm
- An active login to the Upstreet SDK
- Sufficient [credits](https://www.upstreet.ai/credits) to create and interact with agents

Read more in our [documentation](https://docs.upstreet.ai/install).

## Key Files and Customization

### 1. [`wrangler.toml`](./wrangler.toml)

We **do not recommend** modifying this configuration file manually. Following is a breakdown of some important variables within it:

- `AGENT_JSON`: Contains essential Agent data. The "id" key must never be modified. Manual modifications might break your Agent, so proceed with caution if changes are required.
- `WALLET_MNEMONIC`: Customize as needed
- `WORKER_ENV`: Defines the Agent's current environment

> ⚠️ Never modify `AGENT_TOKEN`, `SUPABASE_URL`, or `SUPABASE_PUBLIC_API_KEY` unless you know exactly what you're doing!

The file is located at the root of the Agent directory i.e `myAgent/wrangler.toml`.

### 2. [`agent.tsx`](./agent.tsx)

This is where the magic happens!

Customize your Agent's features using our React-based components, located at the root of the Agent directory i.e `myAgent/agent.tsx`.

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

You can easily add or remove features to customize your Agent. For example, here's how you can add Text-to-Speech (TTS) capability:

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
      <TTS
        voiceEndpoint="elevenlabs:scillia:kNBPK9DILaezWWUSHpF9" 
      />
      {/* Add more features here */}
    </Agent>
  );
}
```

This modular approach allows you to easily add, remove, or modify features as needed. Experiment with different components to create an Agent that perfectly suits your requirements!

### 3. [`default-components.tsx`](./packages/upstreet-agent/packages/react-agents/default-components.tsx)

This file houses all default Agent features. Feel free to create your own custom React components to supercharge your Agent with unique capabilities!

The following are some default features an Agent has, which are designed for:

- **DefaultPrompts**: Handles prompt injection based on all the functional components added to the Agent, to guide the Agent's responses.
- **DefaultPerceptions**: Handles how the Agent perceives and responds to incoming stimulations from entities i.e messages and nudges.
- **DefaultActions**: Handles chat, social media, and store-related actions that an Agent can execute in response to a prompt.
- **DefaultFormatters**: Handles JSON formatting for actions.
- **DefaultGenerators**: Handles media generation capabilities.
- **DefaultSenses**: Provides multimedia perception and web browsing abilities.
- **DefaultDrivers**: Implements phone-related actions (calls and texts).
- **RAGMemory**: Manages the Agent's memory system.

These components form the foundation of your Agent's capabilities. You can modify or extend them to create a truly unique AI assistant!

## Running and Testing

To run and test your Agent, run:
```bash
usdk chat <your-agent-directory>
```

Where `<your-agent-directory>` is the **relative path** to the directory containing all your Agent's code. [How to create an Agent](/create-an-agent#file-structure)

This command launches an interactive chat session (REPL-like) with your Agent, where you can input prompts and review responses in real-time.

To exit the chat, type `.exit` in the chat and press the Enter key. Or, you can use the shortcut CTRL+C twice.

*Note: Your AI inferences will not run locally. The Upstreet Agent may consume credits during testing.*

Prompt the Agent to perform the specific action you want to test, or use your own testing process to verify its functionality. Additionally, you can write tests using [Jest](https://jestjs.io/) to automate and ensure the reliability of your Agent's features.

## Deployment

Ready to unleash your Agent onto the world? Simply run:

```bash
usdk deploy <your-agent-directory>
```

Your Agent will be live and accessible via the provided URL obtained after a successful deployment.

## Need Help?

- Check out our [documentation](https://docs.upstreet.ai)
- Join our [Discord community](https://upstreet.ai/usdk-discord)
- Reach out to our support team at [support@upstreet.ai](mailto:support@upstreet.ai)

Happy Agent building! 🤖✨