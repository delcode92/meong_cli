export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatRequest {
  model: string;
  stream: boolean;
  messages: Message[];
}

export interface ChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface Config {
  apiUrl: string;
  model: string;
  maxHistory: number;
  historyFile: string;
}

export interface ConversationHistory {
  conversations: Message[][];
  currentIndex: number;
}