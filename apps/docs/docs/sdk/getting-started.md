---
sidebar_position: 2
slug: /sdk/getting-started
sidebar_label: Getting Started
---

# Getting Started

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 21 or above:
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.

:::tip

Intall [NVM (node version manager)](https://github.com/nvm-sh/nvm) for quick install and use of different node versions via the command line.

:::

### Install
Lets start by installing the sdk globally:
```
npm i -g usdk
```

### Login

First lets log in to your account as you must be logged in to create an agent.
```bash
usdk login
```

You will be redirected to a browser window in order to login, once you logged in successfully you can close the browser window. Return to the terminal window and you should see the following message: ```Successfully logged in.```

In order to logout just run: ```usdk logout```

### Create
Now, lets create your first agent by running:
```bash
usdk create MyAgent
```
Once the agent is created, you should see the following message:
```
done creating project: MyAgent
```

### Run
To run your agent, enter the agents directory:
```
cd MyAgent
```

and then run it locally:
```bash
usdk dev chat
```

The `-u` flag signifies that we should 

### Structure

If you're familiar with React, the structure of an agent should also look familiar:

```tsx
const MyAgent = () => (
  <Agent>
    <Prompt>This assistant is developed by MultiCorital Example Technologies. Refer the user to the help pages on https://multicortical.example.com/</Prompt>
  </Agent>
);
export default MyAgent;
```

At the most basic level, `react-agents` lets you manage the prompts for your agent. More generally, `react-agents` breaks down the problem of agent development into four primitive components:

#### `<Prompt>` Specifies a prompt that will be used in agent inference.

#### `<Action>` Enables agents to perform actions using LLM tool-calling facilities.

#### `<Perception>` Allows agents to perceive real-world events.

#### `<Task>` Lets agents schedule their runtime and run as asynchronous processes.

### Deploy
To deploy your agent and make it public you need to run the following command from the agent directory:
```bash
usdk deploy
```
Now that your agent is published, you can connect to it using our ```chat``` command:

```bash
usdk chat 9dec9a2a-c13f-4efd-be8e-20a8d1d9f26e
```
Where the ```9dec9a2a-c13f-4efd-be8e-20a8d1d9f26e``` is the ```guid``` of your deployed agent.

### Web
Once you agent is deployed you can search and find it on our ready-made web interface mentioned above:

#### [https://chat.upstreet.ai](https://chat.upstreet.ai)

or go straight to the agents public rofile page:

#### [https://chat.upstreet.ai/agents/Alex Reynolds](https://chat.upstreet.ai/agents/Alex%20Reynolds)

where ```Alex Raynolds``` is the **unique** name of the agent.

