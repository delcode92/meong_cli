import { Message } from './types';
export declare class OllamaAPI {
    private config;
    streamChat(messages: Message[]): AsyncGenerator<string, void, unknown>;
    sendMessage(messages: Message[]): Promise<string>;
}
//# sourceMappingURL=api.d.ts.map