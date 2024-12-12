import React, { useEffect, useState } from 'react';
import { useAgent, useConversation } from '../hooks';
import { LoopProps } from './types';
import { ReACTEvaluator } from '../evaluators/react-evaluator';
// import { PerceptionEvent } from '../classes/perception-event';
import { ConversationObject } from '../classes/conversation-object';
import { DeferConversation } from '../components/core/conversation';

export const ActionLoop = (props: LoopProps) => {
  return (
    // XXX this defer is here because otherwise the agent will try to send messages before a multiplayer connection is established
    // XXX we can remove this if we wait for multiplayer connection before sending new messages
    <DeferConversation>
      <ActionLoopInner {...props}>
        {props.children}
      </ActionLoopInner>
    </DeferConversation>
  );
};
const ActionLoopInner = (props: LoopProps) => {
  if (props.evaluator && (props.hint || props.actOpts)) {
    throw new Error('Cannot provide both evaluator and hint/actOpts');
  }

  const agent = useAgent();
  const hint = props.hint;
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
      console.log('infinite loop tick 1');
      const steps = await generativeAgent.evaluate(evaluator, {
        signal: abortController.signal,
      });
      console.log('infinite loop tick 2');
      if (abortController.signal.aborted) return;

      await recurse();
    };
    recurse();

    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  return null;
};