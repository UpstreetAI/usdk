import { useEffect, useState } from 'react';
import { useAgent, useConversation } from 'react-agents';
import { LoopProps } from './types';
import { ReACTEvaluator } from '../evaluators/react-evaluator';
import { PerceptionEvent } from '../classes/perception-event';

export const InfiniteLoop = (props: LoopProps) => {
  const [evaluator, setEvaluator] = useState(() => props.evaluator ?? new ReACTEvaluator());
  const agent = useAgent();
  const contextConversation = useConversation();
  const [conversation, setConversation] = useState(() => contextConversation || new ConversationObject());

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const recurse = async () => {
      const targetAgent = agent.generative({
        conversation,
      });
      const e = new PerceptionEvent({
        targetAgent,
        sourceAgent: null,
        message: null,
      });
      await evaluator.handle(e, {
        signal,
      });
      if (signal.aborted) return;

      await recurse();
    };
    recurse();

    return () => {
      abortController.abort();
    };
  }, []);

  return null;
};