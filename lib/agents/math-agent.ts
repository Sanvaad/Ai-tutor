import { BaseAgent } from './base-agent';
import { safeEval } from '../tools/calculator';

export class MathAgent extends BaseAgent {
  constructor() {
    super('MathAgent', 'You are a math expert. Help solve math problems and equations.');
  }

  async respond(query: string): Promise<string> {
    return super.respond(query);
  }
}