import type { ChatResponse } from "@/types/chat"
import { supabase } from "@/lib/supabase"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export const chatApi = {
  async sendMessage(messages: ChatMessage[], sessionId?: string): Promise<ChatResponse> {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          sessionId: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("API Error:", error)
      throw new Error("Failed to send message")
    }
  },

  async createSession(title: string): Promise<ChatSession> {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.session
    } catch (error) {
      console.error("Session creation error:", error)
      throw new Error("Failed to create session")
    }
  },

  async getSessions(): Promise<ChatSession[]> {
    try {
      const response = await fetch("/api/sessions")
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.sessions
    } catch (error) {
      console.error("Sessions fetch error:", error)
      throw new Error("Failed to fetch sessions")
    }
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }))
    } catch (error) {
      console.error("Messages fetch error:", error)
      throw new Error("Failed to fetch messages")
    }
  },
}
