import { Evaluator, EvaluatorOpts, EvaluateOpts, ActOpts, DebugOptions } from '../types';
import { generateAgentActionStep } from '../runtime';

export class AudioEvaluator implements Evaluator {
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
    const {
      hint,
      actOpts,
      debugOpts,
    } = this;

    // XXX evaluate audio message data context using a lightweight brain (i.e gpt-4o-mini)
    const step = await generateAgentActionStep({
      generativeAgent,
      hint,
      mode: 'basic',
      actOpts,
      debugOpts,
    });
    return step;
  }
}