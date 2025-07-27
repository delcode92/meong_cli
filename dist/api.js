"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaAPI = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = require("./config");
class OllamaAPI {
    constructor() {
        this.config = (0, config_1.getConfig)();
    }
    /**
     * Sends a request to the Ollama API and streams the response.
     * This is a generator function that yields content chunks as they arrive.
     * @param messages The array of messages to send.
     */
    async *streamChat(messages) {
        const request = {
            model: this.config.model,
            stream: true,
            messages: messages
        };
        try {
            console.log("====>data:", JSON.stringify(request));
            const response = await (0, node_fetch_1.default)(this.config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (!response.body) {
                throw new Error('No response body');
            }
            const reader = response.body;
            const decoder = new TextDecoder();
            let buffer = '';
            for await (const chunk of reader) {
                buffer += decoder.decode(chunk, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            if (data.message && data.message.content) {
                                yield data.message.content;
                            }
                            if (data.done) {
                                return; // End the generator
                            }
                        }
                        catch (error) {
                            console.error('\n[Error] Failed to parse stream chunk:', line);
                        }
                    }
                }
            }
        }
        catch (error) {
            throw new Error(`Failed to connect to Ollama API: ${error}`);
        }
    }
    /**
     * Sends a request to the Ollama API and waits for the full response.
     * @param messages The array of messages to send.
     * @returns The content of the assistant's response.
     */
    async sendMessage(messages) {
        const request = {
            model: this.config.model,
            stream: false,
            messages: messages
        };
        try {
            const response = await (0, node_fetch_1.default)(this.config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.message.content;
        }
        catch (error) {
            throw new Error(`Failed to connect to Ollama API: ${error}`);
        }
    }
}
exports.OllamaAPI = OllamaAPI;
//# sourceMappingURL=api.js.map