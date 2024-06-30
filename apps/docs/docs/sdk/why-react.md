---
sidebar_position: 4
slug: /sdk/why-react
sidebar_label: Why React?
---

# Why React?

We found that React is very well suited to:
## Context management

We have limited context windows and limited compute and memory to run them. Running an effective agent is largely an art of ensuring that the agent has the right data, in the right structure, to perform its task.

The problem can be formulated as rendering a prompt.

## Memory management

Although it is possible to build useful agents with static prompts and a direct interface to the user, more powerful use cases involve dynamically interfacing with long term memory systems (such as RAG), external APIs, and broader systems like the internet. This data must be fetched and translated into a form the agent can understand. The more complex the task, the more data it requires, and the more complex the filtering we must perform.

That is, much of the work of building agents is memory management.

## Input interface

The traditional input interface to an AI agent is a chat stream. In the real world this is rarely a complete solution. We want our agents to not only reply to our chats, but take in inputs from other interfaces and act accordingly.

Many inputs can be reduced to layer on top of a chat interface -- for example, we can transcribe media to text before we pass it off to an agent. Other use cases benefit from multimodal models that skip the translation step. However, we also want our agents to respond to API requests, video streams, other agents, and more.

The ideal agent framework should make it easy for an agent to receive and respond to these inputs.

## Tool interfaces

For an agent to be useful outside of a chat window, it needs to be able to perform actions in the real world: calling APIs, using tools, posting data. Additionally, this interface usually needs to be bidirectional. It is not enough for an agent to search the web. It also also needs to read, remember, and act on the results.

Function calling with structured outputs is a great way to accomplish this, but each tool usually requires a programmer to build a unique integration and translation layer that is not easily shareable or composable.

## Flexibility

AI technology is evolving at a rapid pace. Improved models, architectures, and techniques are being developed every week. To realistically leverage this innovation in a maintainable, we would like to build our agents out of loosely composed components that can be swapped, evaluated, and upgraded independently.

Using a different model, memory, or chain of thought technique should be a matter of configuration, not coding.

## Security

Agents are a powerful technology. Just as we have security boundaries for users and software, we need equally strong if not stronger security boundaries for agents. Unlike an interface delivered to a user, or a program written by a programmer, the generalizability of agents stems from their ability to act in ways unforseen by the developer. This is a feature! And securing it is a nontrivial problem.

Notably, much of the current AI agent architecture is built on Python, which (unlike, for example Javascript) was not designed to be secure. Although it is possible to add layers of security, such as virtual machines, this is complicated (it has its own discipline), inefficient (in computing resources), and a moving target (unpatched services are a moving target).

## Developer experience

Almost all areas in software development benefit from rapid development loops, but it's especially critical in the parts most visible to the user: graphical interfaces and agents in particular. When developing an agent, we should be able to test and evaluate changes in realtime, or we risk not understanding the effects of our changes on the agent's behavior.

A great deal of time has been put into creating a strong development loop for, say, web site development, but comparatively little for developing agents. We should be able to send an agent URL for testing as easily as we send a Figma design.

## Evaluation

When agents perform business functions in the real world, we need to be able to evaluate their performance. There is a robust ecosystem of evaluation frameworks focused on AI training, without which we would not be able to improve models.

However, there is comparatively little available to agent developers. It would be nice if we could write and deploy tests for our agents so that we can understand and improve their performance on the metrics we care about.




