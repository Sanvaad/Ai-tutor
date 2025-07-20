import { BaseAgent } from './base-agent';
import { MathAgent } from './math-agent';
import { PhysicsAgent } from './physics-agent';
import { ChemistryAgent } from './chemistry-agent';
import { HistoryAgent } from './history-agent';

const MAX_MESSAGES = 10;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ClassificationResult {
  subject: 'MathAgent' | 'PhysicsAgent' | 'ChemistryAgent' | 'HistoryAgent' | 'Unknown';
  reason: string;
}

interface TutorResponse {
  agent: string;
  response: string;
  reason: string;
}

export class TutorAgent extends BaseAgent {
  private mathAgent: MathAgent;
  private physicsAgent: PhysicsAgent;
  private chemistryAgent: ChemistryAgent;
  private historyAgent: HistoryAgent;

  constructor() {
    super('TutorAgent', `
      You are a subject classifier for a multi-agent tutor system. Given a student query, your job is to identify the appropriate subject agent that should handle it.

      Available agents:
      - MathAgent: Arithmetic, algebra, calculus, equations, statistics.
      - PhysicsAgent: Force, motion, energy, mass, velocity, Newton's laws.
      - ChemistryAgent: Atoms, molecules, reactions, periodic table, acids and bases.
      - HistoryAgent: Historical events, timelines, famous leaders, ancient civilizations.

      Respond in the following JSON format:
      {
          "subject": "MathAgent" | "PhysicsAgent" | "ChemistryAgent" | "HistoryAgent" | "Unknown",
          "reason": "<short explanation>"
      }
    `);
    
    this.mathAgent = new MathAgent();
    this.physicsAgent = new PhysicsAgent();
    this.chemistryAgent = new ChemistryAgent();
    this.historyAgent = new HistoryAgent();
  }

  async route(messages: Message[]): Promise<TutorResponse> {
    // Trim message history to fit under message limit
    const trimmedMessages = this.trimMessages(messages);

    // Extract latest question from user
    let userQuery = '';
    for (let i = trimmedMessages.length - 1; i >= 0; i--) {
      if (trimmedMessages[i].role === 'user') {
        userQuery = trimmedMessages[i].content;
        break;
      }
    }

    if (!userQuery) {
      return {
        agent: 'Unknown',
        response: 'No user question found in the message history.',
        reason: 'Missing user query.'
      };
    }

    // Send classification request
    const classificationPrompt = [
      ...trimmedMessages,
      {
        role: 'user' as const,
        content: `Classify the following query (Keep in mind the previous messages as well):
        Query: ${userQuery}

        Respond in this JSON format:
        {
            "subject": "MathAgent" | "PhysicsAgent" | "ChemistryAgent" | "HistoryAgent" | "Unknown",
            "reason": "<short explanation>"
        }`
      }
    ];

    try {
      const rawResponse = await super.respond(
        classificationPrompt.map(msg => `${msg.role}: ${msg.content}`).join('\n')
      );
      
      // Clean up the response to extract JSON
      const cleanResponse = rawResponse
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      // Try to extract JSON from response if it's embedded in text
      let jsonMatch = cleanResponse.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      if (!jsonMatch) {
        // Try a more greedy approach for nested objects
        jsonMatch = cleanResponse.match(/\{[\s\S]*?\}(?=\s*$|\s*[^}]|$)/);
      }
      const jsonString = jsonMatch ? jsonMatch[0] : cleanResponse;
      
      let data: ClassificationResult;
      try {
        data = JSON.parse(jsonString);
      } catch (parseError) {
        // If JSON parsing fails, try to find a valid JSON object more carefully
        const lines = cleanResponse.split('\n');
        let jsonLines: string[] = [];
        let inJson = false;
        let braceCount = 0;
        
        for (const line of lines) {
          if (line.trim().startsWith('{')) {
            inJson = true;
            braceCount = 0;
          }
          
          if (inJson) {
            jsonLines.push(line);
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;
            
            if (braceCount === 0 && line.includes('}')) {
              break;
            }
          }
        }
        
        const recoveredJson = jsonLines.join('\n');
        data = JSON.parse(recoveredJson);
      }
      const subject = data.subject || 'Unknown';
      const reason = data.reason || 'No reason provided.';

      let result: string;

      switch (subject) {
        case 'MathAgent':
          result = await this.mathAgent.respond(reason + userQuery);
          break;
        case 'PhysicsAgent':
          result = await this.physicsAgent.respond(reason + userQuery);
          break;
        case 'ChemistryAgent':
          result = await this.chemistryAgent.respond(reason + userQuery);
          break;
        case 'HistoryAgent':
          result = await this.historyAgent.respond(reason + userQuery);
          break;
        default:
          const fallbackAgent = new BaseAgent(
            'BaseAgent',
            'This question is out of scope/not related to subjects, respond accordingly and stay on topic itself and try not to explain/expand on it too much. Politely ask them to stay on topic and show what all agents you have. (Math, Physics, History, Chemistry), Do respond politely to greetings and just try to steer the conversation in the right direction if user is going offtopic.'
          );
          result = await fallbackAgent.respond(userQuery);
      }

      return {
        agent: subject,
        response: result,
        reason: reason
      };

    } catch (error) {
      return {
        agent: 'Unknown',
        response: `Classification failed. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        reason: 'Gemini classification failed.'
      };
    }
  }

  private trimMessages(messages: Message[]): Message[] {
    // Limit by message count
    if (messages.length > MAX_MESSAGES) {
      return messages.slice(-MAX_MESSAGES);
    }
    return messages;
  }
}