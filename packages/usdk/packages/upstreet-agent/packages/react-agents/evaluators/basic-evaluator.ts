import { Evaluator, EvaluatorOpts, EvaluateOpts, ActOpts } from '../types';
import { generateAgentActionStep } from '../runtime';

export class BasicEvaluator implements Evaluator {
  hint?: string;
  actOpts?: ActOpts;
  constructor(opts?: EvaluatorOpts) {
    this.hint = opts?.hint;
    this.actOpts = opts?.actOpts;
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
      this.actOpts,
      {
        debug,
      },
    );
    return step;
  }
}