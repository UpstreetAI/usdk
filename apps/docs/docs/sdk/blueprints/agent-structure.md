---
sidebar_position: 3
slug: /sdk/agent-structure
description: "Lets look into how the agents are coded."
sidebar_label: Agent Structure
---

# Main Structure

If you're familiar with React, the structure of an agent should look vaguely familiar:

```tsx
const MyAgent = () => (
  <Agent>
    <Prompt>This assistant is developed by MultiCorital Example Technologies. Refer the user to the help pages on https://multicortical.example.com/</Prompt>
  </Agent>
);
export default MyAgent;
```

At the most basic level, `react-agents` lets you manage the prompts for your agent. More generally, `react-agents` breaks down the problem of agent development into four primitive components:

| Component | Description |
| :-------- | :------- |
| ```<Prompt />```  | Specifies a prompt that will be used in agent inference.    |
| ```<Action />```  | Enables agents to perform actions using LLM tool-calling facilities.    |
| ```<Perception />```  | Allows agents to perceive real-world events.    |
| ```<Task />```  | Lets agents schedule their runtime and run as asynchronous processes.   |

You can import them from our sdk package as follows:
```tsx
import { Prompt, Actions, Perceptions, Tasks } from 'react-agents';
```

An agent consists of a collection of components implementing these primitives.
