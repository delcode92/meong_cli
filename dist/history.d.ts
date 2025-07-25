import { Message } from './types';
export declare class HistoryManager {
    private config;
    private history;
    constructor();
    private loadHistory;
    private saveHistory;
    getCurrentConversation(): Message[];
    addMessage(message: Message): void;
    newConversation(): void;
    clearCurrentConversation(): void;
    clearAllHistory(): void;
    getConversationCount(): number;
    switchToConversation(index: number): boolean;
    listConversations(): Array<{
        index: number;
        messageCount: number;
        lastMessage?: string;
    }>;
}
//# sourceMappingURL=history.d.ts.map