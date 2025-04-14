import { supabase } from './supabase';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  diagnosis?: string;
  severity?: string;
  previousRecommendations?: string[];
}

export async function sendMessage(
  message: string,
  previousMessages: ChatMessage[] = [],
  context?: ChatContext
) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const messages = [
      ...previousMessages,
      { role: 'user', content: message },
    ];

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          userId: user.data.user.id,
          context,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get response from chat function');
    }

    const data = await response.json();
    return data as ChatMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getChatHistory(limit = 50): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('messages')
      .order('created_at', { ascending: false })
      .limit(limit)
      .single();

    if (error) throw error;
    return data?.messages || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}