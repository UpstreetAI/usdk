import React, { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { useAgent, useConversation } from '../../hooks.js';
import { LoopProps } from '../../types/index.js';
import { ReACTEvaluator } from '../../evaluators/react-evaluator.js';
// import { PerceptionEvent } from '../classes/perception-event.js';
import { ConversationObject } from '../../classes/conversation-object.js';
import { Action } from '../../components/core/action.js';
import { ConversationProvider, DeferConversation } from '../../components/core/conversation.js';
import { Prompt } from '../../components/core/prompt.js';


export enum TaskRunnerState {
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  FAILED = 'failed',
}


export type TaskRunnerResult = {
  state: TaskRunnerState;
  result?: any;
}


export const TaskRunner = (props: LoopProps) => {
  return (
    // XXX this defer is here because otherwise the agent will try to send messages before a multiplayer connection is established
    // XXX we can remove this if we wait for multiplayer connection before sending new messages
    <ConversationProvider>
      <DeferConversation>
        <TaskRunnerInner {...props}>
          {props.children}
        </TaskRunnerInner>
      </DeferConversation>
    </ConversationProvider>
  );
};

const TaskRunnerInner = (props: LoopProps) => {
  /* if (props.evaluator && (props.hint || props.actOpts)) {
    throw new Error('Cannot provide both evaluator and hint/actOpts');
  } */

  if (!props.task) {
    throw new Error('Task is required');
  }

  const agent = useAgent();
  const hint = `Task: ${JSON.stringify({
    name: props.task.name,
    description: props.task.description,
  })}`;

  const actOpts = props.actOpts;

  const debugOpts = {
    debug: agent.appContextValue.useDebug(),
  };

  const [evaluator, setEvaluator] = useState(() => props.evaluator ?? new ReACTEvaluator({
    hint,
    actOpts,
    debugOpts
  }));

  const contextConversation = useConversation();
  const [conversation, setConversation] = useState(() => {
    if (contextConversation) {
      return contextConversation;
    } else {
      const conversationId = crypto.randomUUID();
      return new ConversationObject({
        agent,
        getHash: () => conversationId,
      });
    }
  });

  const abortControllerRef = useRef(null);
  const [signal, setSignal] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const [generativeAgent, setGenerativeAgent] = useState(() => agent.generative({
    conversation,
  }));

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setSignal(abortController.signal);

    const recurse = async () => {
      if (isFinished || abortController.signal.aborted) return;

      const res = await generativeAgent.evaluate(evaluator, {
        signal: abortController.signal,
      });
      
      if (isFinished || abortController.signal.aborted) return;

      await recurse();
    };
    recurse();

    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  return (
    !isFinished && <>
      <Prompt>
        Carry out the task: "${props.task.name}"

        After you have succeeded, end the task.
      </Prompt>

      <Action
        type={`End Task: ${props.task.name}`}
        description="Stop a successfully completed task and return the result."
        schema={z.object({})}
        examples={[]}
        handler={async (e: PendingActionEvent) => {
          abortControllerRef.current?.abort();

          setIsFinished(true);

          props.onResult?.({
             state: TaskRunnerState.COMPLETED,
          });
        }}
      />

      <Action
        type={`Cancel Task: ${props.task.name}`}
        description="Stop the task."
        schema={z.object({})}
        examples={[]}
        handler={async (e: PendingActionEvent) => {
          abortControllerRef.current?.abort();

          props.onResult?.({
             state: TaskRunnerState.CANCELLED,
          });
        }}
      />
    </>
  );
};