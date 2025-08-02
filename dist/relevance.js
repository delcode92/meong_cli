"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelevantHistory = getRelevantHistory;
/**
 * Filters the conversation history to get the most relevant messages.
 * This is a simple implementation that returns the last few messages.
 * A more advanced version could use an API call to determine relevance.
 * @param userMessage The current user message.
 * @param history The entire conversation history.
 * @param maxHistory The maximum number of messages to return from history.
 * @param api The API instance (for potential future use in more advanced relevance checks).
 * @returns A promise that resolves to an array of relevant messages.
 */
async function getRelevantHistory(userMessage, history, maxHistory, api) {
    if (history.length <= maxHistory) {
        return history;
    }
    return history.slice(-maxHistory);
}
//# sourceMappingURL=relevance.js.map