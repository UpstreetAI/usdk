import React, { useState } from 'react';
import { Perception } from '../components';
import { LoopProps } from './types';
import { BasicEvaluator } from '../evaluators/basic-evaluator';

export const ChatLoop = (props: LoopProps) => {
  const [evaluator, setEvaluator] = useState(() => props.evaluator ?? new BasicEvaluator());
  return (
    <>
      <Perception
        type="say"
        handler={async (e) => {
          await evaluator.handle(e);
          // await e.data.targetAgent.think();
        }}
      />
      <Perception
        type="nudge"
        handler={async (e) => {
          const { message } = e.data;
          const {
            args,
          } = message;
          const targetUserId = (args as any)?.targetUserId;
          // if the nudge is for us
          if (targetUserId === e.data.targetAgent.agent.id) {
            await evaluator.handle(e);
            // await e.data.targetAgent.think();
          }
        }}
      />
    </>
  );
};