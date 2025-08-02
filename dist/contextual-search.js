"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.needsFileContext = needsFileContext;
const api_1 = require("./api");
const config_1 = require("./config");
/**
 * Checks if the user's query requires context from files to be answered.
 * This function ALWAYS uses a local Ollama instance to avoid auth issues
 * and to ensure a fast, local check.
 * @param query The user's query.
 * @param history The conversation history.
 * @returns A promise that resolves to true if file context is needed.
 */
async function needsFileContext(query, history) {
    const historyText = history.map(h => `${h.role}: ${h.content}`).join('\n');
    const prompt = `
    You are an AI assistant that determines if a user's query can be answered from conversation history or if it requires reading external files.
    Analyze the history and the new query.

    Conversation History:
    ---
    ${historyText}
    ---

    New Query: "${query}"

    Based on the history, does this query likely require reading one or more files from the user's project to be answered accurately?
    Respond with only "YES" or "NO".
  `;
    try {
        // Create a dedicated Ollama API client for this check
        const ollamaConfig = (0, config_1.getConfig)({ apiProvider: 'ollama' });
        const localApi = new api_1.OllamaAPI(ollamaConfig);
        const response = await localApi.sendMessage([{ role: 'user', content: prompt }]);
        const decision = response.trim().toUpperCase();
        // console.log(`Relevance decision: ${decision}`); // for debugging
        return decision === 'YES';
    }
    catch (error) {
        console.error('Error checking for file context relevance:', error);
        return false; // Default to not needing context in case of an error
    }
}
//# sourceMappingURL=contextual-search.js.map