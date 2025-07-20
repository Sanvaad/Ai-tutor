import { BaseAgent } from './base-agent';

export class HistoryAgent extends BaseAgent {
  constructor() {
    super('HistoryAgent', 'You are a history expert. Help solve history problems and get back accurate information citing reliable resources.');
  }

  async respond(query: string): Promise<string> {
    return super.respond(query);
  }
}