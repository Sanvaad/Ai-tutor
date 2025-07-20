import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    available_agents: ['TutorAgent', 'MathAgent', 'PhysicsAgent', 'ChemistryAgent', 'HistoryAgent'],
    status: 'all agents loaded'
  });
}