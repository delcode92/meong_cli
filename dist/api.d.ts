import { Message } from './types';
export declare class OllamaAPI {
    private config;
    /**
     * Sends a request to the Ollama API and streams the response.
     * This is a generator function that yields content chunks as they arrive.
     * @param messages The array of messages to send.
     */
    streamChat(messages: Message[]): AsyncGenerator<string>;
    /**
     * Sends a request to the Ollama API and waits for the full response.
     * @param messages The array of messages to send.
     * @returns The content of the assistant's response.
     */
    sendMessage(messages: Message[]): Promise<string>;
}
//# sourceMappingURL=api.d.ts.map