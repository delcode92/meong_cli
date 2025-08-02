import { Message } from './types';
/**
 * Checks if the user's query requires context from files to be answered.
 * This function ALWAYS uses a local Ollama instance to avoid auth issues
 * and to ensure a fast, local check.
 * @param query The user's query.
 * @param history The conversation history.
 * @returns A promise that resolves to true if file context is needed.
 */
export declare function needsFileContext(query: string, history: Message[]): Promise<boolean>;
//# sourceMappingURL=contextual-search.d.ts.map