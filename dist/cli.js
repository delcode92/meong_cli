"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const readlineSync = __importStar(require("readline-sync"));
const api_1 = require("./api");
const history_1 = require("./history");
class CLI {
    constructor() {
        this.api = new api_1.OllamaAPI();
        this.history = new history_1.HistoryManager();
        this.program = new commander_1.Command();
        this.setupCommands();
    }
    setupCommands() {
        this.program
            .name('ollama-cli')
            .description('CLI for interacting with Ollama SmolLM')
            .version('1.0.0');
        this.program
            .command('chat')
            .description('Start an interactive chat session')
            .option('-s, --stream', 'Enable streaming responses', true)
            .action((options) => this.startChat(options.stream));
        this.program
            .command('ask <question>')
            .description('Ask a single question')
            .option('-s, --stream', 'Enable streaming responses', true)
            .action((question, options) => this.askQuestion(question, options.stream));
        this.program
            .command('history')
            .description('Show conversation history')
            .action(() => this.showHistory());
        this.program
            .command('clear')
            .description('Clear current conversation')
            .action(() => this.clearConversation());
        this.program
            .command('new')
            .description('Start a new conversation')
            .action(() => this.newConversation());
        this.program
            .command('list')
            .description('List all conversations')
            .action(() => this.listConversations());
        this.program
            .command('switch <index>')
            .description('Switch to a specific conversation')
            .action((index) => this.switchConversation(parseInt(index)));
    }
    async startChat(streaming = true) {
        console.log(chalk_1.default.blue('🤖 Ollama SmolLM CLI'));
        console.log(chalk_1.default.gray('Type "exit" to quit, "clear" to clear conversation, "new" for new conversation\n'));
        const conversation = this.history.getCurrentConversation();
        if (conversation.length > 0) {
            console.log(chalk_1.default.yellow('📚 Continuing previous conversation...\n'));
        }
        while (true) {
            const input = readlineSync.question(chalk_1.default.green('You: '));
            if (input.toLowerCase() === 'exit') {
                console.log(chalk_1.default.yellow('👋 Goodbye!'));
                break;
            }
            if (input.toLowerCase() === 'clear') {
                this.clearConversation();
                continue;
            }
            if (input.toLowerCase() === 'new') {
                this.newConversation();
                continue;
            }
            if (input.trim() === '') {
                continue;
            }
            const userMessage = {
                role: 'user',
                content: input
            };
            this.history.addMessage(userMessage);
            try {
                console.log(chalk_1.default.blue('SmolLM: '), { newline: false });
                if (streaming) {
                    await this.streamResponse();
                }
                else {
                    const response = await this.api.sendMessage(this.history.getCurrentConversation());
                    console.log(response);
                    const assistantMessage = {
                        role: 'assistant',
                        content: response
                    };
                    this.history.addMessage(assistantMessage);
                }
                console.log('\n');
            }
            catch (error) {
                console.log(chalk_1.default.red(`\n❌ Error: ${error}`));
            }
        }
    }
    async streamResponse() {
        return new Promise((resolve, reject) => {
            const messages = this.history.getCurrentConversation();
            let fullResponse = '';
            let buffer = '';
            // Make the API call
            this.api.sendMessage(messages)
                .then(response => {
                fullResponse = response;
                console.log(response);
                const assistantMessage = {
                    role: 'assistant',
                    content: fullResponse
                };
                this.history.addMessage(assistantMessage);
                resolve();
            })
                .catch(reject);
        });
    }
    async askQuestion(question, streaming = true) {
        const userMessage = {
            role: 'user',
            content: question
        };
        console.log(chalk_1.default.green('Question: ') + question);
        console.log(chalk_1.default.blue('SmolLM: '), { newline: false });
        try {
            if (streaming) {
                const response = await this.api.sendMessage([userMessage]);
                console.log(response);
            }
            else {
                const response = await this.api.sendMessage([userMessage]);
                console.log(response);
            }
        }
        catch (error) {
            console.log(chalk_1.default.red(`\n❌ Error: ${error}`));
        }
    }
    showHistory() {
        const conversation = this.history.getCurrentConversation();
        if (conversation.length === 0) {
            console.log(chalk_1.default.yellow('📝 No conversation history'));
            return;
        }
        console.log(chalk_1.default.blue('📚 Conversation History:\n'));
        conversation.forEach((message, index) => {
            const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';
            const role = message.role === 'user' ? chalk_1.default.green('You') : chalk_1.default.blue('SmolLM');
            const content = message.content.length > 100
                ? message.content.substring(0, 100) + '...'
                : message.content;
            console.log(`${chalk_1.default.gray(`[${timestamp}]`)} ${role}: ${content}\n`);
        });
    }
    clearConversation() {
        this.history.clearCurrentConversation();
        console.log(chalk_1.default.yellow('🧹 Conversation cleared!'));
    }
    newConversation() {
        this.history.newConversation();
        console.log(chalk_1.default.yellow('🆕 Started new conversation!'));
    }
    listConversations() {
        const conversations = this.history.listConversations();
        console.log(chalk_1.default.blue('📋 All Conversations:\n'));
        conversations.forEach((conv) => {
            const indicator = conv.index === this.history['history'].currentIndex ? '→' : ' ';
            const preview = conv.lastMessage ? `: "${conv.lastMessage}..."` : ': (empty)';
            console.log(`${indicator} ${chalk_1.default.cyan(`[${conv.index}]`)} ` +
                `${conv.messageCount} messages${preview}`);
        });
    }
    switchConversation(index) {
        if (this.history.switchToConversation(index)) {
            console.log(chalk_1.default.yellow(`🔄 Switched to conversation ${index}`));
        }
        else {
            console.log(chalk_1.default.red(`❌ Invalid conversation index: ${index}`));
        }
    }
    run() {
        this.program.parse();
    }
}
exports.CLI = CLI;
//# sourceMappingURL=cli.js.map