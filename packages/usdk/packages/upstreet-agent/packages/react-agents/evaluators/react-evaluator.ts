import { Evaluator, EvaluatorOpts, EvaluateOpts } from '../types';
import { generateAgentActionStep } from '../runtime';

export class ReACTEvaluator implements Evaluator {
  hint;
  thinkOpts;
  constructor(opts?: EvaluatorOpts) {
    this.hint = opts?.hint;
    this.thinkOpts = opts?.thinkOpts;
  }
  async evaluate(opts: EvaluateOpts) {
    const {
      generativeAgent,
      signal,
    } = opts;
    const debug = generativeAgent.agent.appContextValue.useDebug();
    const step = await generateAgentActionStep(
      generativeAgent,
      this.hint,
      this.thinkOpts,
      {
        debug,
      },
    );
    return step;
  }
}