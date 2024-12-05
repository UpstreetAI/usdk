import React, { useState } from 'react';
import { useAgent } from '../hooks';
import { Perception } from '../components/base-components';
import { LoopProps } from './types';
import { BasicEvaluator } from '../evaluators/basic-evaluator';

export const ChatLoop = (props: LoopProps) => {
  if (props.evaluator && (props.hint || props.actOpts)) {
    throw new Error('Cannot provide both evaluator and hint/actOpts');
  }

  const agent = useAgent();
  const hint = props.hint;
  const actOpts = props.actOpts;
  const debugOpts = {
    debug: agent.appContextValue.useDebug(),
  };
  const [evaluator, setEvaluator] = useState(() => props.evaluator ?? new BasicEvaluator({
    hint,
    actOpts,
    debugOpts,
  }));

  // use a lightweight evaluator for incoming audio messages
  // since the incoming audio messages are at a much more frequent rate, added cost of transcribing audio message 
  const [audioEvaluator, setAudioEvaluator] = useState(() => props.audioEvaluator ?? new BasicEvaluator({
    hint,
    actOpts,
    debugOpts,
  }));

  return (
    <>
      <Perception
        type="say"
        handler={async (e) => {
          const { targetAgent } = e.data;

          const abortController = new AbortController();
          const { signal } = abortController;
          
          await targetAgent.evaluate(evaluator, {
            signal,
          });
        }}
      />
      <Perception
        type="audiomessage"
        handler={async (e) => {
          const { targetAgent } = e.data;

          const abortController = new AbortController();
          const { signal } = abortController;

          // await targetAgent.evaluate(audioEvaluator, {
          //   signal,
          // });
        }}
      />
      <Perception
        type="nudge"
        handler={async (e) => {
          const { targetAgent, message } = e.data;
          const {
            args,
          } = message;
          const targetUserId = (args as any)?.targetUserId;
          // if the nudge is for us
          if (targetUserId === e.data.targetAgent.agent.id) {
            const abortController = new AbortController();
            const { signal } = abortController;

            await targetAgent.evaluate(evaluator, {
              signal,
            });
          }
        }}
      />
    </>
  );
};