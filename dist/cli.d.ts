export declare class CLI {
    private api;
    private history;
    private program;
    constructor();
    private setupCommands;
    startChat(streaming?: boolean): Promise<void>;
    private streamResponse;
    askQuestion(question: string, streaming?: boolean): Promise<void>;
    showHistory(): void;
    clearConversation(): void;
    newConversation(): void;
    listConversations(): void;
    switchConversation(index: number): void;
    run(): void;
}
//# sourceMappingURL=cli.d.ts.map