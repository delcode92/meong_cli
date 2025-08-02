import { Message, Config } from './types';
export declare class OllamaAPI {
    private config;
    private hfClient?;
    constructor(config?: Config);
    /**
     * Gets the messages formatted for the API request, including a system prompt
     * and a limited history (windowed history).
     * @param messages The full array of chat messages.
     * @returns A new array of messages formatted for the API.
     */
    private getWindowedMessages;
    /**
     * Sends a request to the Ollama API and streams the response.
     * This is a generator function that yields content chunks as they arrive.
     * @param messages The array of messages to send.
     */
    streamChat(messages: Message[]): AsyncGenerator<string>;
    private streamChatHuggingFace;
    private streamChatOllama;
    /**
     * Generates an embedding for a given text.
     * @param text The text to generate an embedding for.
     * @returns The embedding vector.
     */
    getEmbedding(text: string): Promise<number[]>;
    /**
     * Sends a request to the Ollama API and waits for the full response.
     * @param messages The array of messages to send.
     * @returns The content of the assistant's response.
     */
    sendMessage(messages: Message[]): Promise<string>;
}
//# sourceMappingURL=api.d.ts.map