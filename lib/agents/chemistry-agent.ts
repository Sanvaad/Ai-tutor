import { BaseAgent } from './base-agent';

export class ChemistryAgent extends BaseAgent {
  constructor() {
    super('ChemistryAgent', 'You are a chemistry expert. Help solve chemistry problems and equations.');
  }

  async respond(query: string): Promise<string> {
    return super.respond(query);
  }
}