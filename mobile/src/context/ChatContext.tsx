import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
import { subscribeToNotifications, disconnectWebSocket } from '../services/websocket';

export interface Participant {
  id: string;
  email: string;
  display_name: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  is_group: boolean;
  display_title: string;
  participants: Participant[];
  last_message: any;
  created_at: string;
  updated_at: string;
}

interface ChatContextType {
  conversations: Conversation[];
  loading: boolean;
  refreshConversations: () => Promise<void>;
  createDirectChat: (userId: string) => Promise<Conversation>;
  createGroupChat: (title: string, userIds: string[]) => Promise<Conversation>;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getConversations();
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshConversations();
      // Subscribe to notifications for real-time updates
      subscribeToNotifications((data: any) => {
        if (data.type === 'new_conversation' || data.type === 'new_message') {
          refreshConversations();
        }
      }).catch(console.error);
    } else {
      setConversations([]);
      disconnectWebSocket();
    }
  }, [user, refreshConversations]);

  async function createDirectChat(userId: string): Promise<Conversation> {
    const res = await api.createConversation([userId], false);
    const conv = res.data.conversation;
    await refreshConversations();
    return conv;
  }

  async function createGroupChat(title: string, userIds: string[]): Promise<Conversation> {
    const res = await api.createConversation(userIds, true, title);
    const conv = res.data.conversation;
    await refreshConversations();
    return conv;
  }

  return (
    <ChatContext.Provider value={{ conversations, loading, refreshConversations, createDirectChat, createGroupChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChats() {
  return useContext(ChatContext);
}
