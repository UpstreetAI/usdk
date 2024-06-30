---
sidebar_position: 1
slug: /sdk/intro
sidebar_label: Intro & Quick Start
---

# Upstreet SDK

## Intro

Upstreet SDK ( usdk ) is the first react-based SDK for building and deploying headless AI agents, locally and in the cloud.

Agents are intelligent entities implemented as a React renderer, allowing them to perceive events and perform actions. React components allow for easy composition, customization, and sharing of every part of the stack, while retaining the full flexibility of Typescript to dig down to a lower level.

# How it works

Before we go any further, let's get you set up with the SDK in case you'd like to follow along.
The development workflow of working with `react-agents` should feel familiar if you've used a web-based framework:

## Quick Start

First make sure [Node.js](https://nodejs.org/en/download/) version 21 or above installed and then:

Install the sdk:
```bash
npm i -g usdk
```

Login to our system:
```bash
usdk login
```

Create your agent:
```bash
usdk create MyAgent
```

Enter agent directory:
```bash
cd ./agents/MyAgent
```

Start local chat:
```bash
usdk dev chat
```

The `-u` flag signifies that we should open a browser UI for interacting with the agent.