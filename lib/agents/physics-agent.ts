import { BaseAgent } from './base-agent';
import { PHYSICS_CONSTANTS, PhysicsConstantKey } from '../tools/constants';

export class PhysicsAgent extends BaseAgent {
  constructor() {
    super('PhysicsAgent', 'You are a physics expert. Explain physical constants and physics concepts.');
  }

  private getConstantInfo(query: string): string | null {
    const queryLower = query.toLowerCase();
    const allKeys = Object.keys(PHYSICS_CONSTANTS) as PhysicsConstantKey[];
    
    // Simple fuzzy matching - find the best match
    let bestMatch: PhysicsConstantKey | null = null;
    let bestScore = 0;
    
    for (const key of allKeys) {
      if (queryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(queryLower)) {
        const score = queryLower.length / key.length;
        if (score > bestScore && score > 0.3) {
          bestScore = score;
          bestMatch = key;
        }
      }
    }

    if (bestMatch) {
      const constant = PHYSICS_CONSTANTS[bestMatch];
      return `**${bestMatch.charAt(0).toUpperCase() + bestMatch.slice(1)}**\n` +
             `- Symbol: \`${constant.symbol}\`\n` +
             `- Value: \`${constant.value} ${constant.unit}\`\n` +
             `- Description: ${constant.description}`;
    }
    
    return null;
  }

  async respond(query: string): Promise<string> {
    const constantInfo = this.getConstantInfo(query);
    if (constantInfo) {
      return constantInfo;
    }
    return super.respond(query);
  }
}