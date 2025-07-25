import * as fs from 'fs';
import { Message, ConversationHistory } from './types';
import { getConfig } from './config';

export class HistoryManager {
  private config = getConfig();
  private history: ConversationHistory;

  constructor() {
    this.history = this.loadHistory();
  }

  private loadHistory(): ConversationHistory {
    try {
      if (fs.existsSync(this.config.historyFile)) {
        const data = fs.readFileSync(this.config.historyFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Could not load history file, starting fresh');
    }
    
    return {
      conversations: [[]],
      currentIndex: 0
    };
  }

  private saveHistory(): void {
    try {
      fs.writeFileSync(
        this.config.historyFile, 
        JSON.stringify(this.history, null, 2)
      );
    } catch (error) {
      console.warn('Could not save history file');
    }
  }

  getCurrentConversation(): Message[] {
    return this.history.conversations[this.history.currentIndex] || [];
  }

  addMessage(message: Message): void {
    const conversation = this.getCurrentConversation();
    conversation.push({
      ...message,
      timestamp: Date.now()
    });

    // Limit conversation length
    if (conversation.length > this.config.maxHistory) {
      conversation.splice(0, conversation.length - this.config.maxHistory);
    }

    this.saveHistory();
  }

  newConversation(): void {
    this.history.conversations.push([]);
    this.history.currentIndex = this.history.conversations.length - 1;
    this.saveHistory();
  }

  clearCurrentConversation(): void {
    this.history.conversations[this.history.currentIndex] = [];
    this.saveHistory();
  }

  clearAllHistory(): void {
    this.history = {
      conversations: [[]],
      currentIndex: 0
    };
    this.saveHistory();
  }

  getConversationCount(): number {
    return this.history.conversations.length;
  }

  switchToConversation(index: number): boolean {
    if (index >= 0 && index < this.history.conversations.length) {
      this.history.currentIndex = index;
      this.saveHistory();
      return true;
    }
    return false;
  }

  listConversations(): Array<{ index: number; messageCount: number; lastMessage?: string }> {
    return this.history.conversations.map((conv, index) => ({
      index,
      messageCount: conv.length,
      lastMessage: conv.length > 0 ? conv[conv.length - 1].content.substring(0, 50) : undefined
    }));
  }
}