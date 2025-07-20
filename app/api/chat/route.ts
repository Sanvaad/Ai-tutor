import { NextRequest, NextResponse } from 'next/server';
import { TutorAgent } from '@/lib/agents/tutor-agent';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Missing or invalid messages' },
        { status: 400 }
      );
    }

    const tutorAgent = new TutorAgent();
    const response = await tutorAgent.route(messages);

    // Store the conversation in Supabase if sessionId is provided
    if (sessionId) {
      try {
        // Get the latest user message
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        
        if (lastUserMessage) {
          // Store user message
          await supabase.from('messages').insert({
            chat_id: sessionId,
            role: 'user',
            content: lastUserMessage.content
          });

          // Store assistant response
          await supabase.from('messages').insert({
            chat_id: sessionId,
            role: 'assistant',
            content: response.response
          });

          // Update session timestamp
          await supabase
            .from('chats')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', sessionId);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue without throwing - the chat should still work even if DB fails
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}