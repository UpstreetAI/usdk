# AI Agent bindings

This readme describes how the AI agent SDK binds to the engine core.

## Lore manager

The lore manager tracks the world state that LLM-based inhabit. It contains details of the current scene, the characters and objects in it, and the user's role.

## Provider adapters

We support an agnostic approach to LLM design, making models easy to swap out.

The pattern we use effectively normalizes all LLM models into the OpenAI API standard, with messages having a role and content.

```
{
  "type": "assistant",
  "content": "Hello, there!"
}
```

We map this format back and forth for each LLM and provider we use.

## Lore runtime

A lore runtime represents the behavior of the AI system bound to the engine.

Currently there are two lore runtimes:

- Story, used in the Upstreet TV product
- Chat, used in the Upstreet Chat product

Each lore runtime has its own set of prompts, completions, parsing, and message handler bindings.

## Agent

An agent is an actor in the world. An agent usually has lore associated in the lore manager, which describes its metadata to the LLM.

An agent also usually has an identifier like a name or id which can be referenced in prompts and completions, in order to implement message binding.

## Binding

Binding refers to the process of associating a "raw message" coming from the LLM with the engine objects referenced in the message.

Various heuristics are used to perform this association even when the LLM makes slight mistakes in the.

It is possible for binding to fail, in which case we generally will attempt to re-roll the synthesis of a message and hope for better luck next time.

## Rendering

Messages must usually be presented to the user, and this is done via React (effectively a React functional compoent for each message type).

This is used to, for example, display a rich media message in the Chat UI.

## Preloading

Preloading refers to the process of taking a (usually "bound") message and asynchronously fetching additional data which will be needed during its execution.

Preloading generally happens automatically for N messages ahead in the buffer message queue (which may be less than the full buffer length, to control costs).

## Buffering

Buffering refers to the process of generating addtional messages for the AI system ahead of time, for performance reasons. For example, we make wish to buffer up additional dialogue and perform its TTS synthesis before it is the character's turn to speak, in order to.

## Execution

Executing a message means to perform its effect in the engine.

Generally this will mean interfacing with other managers in the engine, as well as potentially storing the message in the memories system for subsequent recall.

Until a message is executed, it has no effect and can be safely discarded. This is how we support interrupting a conversation in a realtime context (for example, when the user says something).

## Queueing

Queueing refers to the process of generating messages that we intend to potentially execute in the future. The queue size is configurable.

## Conversation

A conversation represents an ongoing computation thread for an LLM director.

A conversation contains past and queue messages in the current LLM stream, and tracks the ongoing buffering, execution, timing, and interruption of messages in the system.

## Messages

A message is an event that occurs in the LLM system. Each messsge has a well-defined unique type, with properties and handlers defining how the message is to be treated in the engine.

## Completers

A completer is part of a lore runtime whose job is to synthesize LLM promopts and generate appropriate new messages given the current lore, past messages, RAG, and any other appropriate strategy.

Each runtime has its own completer.

## Memories

Memories are messages that have been committed to RAG-enabled storage (currently Supabase PGVector).

Generally, memories are stored *both* per-conversation and per-agent, allowing different selective recall strategies during prompt engineering.

## Execution

Message execution involves pulling messages off of the buffer queue, waiting for the message's preload to resolve, running the execute function. Each of these steps is asynchronous and scheduled via the queue manager, allowing for e.g. characters to not speak over each other.

Execution can be either automatic or manual (stepped). In either case, it can be interrupted (cancelled) via `AbortController` and `signal`.
