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
    async *streamChat(messages) {
        const request = {
            model: this.config.model,
            stream: true,
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
            if (!response.body) {
                throw new Error('No response body');
            }
            const reader = response.body;
            let buffer = '';
            reader.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            if (data.message && data.message.content) {
                                // Emit each content chunk
                                process.stdout.write(data.message.content);
                            }
                        }
                        catch (error) {
                            // Ignore parse errors for incomplete chunks
                        }
                    }
                }
            });
            // Return a promise that resolves when the stream is complete
            return new Promise((resolve, reject) => {
                let fullResponse = '';
                reader.on('data', (chunk) => {
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        if (line.trim()) {
                            try {
                                const data = JSON.parse(line);
                                if (data.message && data.message.content) {
                                    fullResponse += data.message.content;
                                }
                                if (data.done) {
                                    resolve();
                                    return;
                                }
                            }
                            catch (error) {
                                // Ignore parse errors for incomplete chunks
                            }
                        }
                    }
                });
                reader.on('error', reject);
                reader.on('end', () => resolve());
            });
        }
        catch (error) {
            throw new Error(`Failed to connect to Ollama API: ${error}`);
        }
    }
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