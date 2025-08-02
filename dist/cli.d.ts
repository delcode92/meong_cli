export declare class CLI {
    private api;
    private history;
    private program;
    private config;
    constructor();
    private setupCommands;
    startChat(streaming?: boolean): Promise<void>;
    private runPipedChat;
    private runInteractiveChat;
    private streamResponse;
    askQuestion(question: string, streaming?: boolean): Promise<void>;
    handleExec(command: string, inChat?: boolean): Promise<void>;
    handleFileAnalysis(filePath: string, streaming?: boolean, inChat?: boolean, question?: string): Promise<void>;
    showHistory(): void;
    clearConversation(): void;
    newConversation(): void;
    listConversations(): void;
    switchConversation(index: number): void;
    run(): void;
}
//# sourceMappingURL=cli.d.ts.map