import { Message } from './types';
import { OllamaAPI } from './api';
/**
 * Finds the most relevant messages from history based on the current message.
 * @param currentMessage The current user message.
 * @param history The entire chat history.
 * @param maxHistory The maximum number of history messages to return.
 * @param api The OllamaAPI instance to use for generating embeddings.
 * @returns A promise that resolves to an array of the most relevant messages.
 */
export declare function getRelevantHistory(currentMessage: Message, history: Message[], maxHistory: number, api: OllamaAPI): Promise<Message[]>;
//# sourceMappingURL=relevance.d.ts.map