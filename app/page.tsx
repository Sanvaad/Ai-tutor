"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Sparkles } from "lucide-react";
import type { Chat, Message } from "@/types/chat";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi } from "@/utils/api";

export default function ChatApp() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionIds, setSessionIds] = useState<Map<string, string>>(new Map());

  // Load chats and sessions on mount
  useEffect(() => {
    const initializeApp = async () => {
      const savedSidebarWidth = localStorage.getItem("ai-tutor-sidebar-width");
      if (savedSidebarWidth) {
        setSidebarWidth(Number.parseInt(savedSidebarWidth));
      }

      try {
        // Try to load sessions from Supabase
        const sessions = await chatApi.getSessions();
        
        if (sessions.length > 0) {
          const chatsFromSessions = sessions.map(session => ({
            id: session.id,
            title: session.title,
            messages: [] as Message[], // Will be loaded when chat is selected
            createdAt: new Date(session.created_at),
            updatedAt: new Date(session.updated_at),
          }));
          
          setChats(chatsFromSessions);
          setActiveChat(chatsFromSessions[0].id);
          
          // Map session IDs
          const sessionMap = new Map<string, string>();
          chatsFromSessions.forEach(chat => {
            sessionMap.set(chat.id, chat.id); // Chat ID = Session ID
          });
          setSessionIds(sessionMap);
        } else {
          // Fallback to localStorage for existing users
          const savedChats = localStorage.getItem("ai-tutor-chats");
          if (savedChats) {
            const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
              ...chat,
              createdAt: new Date(chat.createdAt),
              updatedAt: new Date(chat.updatedAt),
              messages: chat.messages.map((message: any) => ({
                ...message,
                timestamp: new Date(message.timestamp),
              })),
            }));

            const nonEmptyChats = parsedChats.filter(
              (chat: Chat) => chat.messages.length > 0
            );

            if (nonEmptyChats.length > 0) {
              setChats(nonEmptyChats);
              setActiveChat(nonEmptyChats[0].id);
            } else {
              await createNewChatWithSession();
            }
          } else {
            await createNewChatWithSession();
          }
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
        // Fallback to creating a new chat without session
        const newChat: Chat = {
          id: Date.now().toString(),
          title: "New conversation",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setChats([newChat]);
        setActiveChat(newChat.id);
      }
      
      setIsInitialized(true);
    };

    initializeApp();
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (isInitialized && chats.length > 0) {
      localStorage.setItem("ai-tutor-chats", JSON.stringify(chats));
    }
  }, [chats, isInitialized]);

  // Save sidebar width to localStorage
  useEffect(() => {
    localStorage.setItem("ai-tutor-sidebar-width", sidebarWidth.toString());
  }, [sidebarWidth]);

  // Load messages when switching to a chat
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!activeChat || !isInitialized) return;
      
      const currentChat = chats.find(chat => chat.id === activeChat);
      if (!currentChat) return;

      // If chat already has messages, no need to load
      if (currentChat.messages.length > 0) return;

      const sessionId = sessionIds.get(activeChat);
      if (sessionId) {
        try {
          const messages = await chatApi.getSessionMessages(sessionId);
          if (messages.length > 0) {
            const formattedMessages: Message[] = messages.map((msg, index) => ({
              id: `${msg.role}-${Date.now()}-${index}`,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(),
            }));
            
            setChats(prev => prev.map(chat => 
              chat.id === activeChat 
                ? { ...chat, messages: formattedMessages }
                : chat
            ));
          }
        } catch (error) {
          console.error("Failed to load chat messages:", error);
        }
      }
    };

    loadChatMessages();
  }, [activeChat, isInitialized, chats, sessionIds]);

  const createNewChatWithSession = async () => {
    try {
      const session = await chatApi.createSession("New conversation");
      const newChat: Chat = {
        id: session.id,
        title: session.title,
        messages: [],
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at),
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat.id);
      setSessionIds(prev => new Map(prev).set(newChat.id, session.id));
    } catch (error) {
      console.error("Failed to create session:", error);
      // Fallback to local chat
      createNewChat();
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    setChats((prev) => {
      const updated = prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, ...updates, updatedAt: new Date() }
          : chat
      );
      return updated;
    });
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => {
      const filtered = prev.filter((chat) => chat.id !== chatId);
      if (activeChat === chatId && filtered.length > 0) {
        setActiveChat(filtered[0].id);
      } else if (filtered.length === 0) {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: "New conversation",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setActiveChat(newChat.id);
        return [newChat];
      }
      return filtered;
    });
  };

  const renameChat = (chatId: string, newTitle: string) => {
    updateChat(chatId, { title: newTitle });
  };

  const addMessage = (chatId: string, message: Message) => {
    setChats((prev) => {
      const updated = prev.map((chat) => {
        if (chat.id === chatId) {
          const newMessages = [...chat.messages, message];
          return {
            ...chat,
            messages: newMessages,
            updatedAt: new Date(),
          };
        }
        return chat;
      });
      return updated;
    });
  };

  const updateChatTitle = (chatId: string, firstMessage: string) => {
    const title =
      firstMessage.length > 30
        ? firstMessage.substring(0, 30) + "..."
        : firstMessage;
    updateChat(chatId, { title });
  };

  const currentChat = chats.find((chat) => chat.id === activeChat);

  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center animate-pulse">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-slate-600 dark:text-slate-400">
            Loading AI Tutor...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: sidebarWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-r border-slate-200 dark:border-slate-800"
          >
            <ChatSidebar
              chats={chats}
              activeChat={activeChat}
              onSelectChat={setActiveChat}
              onDeleteChat={deleteChat}
              onRenameChat={renameChat}
              onNewChat={createNewChatWithSession}
              width={sidebarWidth}
              onWidthChange={setSidebarWidth}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  {currentChat?.title || "AI Tutor"}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your intelligent learning companion
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={createNewChatWithSession}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </motion.div>

        {/* Chat Interface */}
        <div className="flex-1 min-h-0">
          {currentChat ? (
            <ChatInterface
              key={currentChat.id}
              chat={currentChat}
              onAddMessage={addMessage}
              onUpdateTitle={updateChatTitle}
              sessionId={sessionIds.get(currentChat.id)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center max-w-md mx-auto p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                  <Sparkles className="h-10 w-10 text-white" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent mb-4"
                >
                  Welcome to AI Tutor
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"
                >
                  Your intelligent learning companion is ready to help you
                  understand complex topics, solve problems, and accelerate your
                  learning journey.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={createNewChatWithSession}
                    className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Start Learning
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
