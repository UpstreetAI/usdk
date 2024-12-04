import { Evaluator, EvaluatorOpts, EvaluateOpts, ActOpts, DebugOptions } from '../types';
import { generateAgentActionStep } from '../runtime';

export class ReACTEvaluator implements Evaluator {
  hint?: string;
  actOpts?: ActOpts;
  debugOpts?: DebugOptions;
  constructor(opts?: EvaluatorOpts) {
    this.hint = opts?.hint;
    this.actOpts = opts?.actOpts;
    this.debugOpts = opts?.debugOpts;
  }
  async evaluate(opts: EvaluateOpts) {
    const {
      generativeAgent,
      signal,
    } = opts;
    const step = await generateAgentActionStep(
      generativeAgent,
      this.hint,
      this.actOpts,
      this.debugOpts,
    );
    return step;
  }
}