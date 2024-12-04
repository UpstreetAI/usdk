import { Evaluator } from '../types';

export class BasicEvaluator implements Evaluator {
  async handle(e: Event) {
    await (e as any).data.targetAgent.think();
  }
}