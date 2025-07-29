export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatRequest {
  model: string;
  stream: boolean;
  messages: Message[];
  temperature?: number;
  top_p?: number;
  repeat_penalty?: number;
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
  temperature: number;
  top_p: number;
  repeat_penalty: number;
}

export interface ConversationHistory {
  conversations: Message[][];
  currentIndex: number;
}

export interface EmbeddingRequest {
  model: string;
  prompt: string;
}

export interface EmbeddingResponse {
  embedding: number[];
}
